import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Timer from "../components/Timer";
import GameBoard from "../components/GameBoard";
import RestartButton from "../components/RestartButton";
import GameStatusBanner from "../components/GameStatusBanner";
import "../styles/game.css";
import { GameProvider, useGame } from "../context/GameContext";

const GameNormalContent = () => {
  const { enemyBoard, playerBoard, handlePlayerMove } = useGame();
  const navigate = useNavigate(); 
  return (
    <>
      <div className="hero-section">
        <Navbar />
        <h1>Battleship Game - Normal Mode</h1>
      </div>

      <div className="container">
        <h1>Battle Game</h1>
        <Timer />
        <GameStatusBanner />
        <div className="boards-wrapper">
          <GameBoard
            boardType="enemy"
            boardData={enemyBoard}
            onTileClick={handlePlayerMove}
          />
          <GameBoard boardType="player" boardData={playerBoard} />
        </div>
        <div className="button-container">
          <RestartButton />
          <button
            className="restart-btn"
            onClick={() => navigate("/game")} 
          >
            Back to Mode Selection
          </button>
        </div>

      </div>

      <Footer />
    </>
  );
};


const GameNormal = () => {
  return (
    <GameProvider mode="normal">
      <GameNormalContent />
    </GameProvider>
  );
};

export default GameNormal;
