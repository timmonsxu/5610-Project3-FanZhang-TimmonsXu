import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Game from "./pages/Game";
import GameEasy from "./pages/GameEasy";
import GameNormal from "./pages/GameNormal";

import Rules from "./pages/Rules";
import HighScores from "./pages/HighScores";

import "./styles/styles.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/game" element={<Game />} />

        <Route path="/game/easy" element={<GameEasy />} />

        <Route path="/game/normal" element={<GameNormal />} />

        <Route path="/rules" element={<Rules />} />
        <Route path="/highscores" element={<HighScores />} />
      </Routes>
    </Router>
  );
};

export default App;
