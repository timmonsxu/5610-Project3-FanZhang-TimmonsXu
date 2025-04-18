import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/styles.css";
import { useAuth } from "../context/AuthContext";
import gameService from "../services/gameService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCreateGame = async () => {
    try {
      setIsCreating(true);
      setError("");
      const response = await gameService.createGame();
      console.log("Game created successfully:", response);
      // 创建成功后跳转到游戏页面
      navigate(`/game/${response.gameId}`);
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err.message || "Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <ul>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/allgames"
              className={
                location.pathname.startsWith("/allgames") ? "active" : ""
              }>
              All Games
            </Link>
          </li>
          <li>
            <Link
              to="/rules"
              className={location.pathname === "/rules" ? "active" : ""}>
              Rules
            </Link>
          </li>
          <li>
            <Link
              to="/highscores"
              className={location.pathname === "/highscores" ? "active" : ""}>
              High Scores
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="user-info">
            <span className="username">Welcome, {username}</span>
            <button
              className="create-game-button"
              onClick={handleCreateGame}
              disabled={isCreating}>
              {isCreating ? "Creating..." : "New Game"}
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="register-button">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
