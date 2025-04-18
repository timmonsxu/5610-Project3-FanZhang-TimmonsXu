import React from "react";
import Tile from "./Tile";
import "../styles/game.css";

console.log("Rendering GameBoard:", boardType);

const GameBoard = ({ boardType, boardData, onTileClick }) => {
  return (
    <div className={`game-board ${boardType}`}>
      <h2>{boardType === "player" ? "Your Fleet" : "Enemy Waters"}</h2>
      <div className="grid">
        {boardData.map((row, x) =>
          row.map((tile, y) => (
            <Tile
              key={`${x}-${y}`}
              tile={tile}
              x={x}
              y={y}
              boardType={boardType}
              onClick={onTileClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
