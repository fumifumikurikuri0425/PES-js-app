import { BrowserRouter as Router, Route } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import "./App.css";
import Navbar from "./components/NavBar";
import Ex1 from "./pages/Ex1";
import Ex2 from "./pages/Ex2";
import Ex3 from "./pages/Ex3";

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Navbar />
          <Route exact path="/" component={Ex1} />
          <Route exact path="/Ex2" component={Ex2} />
          <Route exact path="/Ex3" component={Ex3} />
        </div>
      </Router>
    </div>
  );
}

export default App;
