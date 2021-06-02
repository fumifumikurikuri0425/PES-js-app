import { useEffect, useRef } from 'react';

const Bokeh = window.Bokeh;

function Ex1() {
  const bokehRoot = useRef(null);

  const N = 500;
  const x = [0, 10, 20, 30];
  const y = [0, 10, 20, 30];
  const d = [
    [0, 10, 20, 30],
    [0, 10, 20, 30],
    [0, 10, 20, 30],
    [0, 10, 20, 30],
  ];

  useEffect(() => {
    // create bokeh figure
    const p = Bokeh.Plotting.figure({
      tooltips: [
        ['x', '$x'],
        ['y', '$y'],
        ['value', '@image'],
      ],
    });

    return null;
  }, []);

  return (
    <div>
      <div ref={bokehRoot}></div>
    </div>
  );
}

export default Ex1;
