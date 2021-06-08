import { useState, useEffect, useRef } from "react";
// import { measure } from "skimage";
import * as gPalette from "google-palette";

import * as d3 from "d3";

window.d3 = d3;

const Bokeh = window.Bokeh;

const initialParams = {
  x: -0.75,
  y: 0.55,
  xmin: -2.5,
  xmax: 1.5,
  ymin: -1,
  ymax: 3,
  zmin: -147,
  zmax: 100,
  step: 0.01,
  tone: 20,
  check: 0,
};

const apiEndpoint = "http://localhost:8000/api/test";

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

    // p.x_range.range_padding = p.y_range.range_padding = 0;
    p.xgrid[0].grid_line_width = p.ygrid[0].grid_line_width = 0;

    if (data) {
      // console.log('draw graph!!!', data);
      // console.log('params', params);

      // const pal = gPalette("tol-dv", params.tone).map((c) => `#${c}`);
      const colorNums = makeArr(0, 1, params.tone);
      const pal = colorNums.map((i) => d3.interpolateInferno(i));
      console.log(pal);
      const colorMapper = new Bokeh.LinearColorMapper({
        palette: pal,
        low: params.zmin,
        high: params.zmax,
      });

      const levels = makeArr(params.zmin, params.zmax, params.tone + 1);

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

      const image = p.image({
        image: [data.data.energy],
        x: params.xmin,
        y: params.ymin,
        dw: params.xmax - params.xmin,
        dh: params.ymax - params.ymin,
        color_mapper: colorMapper,
        level: "image",
      });

      const contours = data.data.contours;

      if (contours) {
        console.log(contours);
        contours.map((contour) => {
          contour.map((c) => {
            const x = c["x_list"];
            const y = c["y_list"];
            // console.log(x, y);
            p.line({ x: x, y: y, color: "grey", line_width: 1, alpha: 1 });
          });
          // let x = contour[:, 1] / x_shape * (xmax - xmin) + xmin;
          // let y = contour[:, 0] / y_shape * (ymax - ymin) + ymin;
        });
      }

      console.log(data.data);
      console.log(data.data.optimizeLine);
      if (data.data.optimizeLine) {
        const x1_list = data.data.optimizeLine["x1_list"];
        const y1_list = data.data.optimizeLine["y1_list"];
        const x2_list = data.data.optimizeLine["x2_list"];
        const y2_list = data.data.optimizeLine["y2_list"];
        p.line({
          x: x1_list,
          y: y1_list,
          line_width: 2,
          color: "#009688",
          alpha: 0.5,
        });

        console.log(x1_list[x1_list.length - 1]);
        console.log(y1_list[y1_list.length - 1]);
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

      p.circle({
        x: { field: "x" },
        y: { field: "y" },
        size: 7,
        fill_color: "pink",
        source: cds,
        line_width: 0,
      });

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

      // TODO: add line

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

    if (event.target.name === "check") {
      val = parseInt(val);
    } else if (event.target.name === "zmax" || event.target.name === "zmin") {
      val = parseFloat(val);
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

    const d = await fetch(apiEndpoint, options);
    const jsonData = await d.json();
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
        <h1>Potential Energy Surface</h1>
      </div>

      {/* {isLoading && <img src="./ZZ5H.gif" />} */}
      <div id="graph" ref={bokehRoot}></div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            x:
            <input
              type="text"
              name="x"
              value={params.x}
              onChange={handleChange}
            />
          </label>
          <label>
            y:
            <input
              type="text"
              name="y"
              value={params.y}
              onChange={handleChange}
            />
          </label>
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
            color tone:
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

        <div>
          <input type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
}

export default Ex1;
