import React from "react";
import { useGame } from "../context/GameContext";
import "../styles/game.css";

const RestartButton = () => {
  const { resetGame } = useGame();

  return (
    <div className="button-container">
      <button className="restart-btn" onClick={resetGame}>
        🔄 Restart Game
      </button>
    </div>
  );
};

export default RestartButton;
