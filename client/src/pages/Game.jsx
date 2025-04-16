import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/game.css";

const Game = () => {
  const { gameId } = useParams();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        // 模拟数据，用于前端开发
        const mockGame = {
          player1: { _id: "1", username: "Player 1" },
          player2: { _id: "2", username: "Player 2" },
          currentPlayer: "1",
          status: "active",
          player1Board: Array(10)
            .fill()
            .map(() => Array(10).fill("empty")),
          player2Board: Array(10)
            .fill()
            .map(() => Array(10).fill("empty")),
        };
        setGame(mockGame);
        setIsMyTurn(mockGame.currentPlayer === user?.id);
        setIsGameOver(mockGame.status === "completed");
      } catch (err) {
        console.error("Error fetching game:", err);
        setError("Failed to fetch game");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId, user]);

  const handleAttack = async (x, y) => {
    if (!isMyTurn || isGameOver) return;

    try {
      // 模拟攻击响应
      const updatedGame = {
        ...game,
        currentPlayer: game.currentPlayer === "1" ? "2" : "1",
        player2Board: game.player2Board.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex === y && colIndex === x ? "hit" : cell
          )
        ),
      };
      setGame(updatedGame);
      setIsMyTurn(updatedGame.currentPlayer === user?.id);
    } catch (err) {
      setError("Failed to make move");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center text-red-500">
        Game not found or you don't have access to it
      </div>
    );
  }

  const isPlayer1 = user?.id === game.player1._id;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const myBoard = isPlayer1 ? game.player1Board : game.player2Board;
  const opponentBoard = isPlayer1 ? game.player2Board : game.player1Board;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Game #{gameId.slice(-4)}</h1>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                game.status === "open"
                  ? "bg-yellow-100 text-yellow-800"
                  : game.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
              {game.status}
            </span>
            {game.status === "active" && (
              <span className="text-sm">
                {isMyTurn ? "Your turn" : `${opponent?.username}'s turn`}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 我的棋盘 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Board</h2>
            <div className="grid grid-cols-10 gap-1">
              {myBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`w-8 h-8 border ${
                      cell === "ship"
                        ? "bg-blue-500"
                        : cell === "hit"
                        ? "bg-red-500"
                        : cell === "miss"
                        ? "bg-gray-300"
                        : "bg-white"
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 对手棋盘 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {opponent
                ? `${opponent.username}'s Board`
                : "Waiting for opponent..."}
            </h2>
            <div className="grid grid-cols-10 gap-1">
              {opponentBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleAttack(x, y)}
                    className={`w-8 h-8 border cursor-pointer ${
                      cell === "hit"
                        ? "bg-red-500"
                        : cell === "miss"
                        ? "bg-gray-300"
                        : "bg-white hover:bg-gray-100"
                    } ${
                      !isMyTurn || isGameOver
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
