import { useRef, useEffect } from "react";

const Bokeh = window.Bokeh;

function BokehTest() {
    const container = useRef(null);


    useEffect(() => {
        console.log('init');

        var plt = Bokeh.Plotting;

        var bar_data = [
            ['City', '2010 Population', '2000 Population'],
            ['NYC', 8175000, 8008000],
            ['LA', 3792000, 3694000],
            ['Chicago', 2695000, 2896000],
            ['Houston', 2099000, 1953000],
            ['Philadelphia', 1526000, 1517000],
        ];

        var p1 = Bokeh.Charts.bar(bar_data, {
            axis_number_format: "0.[00]a"
        });
        var p2 = Bokeh.Charts.bar(bar_data, {
            axis_number_format: "0.[00]a",
            stacked: true
        });
        var p3 = Bokeh.Charts.bar(bar_data, {
            axis_number_format: "0.[00]a",
            orientation: "vertical"
        });
        var p4 = Bokeh.Charts.bar(bar_data, {
            axis_number_format: "0.[00]a",
            orientation: "vertical",
            stacked: true
        });

        plt.show(plt.gridplot([[p1, p2], [p3, p4]], {plot_width:350, plot_height:350}), container.current);

    }, [])



    return <div><div>bokeh test</div>
    <div ref={container}></div>
    </div>
}

export default BokehTest;