import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <Link className="pageLink" to="/">
        Preset
      </Link>
      <Link className="pageLink" to="/Ex2">
        File
      </Link>
      <Link className="pageLink" to="/Ex3">
        Code
      </Link>
    </div>
  );
}

export default Navbar;
