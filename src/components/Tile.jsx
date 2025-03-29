import React from "react";
import "../styles/game.css";

const Tile = ({ tile, x, y, boardType, onClick }) => {
  const { revealed, hit, hasShip } = tile;

  let tileClass = "cell";
  let icon = "";

  if (revealed) {
    if (hit) {
      tileClass += " hit"; 
      icon = "❌"; 
    } else {
      tileClass += " miss"; 
      icon = "✔️"; 
    }
  } else {

    if (boardType === "player" && hasShip) {
      icon = "⚫";
    }
  }


  const handleClick = () => {
    if (boardType === "enemy" && onClick && !revealed) {
      onClick(x, y);
    }
  };

  return (
    <div className={tileClass} onClick={handleClick}>
      <span className="icon">{icon}</span>
    </div>
  );
};

export default Tile;
