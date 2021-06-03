import { useState, useEffect, useRef } from 'react';
import * as gPalette from 'google-palette';

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
  tone: 20,
};

const apiEndpoint = 'http://localhost:8000/api/test';

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

  let views = null;

  const clearPlot = () => {
    console.log('clear plot!', views);
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

      const pal = gPalette('tol-dv', params.tone).map((c) => `#${c}`);
      const colorMapper = new Bokeh.LinearColorMapper({
        palette: pal,
        low: params.zmin,
        high: params.zmax,
      });

      const levels = makeArr(params.zmin, params.zmax, params.tone + 1);

      const colorBar = new Bokeh.ColorBar({
        color_mapper: colorMapper,
        major_label_text_font_size: '8pt',
        ticker: new Bokeh.FixedTicker({ ticks: levels }),
        formatter: new Bokeh.PrintfTickFormatter({ format: '%.2f' }),
        label_standoff: 6,
        border_line_color: null,
        location: [0, 0],
      });

      p.add_layout(colorBar, 'right');

      const image = p.image({
        image: [data.data.energy],
        x: params.xmin,
        y: params.ymin,
        dw: params.xmax - params.xmin,
        dh: params.ymax - params.ymin,
        color_mapper: colorMapper,
        level: 'image',
      });

      const tooltip = [
        ['x', '$x'],
        ['y', '$y'],
        ['energy', '@image'],
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

      p.x({
        x: { field: 'x' },
        y: { field: 'y' },
        size: 10,
        source: cds,
      });

      p.js_event_callbacks['tap'] = [
        {
          execute(event) {
            console.log('tap', event.x, event.y);
            setParams({
              ...params,
              x: event.x,
              y: event.y,
            });

            cds.data.x[0] = event.x;
            cds.data.y[0] = event.y;
            cds.change.emit();
          },
        },
      ];

      // TODO: add line

      p.x_range.property('start').change.connect((_args, x_range) => {
        console.log('x_range.start', x_range.start);
        setParams((params) => ({
          ...params,
          xmin: x_range.start,
        }));
      });

      p.x_range.property('end').change.connect((_args, x_range) => {
        console.log('x_range.end', x_range.end);
        setParams((params) => ({
          ...params,
          xmax: x_range.end,
        }));
      });

      p.y_range.property('start').change.connect((_args, y_range) => {
        console.log('y_range.start', y_range.start);
        setParams((params) => ({
          ...params,
          ymin: y_range.start,
        }));
      });

      p.y_range.property('end').change.connect((_args, y_range) => {
        console.log('y_range.end', y_range.end);
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
    const val = event.target.value;

    setParams({
      ...params,
      [event.target.name]: val,
    });
  };

  const handleSubmit = async (event) => {
    console.warn('The form was submitted:', params);
    event.preventDefault();

    // validation and submit
    const formData = new FormData(event.target);

    const options = {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    delete options.headers['Content-Type'];

    const d = await fetch(apiEndpoint, options);
    const jsonData = await d.json();
    console.log(jsonData);

    setData(jsonData);
  };

  useEffect(() => {
    createPlot();

    return () => {
      clearPlot();
    };
  }, [data]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <input type="submit" value="Submit" />
      </form>
      <div ref={bokehRoot}></div>
    </div>
  );
}

export default Ex1;
