// src/pages/AllGames.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import gameService from "../services/gameService";
import "../styles/allGame.css";

const AllGames = () => {
  const { isLoggedIn, username } = useAuth();
  const [openGames, setOpenGames] = useState([]);
  const [myOpenGames, setMyOpenGames] = useState([]);
  const [myActiveGames, setMyActiveGames] = useState([]);
  const [myCompletedGames, setMyCompletedGames] = useState([]);
  const [otherGames, setOtherGames] = useState([]);
  const [publicActiveGames, setPublicActiveGames] = useState([]);
  const [publicCompletedGames, setPublicCompletedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError("");

        if (isLoggedIn) {
          // 获取登录用户的所有游戏数据
          const [open, myOpen, active, completed, other] = await Promise.all([
            gameService.getOpenGames(),
            gameService.getMyOpenGames(),
            gameService.getMyActiveGames(),
            gameService.getMyCompletedGames(),
            gameService.getOtherGames(),
          ]);

          setOpenGames(open);
          setMyOpenGames(myOpen);
          setMyActiveGames(active);
          setMyCompletedGames(completed);
          setOtherGames(other);
        } else {
          // 获取未登录用户的公开游戏数据
          const [active, completed] = await Promise.all([
            gameService.getPublicActiveGames(),
            gameService.getPublicCompletedGames(),
          ]);

          setPublicActiveGames(active);
          setPublicCompletedGames(completed);
        }
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setError(
          err.message || "Failed to load games. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [isLoggedIn]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderGameCard = (game, type) => {
    const isMyGame = game.player1?.username === username;
    const isOpponent = game.player2?.username === username;
    const isWinner = game.winner?.username === username;

    // 确保使用正确的游戏ID
    const gameId = game._id || game.gameId;

    return (
      <div key={gameId} className="game-card">
        <div className="game-info">
          <p>Game ID: {gameId}</p>
          <p>Started: {formatDate(game.startTime)}</p>
          {game.endTime && <p>Ended: {formatDate(game.endTime)}</p>}
          <p>Status: {game.status}</p>
        </div>

        <div className="players-info">
          <p>Player 1: {game.player1?.username}</p>
          {game.player2 && <p>Player 2: {game.player2?.username}</p>}
          {game.winner && <p>Winner: {game.winner?.username}</p>}
        </div>

        <div className="game-actions">
          {type === "open" && !isMyGame && (
            <Link to={`/game/${gameId}`} className="join-button">
              Join Game
            </Link>
          )}
          {type === "myOpen" && (
            <Link to={`/game/${gameId}`} className="view-button">
              View Game
            </Link>
          )}
          {type === "active" && (
            <Link to={`/game/${gameId}`} className="play-button">
              {game.currentTurn?.username === username
                ? "Your Turn"
                : "Opponent's Turn"}
            </Link>
          )}
          {type === "completed" && (
            <Link to={`/game/${gameId}`} className="view-button">
              View Result
            </Link>
          )}
          {type === "other" && game.status === "active" && (
            <Link to={`/game/${gameId}`} className="spectate-button">
              Spectate Game
            </Link>
          )}
          {type === "other" && game.status === "completed" && (
            <Link to={`/game/${gameId}`} className="view-button">
              View Result
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="hero-section">
        <Navbar />
        <h1>All Games</h1>
      </div>

      <div className="games-page-container">
        {loading ? (
          <p>Loading games...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            {isLoggedIn ? (
              <>
                <section className="games-section">
                  <h2>Open Games (joinable)</h2>
                  <div className="games-grid">
                    {openGames.length > 0 ? (
                      openGames.map((game) => renderGameCard(game, "open"))
                    ) : (
                      <p>No open games available</p>
                    )}
                  </div>
                </section>

                <section className="games-section">
                  <h2>My Open Games</h2>
                  <div className="games-grid">
                    {myOpenGames.length > 0 ? (
                      myOpenGames.map((game) => renderGameCard(game, "myOpen"))
                    ) : (
                      <p>You have no open games</p>
                    )}
                  </div>
                </section>

                <section className="games-section">
                  <h2>My Active Games</h2>
                  <div className="games-grid">
                    {myActiveGames.length > 0 ? (
                      myActiveGames.map((game) =>
                        renderGameCard(game, "active")
                      )
                    ) : (
                      <p>You have no active games</p>
                    )}
                  </div>
                </section>

                <section className="games-section">
                  <h2>My Completed Games</h2>
                  <div className="games-grid">
                    {myCompletedGames.length > 0 ? (
                      myCompletedGames.map((game) =>
                        renderGameCard(game, "completed")
                      )
                    ) : (
                      <p>You have no completed games</p>
                    )}
                  </div>
                </section>

                <section className="games-section">
                  <h2>Other Games</h2>
                  <div className="games-grid">
                    {otherGames.length > 0 ? (
                      otherGames.map((game) => renderGameCard(game, "other"))
                    ) : (
                      <p>No other games available</p>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="games-section">
                  <h2>Active Games</h2>
                  <div className="games-grid">
                    {publicActiveGames.length > 0 ? (
                      publicActiveGames.map((game) =>
                        renderGameCard(game, "public")
                      )
                    ) : (
                      <p>No active games available</p>
                    )}
                  </div>
                </section>

                <section className="games-section">
                  <h2>Completed Games</h2>
                  <div className="games-grid">
                    {publicCompletedGames.length > 0 ? (
                      publicCompletedGames.map((game) =>
                        renderGameCard(game, "public")
                      )
                    ) : (
                      <p>No completed games available</p>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AllGames;
