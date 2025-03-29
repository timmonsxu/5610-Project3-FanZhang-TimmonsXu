import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/styles.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/game"
            className={location.pathname.startsWith("/game") ? "active" : ""}>
            Game
          </Link>
        </li>
        <li>
          <Link
            to="/rules"
            className={location.pathname === "/rules" ? "active" : ""}>
            Rules
          </Link>
        </li>
        <li>
          <Link
            to="/highscores"
            className={location.pathname === "/highscores" ? "active" : ""}>
            High Scores
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
