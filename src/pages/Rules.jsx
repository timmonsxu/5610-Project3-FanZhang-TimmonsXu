import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/rules.css";

const Rules = () => (
  <>
    <div className="hero-section">
      <Navbar />
      <h1>Battleship Game</h1>
    </div>
    <div className="container">
      <h2>Game Rules</h2>
      <ul>
        <li>The game board consists of a grid with hidden ships.</li>
        <li>Click on a cell to attack that location.</li>
        <li>If you hit a ship, the cell will turn green (✔).</li>
        <li>If you miss, the cell will turn red (X).</li>
        <li>The game ends when all ships are hit.</li>
        <li>Click the "Restart" button to start a new game.</li>
      </ul>

      <h2>Credits</h2>
      <h3>Developed by Vivian</h3>
      <ul>
        <li>
          Email:{" "}
          <a href="mailto:zhang.fan9@northeastern.edu">
            zhang.fan9@northeastern.edu
          </a>
        </li>
        <li>
          GitHub:{" "}
          <a href="https://github.com/fanzhangvivian, " target="_blank">
            github.com/fanzhangvivian
          </a>
        </li>
        <li>
          LinkedIn:{" "}
          <a
            href="https://www.linkedin.com/in/fan-zhang-17b498271/"
            target="_blank">
            linkedin.com/in/fanzhang
          </a>
        </li>
      </ul>
    </div>
    <Footer />
  </>
);

export default Rules;
