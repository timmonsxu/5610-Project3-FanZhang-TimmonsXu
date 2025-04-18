import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import Navbar from "../components/Navbar";
import "../styles/score.css";

const HighScores = () => {
  const { username } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await userService.getUserRankings();
        // 只取前10名
        const topTen = response.slice(0, 15);
        setScores(topTen);
        setError(null);
      } catch (err) {
        setError("Failed to load high scores");
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <>
      <div className="hero-section">
        <Navbar />
        <h1>Battleship Game</h1>
      </div>
      <div className="container">
        <h2>High Scores</h2>
        {loading ? (
          <div className="loading">Loading scores...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table className="scores-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr
                  key={score.rank}
                  className={score.username === username ? "current-user" : ""}>
                  <td>{score.rank}</td>
                  <td>{score.username}</td>
                  <td>{score.wins}</td>
                  <td>{score.losses}</td>
                  <td>{score.winRate}%</td>
                </tr>
              ))}
              {/* 填充剩余行 */}
              {Array.from({ length: 10 - scores.length }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td>{scores.length + index + 1}</td>
                  <td colSpan="4" className="waiting">
                    Waiting to be filled
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default HighScores;
