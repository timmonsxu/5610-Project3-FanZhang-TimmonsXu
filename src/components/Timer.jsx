import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import "../styles/game.css";

const Timer = () => {
  const { startTime, gameStatus } = useGame();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);


    if (gameStatus !== "playing") {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [startTime, gameStatus]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="timer">
      <span>Game Time: </span>
      <span id="timer">{formatTime(elapsed)}</span>
    </div>
  );
};

export default Timer;
