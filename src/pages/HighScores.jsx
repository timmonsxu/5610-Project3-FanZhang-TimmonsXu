import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/score.css";

const HighScores = () => (
  <>
    <div className="hero-section">
      <Navbar />
      <h1>Battleship Game</h1>
    </div>
    <div className="container">
      <h2>High Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Wins</th>
            <th>Losses</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alice</td>
            <td>10</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Bob</td>
            <td>8</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Tom</td>
            <td>8</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Jackson</td>
            <td>6</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Ross</td>
            <td>5</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Rach</td>
            <td>5</td>
            <td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Footer />
  </>
);

export default HighScores;
