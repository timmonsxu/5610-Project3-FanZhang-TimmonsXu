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

        {/* 进入模式选择页面 */}
        <Route path="/game" element={<Game />} />

        {/* 进入 Easy 模式 */}
        <Route path="/game/easy" element={<GameEasy />} />

        {/* 进入 Normal 模式 */}
        <Route path="/game/normal" element={<GameNormal />} />

        {/* <Route path="/game/normal" element={<Game />} />
        <Route path="/game/easy" element={<Game />} />{" "}
        后期可以根据 props 改变行为 */}

        <Route path="/rules" element={<Rules />} />
        <Route path="/highscores" element={<HighScores />} />
      </Routes>
    </Router>
  );
};

export default App;
