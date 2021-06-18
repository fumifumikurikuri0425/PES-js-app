import { useState, useEffect, useRef } from "react";
import EnergyProfile from "../components/EnergyProfile";
import settings from "../settings";
import colorMaps from "../colorMaps";

console.log(settings);

const Bokeh = window.Bokeh;

const initialParams = {
  x: -0.75,
  y: 0.55,
  functionName: "mbp",
  xmin: -2.5,
  xmax: 1.5,
  ymin: -1,
  ymax: 3,
  zmin: -147,
  zmax: 100,
  step: 0.01,
  tone: 20,
  check: 0,
  contour_on: true,
  optimize_on: true,
  colorMap: "Inferno",
};

const apiEndpoint = "http://localhost:8000/";

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

function Ex1() {
  const bokehRoot = useRef(null);
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  let views = null;

  const clearPlot = () => {
    console.log("clear plot!", views);
    const vs = views;
    if (vs) {
      vs.remove();
    }
    views = null;
  };

  const createPlot = async () => {
    const xRange = new Bokeh.DataRange1d({
      range_padding: 0,
    });
    const yRange = new Bokeh.DataRange1d({
      range_padding: 0,
    });

    // create bokeh figure
    const p = Bokeh.Plotting.figure({
      // tools: 'tap',
      x_range: xRange,
      y_range: yRange,
      padding: 0,
      width: 700,
      height: 530,
    });

    p.xgrid[0].grid_line_width = p.ygrid[0].grid_line_width = 0;

    if (data) {
      // convert value types
      params.xmin = parseFloat(params.xmin);
      params.xmax = parseFloat(params.xmax);
      params.ymin = parseFloat(params.ymin);
      params.ymax = parseFloat(params.ymax);
      params.zmin = parseFloat(params.zmin);
      params.zmax = parseFloat(params.zmax);
      params.tone = parseInt(params.tone);

      const colorNums = makeArr(0, 1, params.tone);
      //** Color Map
      const pal = colorNums.map((i) => colorMaps[params.colorMap](i));
      console.log(pal);
      const colorMapper = new Bokeh.LinearColorMapper({
        palette: pal,
        low: params.zmin,
        high: params.zmax,
      });

      const levels = makeArr(params.zmin, params.zmax, params.tone + 1);

      //** draw color bar
      const colorBar = new Bokeh.ColorBar({
        color_mapper: colorMapper,
        major_label_text_font_size: "8pt",
        ticker: new Bokeh.FixedTicker({ ticks: levels }),
        formatter: new Bokeh.PrintfTickFormatter({ format: "%.2f" }),
        label_standoff: 6,
        border_line_color: null,
        location: [0, 0],
      });

      p.add_layout(colorBar, "right");
      //** draw potential energy surface
      const image = p.image({
        image: [data.data.energy],
        x: params.xmin,
        y: params.ymin,
        dw: params.xmax - params.xmin,
        dh: params.ymax - params.ymin,
        color_mapper: colorMapper,
        level: "image",
      });
      //** draw contour line
      if (data.data.contours) {
        const contours = data.data.contours.contours;
        console.log(contours);
        contours.map((contour) => {
          contour.map((c) => {
            const x = c["x_list"];
            const y = c["y_list"];

            p.line({ x: x, y: y, color: "grey", line_width: 1, alpha: 1 });
          });
        });
      }

      const tooltip = [
        ["x", "$x"],
        ["y", "$y"],
        ["energy", "@image"],
      ];
      const ht = new Bokeh.HoverTool({ tooltips: tooltip });
      p.add_tools(ht);

      const cds = new Bokeh.ColumnDataSource({
        data: {
          x: [params.x],
          y: [params.y],
        },
      });
      window.cds = cds;

      //Initial point function
      p.js_event_callbacks["tap"] = [
        {
          execute(event) {
            console.log("tap", event.x, event.y);
            setParams((params) => ({
              ...params,
              x: event.x,
              y: event.y,
            }));

            cds.data.x[0] = event.x;
            cds.data.y[0] = event.y;
            cds.change.emit();
          },
        },
      ];

      //** draw optimize line
      if (data.data.optimizeLine) {
        p.circle({
          x: { field: "x" },
          y: { field: "y" },
          size: 7,
          fill_color: "pink",
          source: cds,
          line_width: 0,
        });

        const x1_list = data.data.optimizeLine["x1_list"];
        const y1_list = data.data.optimizeLine["y1_list"];
        const x2_list = data.data.optimizeLine["x2_list"];
        const y2_list = data.data.optimizeLine["y2_list"];
        const TS = data.data.optimizeLine.TS;
        const EQ = data.data.optimizeLine.EQ;
        p.line({
          x: x1_list,
          y: y1_list,
          line_width: 2,
          color: "#CDDC39",
          alpha: 0.5,
        });

        p.circle({
          x: x1_list[x1_list.length - 1],
          y: y1_list[y1_list.length - 1],
          size: 7,
          fill_color: "lime",
          line_width: 0,
        });

        p.line({
          x: x2_list,
          y: y2_list,
          line_width: 2,
          color: "cyan",
          alpha: 0.5,
        });

        const t1 = new Bokeh.Title({
          text:
            "TS: x=" +
            x1_list[x1_list.length - 1] +
            " y=" +
            y1_list[y1_list.length - 1] +
            " Energy=" +
            TS,

          align: "center",
        });
        p.add_layout(t1, "below");

        const t2 = new Bokeh.Title({
          text:
            "EQ: x=" +
            x2_list[x2_list.length - 1] +
            " y=" +
            y2_list[y2_list.length - 1] +
            " Energy=" +
            EQ,
          align: "center",
        });
        p.add_layout(t2, "below");

        const t3 = new Bokeh.Title({
          text: "Number of calculations=" + data.data.optimizeLine.count,
          align: "center",
        });
        p.add_layout(t3, "below");
      }

      //get x range and y range
      p.x_range.property("start").change.connect((_args, x_range) => {
        console.log("x_range.start", x_range.start);
        setParams((params) => ({
          ...params,
          xmin: x_range.start,
        }));
      });

      p.x_range.property("end").change.connect((_args, x_range) => {
        console.log("x_range.end", x_range.end);
        setParams((params) => ({
          ...params,
          xmax: x_range.end,
        }));
      });

      p.y_range.property("start").change.connect((_args, y_range) => {
        console.log("y_range.start", y_range.start);
        setParams((params) => ({
          ...params,
          ymin: y_range.start,
        }));
      });

      p.y_range.property("end").change.connect((_args, y_range) => {
        console.log("y_range.end", y_range.end);
        setParams((params) => ({
          ...params,
          ymax: y_range.end,
        }));
      });

      window.image = image;
      window.p = p;
    }

    views = await Bokeh.Plotting.show(p, bokehRoot.current);
    return p;
  };

  const handleChange = (event) => {
    let val = event.target.value;

    if (event.target.name === "function_name") {
      const s = settings[val];
      const p = {
        ...s,
        functionName: val,
      };
      setParams({
        ...params,
        ...p,
      });
      return;
    }

    if (event.target.name === "color_map") {
      const c = colorMaps[val];
      const color = {
        ...c,
        colorMap: val,
      };
      setParams({
        ...params,
        ...color,
      });
      return;
    }

    if (event.target.name === "check") {
      val = parseInt(val);
    }

    if (event.target.name === "contour_on") {
      val = event.target.checked;
    }

    if (event.target.name === "optimize_on") {
      val = event.target.checked;
    }

    setParams((params) => ({
      ...params,
      [event.target.name]: val,
    }));
  };

  const handleSubmit = async (event) => {
    console.warn("The form was submitted:", params);
    event.preventDefault();
    clearPlot();
    setIsLoading(true);

    // validation and submit
    const formData = new FormData(event.target);

    const options = {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    delete options.headers["Content-Type"];

    let d = null;
    let jsonData = null;
    try {
      d = await fetch(apiEndpoint, options);
      jsonData = await d.json();
    } catch (e) {
      alert("Error!");
    }
    console.log(jsonData);

    setIsLoading(false);
    setData(jsonData);
  };

  useEffect(() => {
    createPlot();

    return () => {
      clearPlot();
    };
  }, [data]);

  if (isLoading) {
    return <img src="./ZZ5H.gif" />;
  }

  return (
    <div>
      <div>
        <header>
          <a href="/">
            <h1>Potential Energy Surface</h1>
          </a>
        </header>
      </div>

      <div className="f-container">
        <div id="graph" ref={bokehRoot}></div>

        {data && data.data && data.data.optimizeLine && (
          <div className="graph-container">
            <EnergyProfile
              distance={data.data.optimizeLine.Distance_list}
              energy={data.data.optimizeLine.Energy_list}
              tsPoint={data.data.optimizeLine.TS_point}
            ></EnergyProfile>
          </div>
        )}
      </div>

      <form id="form1" onSubmit={handleSubmit}>
        <div>
          <select
            name="function_name"
            value={params.functionName}
            onChange={handleChange}
          >
            <option value={"mbp"}>Muller Brown Potential</option>
            <option value={"pes1"}>PES1</option>
            <option value={"pes2"}>PES2</option>
            <option value={"pes3"}>PES3</option>
            <option value={"pes4"}>PES4</option>
            <option value={"pes5"}>PES5</option>
          </select>
        </div>

        <label>
          xmin:
          <input
            type="text"
            name="xmin"
            value={params.xmin}
            onChange={handleChange}
          />
        </label>

        <label>
          xmax:
          <input
            type="text"
            name="xmax"
            value={params.xmax}
            onChange={handleChange}
          />
        </label>

        <label>
          ymin:
          <input
            type="text"
            name="ymin"
            value={params.ymin}
            onChange={handleChange}
          />
        </label>

        <label>
          ymax:
          <input
            type="text"
            name="ymax"
            value={params.ymax}
            onChange={handleChange}
          />
        </label>

        <div>
          <label>
            zmin:
            <input
              name="zmin"
              type="text"
              size="10"
              value={params.zmin}
              onChange={handleChange}
            />
          </label>

          <label>
            zmax:
            <input
              name="zmax"
              type="text"
              size="10"
              value={params.zmax}
              required
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            color tone:{" "}
            <input
              name="tone"
              type="number"
              size="4"
              value={params.tone}
              min="0"
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <select
            name="color_map"
            value={params.colorMap}
            onChange={handleChange}
          >
            <option value={"Inferno"}>Inferno</option>
            <option value={"Magma"}>Magma</option>
            <option value={"Plasma"}>Plasma</option>
            <option value={"Cividis"}>Cividis</option>
            <option value={"Warm"}>Warm</option>
            <option value={"Cool"}>Cool</option>
            <option value={"CubehelixDefault"}>CubehelixDefault</option>
            <option value={"Rainbow"}>Rainbow</option>
            <option value={"Sinebow"}>Sinebow</option>
            <option value={"Turbo"}>Turbo</option>
            <option value={"Greys"}>Greys</option>
            <option value={"Spectral"}>Spectral</option>
            <option value={"RdYlBu"}>RdYlBu</option>
          </select>
        </div>

        <div>
          contour line:{" "}
          <input
            type="checkbox"
            name="contour_on"
            checked={params.contour_on}
            onChange={handleChange}
          />
        </div>

        <div>
          optimize line:{" "}
          <input
            type="checkbox"
            name="optimize_on"
            checked={params.optimize_on}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>
            Initial x:
            <input
              type="text"
              name="x"
              value={params.x}
              onChange={handleChange}
            />
          </label>

          <label>
            Initial y:
            <input
              type="text"
              name="y"
              value={params.y}
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Newton Raphson step:
          <input
            name="step"
            type="number"
            step="any"
            min="1e-9"
            size="7"
            value={params.step}
            onChange={handleChange}
          />
        </label>

        <div>
          saddle point:{" "}
          <label>
            left{" "}
            <input
              type="radio"
              name="check"
              value={0}
              checked={params.check === 0}
              onChange={handleChange}
            />
          </label>
          <label>
            right{" "}
            <input
              type="radio"
              name="check"
              value={1}
              checked={params.check === 1}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <input type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
}

export default Ex1;
