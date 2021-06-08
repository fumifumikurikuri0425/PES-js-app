import { BrowserRouter as Router, Route } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/NavBar";
import Top from "./pages/Top";
import Ex1 from "./pages/Ex1";
import Ex2 from "./pages/Ex2";

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Navbar />
          {/* <hr /> */}
          <Route exact path="/" component={Ex1} />
          <Route exact path="/Ex2" component={Ex2} />
        </div>
      </Router>
    </div>
  );
}

export default App;
