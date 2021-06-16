import { useState, useEffect, useRef } from "react";

const Bokeh = window.Bokeh;

function EnergyProfile({ distance, energy, tsPoint }) {
  const bokehRoot = useRef(null);

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
    const xRange = new Bokeh.DataRange1d({});
    const yRange = new Bokeh.DataRange1d({});

    // create bokeh figure
    const p = Bokeh.Plotting.figure({
      // tools: 'tap',
      x_range: xRange,
      y_range: yRange,
      padding: 0,
      width: 700,
      height: 530,
      title: "Energy Profile",
    });

    p.xaxis[0].axis_label = "distance";
    p.yaxis[0].axis_label = "energy";

    p.line({
      x: distance,
      y: energy,
      line_width: 2,
    });

    p.circle({
      x: 0,
      y: energy[0],
      size: 7,
      fill_color: "pink",
      line_width: 0,
    });

    p.circle({
      x: tsPoint[0],
      y: tsPoint[1],
      size: 7,
      fill_color: "lime",
      line_width: 0,
    });

    const tooltip = [
      ["distance", "$x"],
      ["energy", "$y"],
      // ["energy", "@y"],
    ];
    const ht = new Bokeh.HoverTool({ tooltips: tooltip, mode: "vline" });
    p.add_tools(ht);

    window.p = p;

    views = await Bokeh.Plotting.show(p, bokehRoot.current);
    return p;
  };

  useEffect(() => {
    createPlot();

    return () => {
      clearPlot();
    };
  }, [distance, energy]);

  return (
    <div>
      <div id="graph" ref={bokehRoot}></div>
    </div>
  );
}

export default EnergyProfile;
