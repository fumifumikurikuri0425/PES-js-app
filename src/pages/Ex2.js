import { useState, useEffect, useRef } from "react";
import colorMaps from "../colorMaps";

import * as d3 from "d3";

window.d3 = d3;

const Bokeh = window.Bokeh;

const initialParams = {
  zmax: 100,
  tone: 20,
  contour_on: true,
  colorMap: "Inferno",
};

const apiEndpoint = "http://localhost:8000/api/file";

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

function Ex2() {
  const bokehRoot = useRef(null);
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState(null);

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
      const colorNums = makeArr(0, 1, params.tone);
      const pal = colorNums.map((i) => colorMaps[params.colorMap](i));
      console.log(pal);
      const colorMapper = new Bokeh.LinearColorMapper({
        palette: pal,
        low: data.data.zmin,
        high: params.zmax,
      });

      const levels = makeArr(data.data.zmin, params.zmax, params.tone + 1);

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
        x: data.data.xmin,
        y: data.data.ymin,
        dw: data.data.xmax - data.data.xmin,
        dh: data.data.ymax - data.data.ymin,
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

      window.image = image;
      window.p = p;
    }

    views = await Bokeh.Plotting.show(p, bokehRoot.current);
    return p;
  };

  const handleChange = (event) => {
    let val = event.target.value;
    if (event.target.name === "zmax" || event.target.name === "zmin") {
      val = parseFloat(val);
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

    if (event.target.name === "contour_on") {
      val = event.target.checked;
    }

    if (event.target.type === "checkbox") {
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
    // setIsLoading(true);

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

    // setIsLoading(false);
    setData(jsonData);
    console.log(jsonData.data.xmin);
    setParams((prams) => ({
      ...params,
      // xmin: jsonData.data.xmin,
      ...jsonData.data,
    }));
  };

  useEffect(() => {
    createPlot();

    return () => {
      clearPlot();
    };
  }, [data]);

  // if (isLoading) {
  //   return <img src="./ZZ5H.gif" />;
  // }

  return (
    <div>
      <div>
        <header>
          <a href="/Ex2">
            <h1>Potential Energy Surface(File)</h1>
          </a>
        </header>
      </div>
      <div id="graph" ref={bokehRoot}></div>
      <form onSubmit={handleSubmit}>
        <div>
          file(.csv): <input type="file" name="file" />
        </div>
        <label>
          xmin:
          <span className="valueDisplay">{params.xmin}</span>
        </label>
        <label>
          xmax:
          <span className="valueDisplay">{params.xmax}</span>
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
          <input type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
}

export default Ex2;
