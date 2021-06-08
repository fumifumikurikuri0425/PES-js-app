import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <Link className="pageLink" to="/">
        Home{" "}
      </Link>
      {/* <Link to="/Ex1">Ex1</Link> */}
      <Link to="/Ex2">File</Link>
    </div>
  );
}

export default Navbar;
