import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/game.css";

const Game = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero-section">
        <Navbar />
        <h1>Select Game Mode</h1>
      </div>

      <div className="mode-selection">
        <button
          className="mode-btn easy-btn"
          onClick={() => navigate("/game/easy")}>
          Easy Mode (Free Play)
        </button>

        <button
          className="mode-btn normal-btn"
          onClick={() => navigate("/game/normal")}>
          Normal Mode (Battle Mode)
        </button>
      </div>

      <Footer />
    </>
  );
};

export default Game;
