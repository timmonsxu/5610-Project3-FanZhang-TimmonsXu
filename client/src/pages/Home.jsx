import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/styles.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero-section">
        <Navbar />
        <h1>Battleship Game</h1>
      </div>
      <header>
        <h2>Welcome to the Battleship Game</h2>
        <p>Dominate the battlefield by sinking your opponent's fleet!</p>
      </header>
      <main>
        <img src="/images/battleshipgif3.gif" alt="Battleship Icon" />
      </main>
      <div>
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

export default Home;
