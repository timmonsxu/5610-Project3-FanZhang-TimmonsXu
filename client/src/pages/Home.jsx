import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Battleship Game</h1>
      <div className="space-y-4">
        <Link
          to="/games"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Play Game
        </Link>
        <Link
          to="/rules"
          className="inline-block bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4">
          Game Rules
        </Link>
        <Link
          to="/high-scores"
          className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4">
          High Scores
        </Link>
      </div>
    </div>
  );
};

export default Home;
