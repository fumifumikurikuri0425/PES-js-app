import logo from './logo.svg';
import './App.css';



import { useState, useEffect, useRef } from "react";

const Bokeh = window.Bokeh;

function App() {

  const [ state, setState ] = useState({
    step: 0.05,
    x: -0.55,
    y: 0.55,
    tone:20,
    check: 0,
  });

  const [html, setHtml] = useState("<h1>test</h1><script>alert('sss')</script>")
  const testRef = useRef(null);

  const handleSubmit = async (event) => {

    event.preventDefault();
    console.log('submit!!!');


    const endpoint = "http://127.0.0.1:8000/api";
    const response = await fetch(endpoint);
    console.log(response);
    // console.log(await response.text())
    const state = await response.json()
    console.log(state);
    setState(s => {
      const nextState = {...s, ...state};
      console.log(nextState);
      return nextState;
    });

  }

  useEffect(() => {
    console.log('effect');
    console.log(state.plot_script)
    // setHtml(state.plot_script)

    fetch('http://127.0.0.1:8000/api3')
    .then(function(response) { return response.json() })
    .then(function(item) {
      console.log(item);
      return Bokeh.embed.embed_item(item, "myplot") })


  }, []);





  return (
    <div className="App">

      {/* <div dangerouslySetInnerHTML={{ __html:  state.js_resources}} />
      <div dangerouslySetInnerHTML={{ __html:  state.css_resources}} /> */}
      {/* <div dangerouslySetInnerHTML={{ __html:  state.plot_div}} /> */}
      {/* <div dangerouslySetInnerHTML={{ __html:  state.plot_script}} /> */}
      {/* <div dangerouslySetInnerHTML={{ __html:  html}} /> */}



      <h1>
        <a href="/">Muller Brown Potential</a>
      </h1>

      <div ref={testRef} id="myplot"></div>

      <form id="form1" onSubmit={handleSubmit}>
        <div>
          step: <input name="step" type="number" step="any" min="1e-9" size="7" value={state.step} required></input>
        </div>

        <div>
          Initial x: <input name="x" type="text" size="10" value={state.x} required></input>
        </div>

        <div>
          Initial y: <input name="y" type="text" size="10" value={state.y} required></input>
        </div>

        <div>
          color tone: <input name="tone" type="number" size="4" value={state.tone} min="0" required></input>
        </div>

        <div>
          saddle point:

          { state.check === 0 ? (<div>
              <label>left  <input type="radio" name="check" value="0" checked/></label>
              <label> right  <input type="radio" name="check" value="1" /></label>
            </div>) : (<div>
              <label>left  <input type="radio" name="check" value="0" /></label>
              <label> right  <input type="radio" name="check" value="1" checked /></label>
            </div>) }
        </div>

        <input class="btn" type="submit" value="submit" />
        <input class="btn" type="reset" value="reset" />
        <input type="file"></input>
      </form>


    </div>
  );
}

export default App;
