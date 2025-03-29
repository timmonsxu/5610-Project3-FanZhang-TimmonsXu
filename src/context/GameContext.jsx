
import React, { createContext, useState, useContext, useEffect } from "react";
import {
  generateEmptyBoard,
  placeShipsRandomly,
  checkIfAllShipsSunk,
} from "../utils/boardUtils";
import { getRandomUntriedTile } from "../utils/aiLogic";

const GameContext = createContext();

export const GameProvider = ({ children, mode }) => {
  const BOARD_SIZE = 10;

  
  const [playerBoard, setPlayerBoard] = useState(
    generateEmptyBoard(BOARD_SIZE)
  );
  const [enemyBoard, setEnemyBoard] = useState(generateEmptyBoard(BOARD_SIZE));
  const [turn, setTurn] = useState("player");
  const [gameStatus, setGameStatus] = useState("playing");
  const [startTime, setStartTime] = useState(Date.now());

  const resetGame = () => {
    const newPlayerBoard = generateEmptyBoard(BOARD_SIZE);
    const newEnemyBoard = generateEmptyBoard(BOARD_SIZE);

    placeShipsRandomly(newPlayerBoard);
    placeShipsRandomly(newEnemyBoard);

    setPlayerBoard(newPlayerBoard);
    setEnemyBoard(newEnemyBoard);
    setTurn("player");
    setGameStatus("playing");
    setStartTime(Date.now());
  };

  useEffect(() => {
    resetGame();
  }, [mode]);


  const handlePlayerMove = (x, y) => {
    if (turn !== "player" || gameStatus !== "playing") return;

    const newBoard = [...enemyBoard.map((row) => [...row])];
    const tile = newBoard[x][y];

    if (tile.revealed) return; 

    tile.revealed = true;
    tile.hit = tile.hasShip;

    setEnemyBoard(newBoard);

    if (checkIfAllShipsSunk(newBoard)) {
      setGameStatus("won");
      return;
    }

    if (mode === "normal") {
      setTurn("ai");
    }
  };

  useEffect(() => {
    if (mode === "normal" && turn === "ai" && gameStatus === "playing") {
      const timer = setTimeout(() => {
        const [x, y] = getRandomUntriedTile(playerBoard);
        const newBoard = [...playerBoard.map((row) => [...row])];
        const tile = newBoard[x][y];

        tile.revealed = true;
        tile.hit = tile.hasShip;

        setPlayerBoard(newBoard);

        if (checkIfAllShipsSunk(newBoard)) {
          setGameStatus("lost");
        } else {
          setTurn("player");
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [turn, gameStatus, playerBoard, mode]);

  return (
    <GameContext.Provider
      value={{
        playerBoard,
        enemyBoard,
        turn,
        gameStatus,
        startTime,
        handlePlayerMove,
        resetGame,
      }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
