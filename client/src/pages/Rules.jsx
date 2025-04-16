import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/rules.css";

const Rules = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Game Rules</h1>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Objective</h2>
        <p>
          The objective of Battleship is to sink all of your opponent's ships
          before they sink all of yours.
        </p>

        <h2 className="text-xl font-semibold">Setup</h2>
        <p>
          Each player places their ships on their own grid. The ships can be
          placed horizontally or vertically, but not diagonally.
        </p>

        <h2 className="text-xl font-semibold">Gameplay</h2>
        <p>
          Players take turns calling out coordinates to attack. If a ship is
          hit, the player marks it on their tracking grid. If all of a ship's
          coordinates are hit, the ship is sunk.
        </p>

        <h2 className="text-xl font-semibold">Winning</h2>
        <p>
          The first player to sink all of their opponent's ships wins the game.
        </p>
      </div>
    </div>
  );
};

export default Rules;
