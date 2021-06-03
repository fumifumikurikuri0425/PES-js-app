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
    // create bokeh figure
    const p = Bokeh.Plotting.figure({
      tooltips: [
        ['x', '$x'],
        ['y', '$y'],
        ['value', '@image'],
      ],
      width: 700,
      height: 530,
    });

    if (data) {
      console.log('draw graph!!!', data);

      const pal = gPalette('tol-dv', params.tone).map((c) => `#${c}`);
      const colorMapper = new Bokeh.LinearColorMapper({
        palettes: pal,
        low: params.zmin,
        high: params.zmax,
      });

      console.log('image data:', data.data.energy);
      p.image({
        image: data.data.energy,
        x: params.xmin,
        y: params.ymin,
        dw: params.xmax - params.xmin,
        dh: params.ymax - params.ymin,
        level: 'image',
      });
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
        <input type="submit" value="Submit" />
      </form>
      <div ref={bokehRoot}></div>
    </div>
  );
}

export default Ex1;
