import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import gameService from "../services/gameService";
import "../styles/game.css";

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, username, userId } = useAuth(); // ✅ 引入 userId 0418
  // const { isLoggedIn, username } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const isJoiningRef = useRef(false);

  // 获取游戏状态
  const fetchGameState = async () => {
    try {
      console.log("Fetching game state for gameId:", gameId);
      console.log("Is logged in:", isLoggedIn);
      console.log("Current username:", username);
      const response = await gameService.getGameDetails(gameId);
      console.log("Game state response:", response);
      setGameState(response);

      // 检查是否是当前玩家的回合
      // if (response.currentTurn && isLoggedIn) {
      //   setIsMyTurn(response.currentTurn.username === username);
      // }
      if (response.currentTurn && isLoggedIn) {
        setIsMyTurn(response.currentTurn === userId); // ✅ 更稳定的 ID 比较
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError(err.message || "Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  };

  // 加入游戏
  const joinGame = async () => {
    if (isJoiningRef.current) return;

    isJoiningRef.current = true;
    try {
      console.log("🚀 joinGame called");
      await gameService.joinGame(gameId);
      // 加入成功后刷新游戏状态
      await fetchGameState();
    } catch (err) {
      setError(err.message || "Failed to join game");
    }
  };

  // 初始加载和轮询
  useEffect(() => {
    console.log("🔥 useEffect fired");
    const initializeGame = async () => {
      try {
        // 首先获取游戏状态
        const response = await gameService.getGameDetails(gameId);

        // 如果游戏是开放的，且用户不是玩家，则自动加入
        if (
          response.status === "open" &&
          response.player1.username !== username &&
          (!response.player2 || response.player2.username !== username)
        ) {
          await joinGame();
        } else {
          setGameState(response);
        }
      } catch (err) {
        setError(err.message || "Failed to initialize game");
      } finally {
        setLoading(false);
      }
    };

    initializeGame();

    // 设置轮询间隔（每5秒更新一次）
    const intervalId = setInterval(fetchGameState, 5000);

    // 清理函数
    return () => clearInterval(intervalId);
  }, [gameId, isLoggedIn, username]);

  // 处理攻击
  const handleAttack = async (x, y) => {
    console.log("Attempting attack at:", x, y);
    console.log("Current game state:", gameState);
    console.log("Current turn:", gameState?.currentTurn);

    console.log("Current user:", userId);
    console.log("🧨 About to send attack via gameService.attack()");

    if (!gameState || gameState.status !== "active") {
      console.log("Game is not active or not loaded");
      return;
    }

    if (gameState.currentTurn !== userId) {
      console.log("Not user's turn (by ID), ignoring click");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Sending attack request...");
      await gameService.attack(gameState.gameId, x, y);
      await fetchGameState();
    } catch (err) {
      console.error("Failed to attack:", err);
      setError(err.message || "Failed to make move. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 渲染棋盘
  const renderBoard = (board, isOpponent = false) => {
    console.log("Rendering board:", board, "isOpponent:", isOpponent);
    if (!board) {
      console.log("Board is null or undefined");
      return null;
    }
    if (!board.hits) {
      console.log("Board hits is missing");
      board.hits = [];
    }
    if (!board.ships) {
      console.log("Board ships is missing");
      board.ships = [];
    }

    return (
      <div className="board">
        <h3>{isOpponent ? "Opponent's Board" : "Your Board"}</h3>
        <div className="grid">
          {Array(10)
            .fill(0)
            .map((_, y) => (
              <div key={y} className="row">
                {Array(10)
                  .fill(0)
                  .map((_, x) => {
                    const hit = board.hits.find((h) => h.x === x && h.y === y);
                    const hasShip = board.ships.some((ship) =>
                      ship.positions.some((pos) => pos.x === x && pos.y === y)
                    );

                    let cellClass = "cell";
                    if (hit) {
                      cellClass += hit.hit ? " hit" : " miss";
                    } else if (!isOpponent && hasShip) {
                      cellClass += " ship";
                    }

                    return (
                      <div
                        key={x}
                        className={cellClass}
                        onClick={() => isOpponent && handleAttack(x, y)}>
                        {hit && (hit.hit ? "💥" : "❌")}
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="game-container">
          <p>Loading game...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="game-container">
          <p className="error">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!gameState) {
    return (
      <>
        <Navbar />
        <div className="game-container">
          <p>Game not found</p>
        </div>
        <Footer />
      </>
    );
  }

  // 找到当前玩家的棋盘
  const myBoard =
    username === gameState.player1.username
      ? gameState.player1Board
      : gameState.player2Board;
  const opponentBoard =
    username === gameState.player1.username
      ? gameState.player2Board
      : gameState.player1Board;

  console.log("My board:", myBoard);
  console.log("Opponent board:", opponentBoard);

  return (
    <>
      <Navbar />
      <div className="game-container">
        <div className="game-info">
          <h2>Game Status: {gameState.status}</h2>
          {/* <p>Current Turn: {gameState.currentTurn?.username}</p> */}
          <p>
            Current Turn:{" "}
            {gameState.currentTurn === gameState.player1._id
              ? gameState.player1.username
              : gameState.player2?.username}
          </p>
          {gameState.winner && <p>Winner: {gameState.winner.username}</p>}
        </div>

        <div className="boards-wrapper">
          {renderBoard(opponentBoard, true)}
          {renderBoard(myBoard)}
        </div>

        {gameState.status === "active" && (
          <div className="game-status">
            {isMyTurn ? (
              <p className="your-turn">It's your turn!</p>
            ) : (
              <p className="opponent-turn">Waiting for opponent...</p>
            )}
          </div>
        )}

        {gameState.status === "completed" && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>The winner is: {gameState.winner.username}</p>
            <button
              className="restart-btn"
              onClick={() => navigate("/allgames")}>
              Back to Games
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Game;
