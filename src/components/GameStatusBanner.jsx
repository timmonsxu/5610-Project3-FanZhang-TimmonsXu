import React from "react";
import { useGame } from "../context/GameContext";
import "../styles/game.css";

const GameStatusBanner = () => {
  const { gameStatus } = useGame();

  if (gameStatus === "playing") return null;

  const message =
    gameStatus === "won" ? "🎉 Game Over! You Won!" : "😢 Game Over! AI Won!";

  return <div className="game-over-banner">{message}</div>;
};

export default GameStatusBanner;
