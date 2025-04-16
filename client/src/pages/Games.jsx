import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Games = () => {
  const [openGames, setOpenGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [otherGames, setOtherGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError("");

        if (!user) {
          // 如果用户未登录，只获取公开游戏
          const publicResponse = await axios.get(
            "http://localhost:5000/api/games/public"
          );
          setOtherGames(publicResponse.data);
        } else {
          // 如果用户已登录，获取所有类型的游戏
          const [openResponse, myResponse, otherResponse] = await Promise.all([
            axios.get("http://localhost:5000/api/games/open"),
            axios.get("http://localhost:5000/api/games/my"),
            axios.get("http://localhost:5000/api/games/other"),
          ]);

          setOpenGames(openResponse.data);
          setMyGames(myResponse.data);
          setOtherGames(otherResponse.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch games");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [user]);

  const handleCreateGame = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/games",
        { ships: [] }, // 这里需要添加船只布置的逻辑
        { withCredentials: true }
      );
      navigate(`/game/${response.data.gameId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create game");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const GameCard = ({ game, type }) => {
    const isMyGame =
      user &&
      (game.player1._id === user.id ||
        (game.player2 && game.player2._id === user.id));

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              {type === "open" ? "Open Game" : "Game"} #{game._id.slice(-4)}
            </h3>
            <p className="text-sm text-gray-600">
              Started: {formatDate(game.startTime)}
            </p>
            {game.endTime && (
              <p className="text-sm text-gray-600">
                Ended: {formatDate(game.endTime)}
              </p>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded text-sm ${
              game.status === "open"
                ? "bg-yellow-100 text-yellow-800"
                : game.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
            {game.status}
          </span>
        </div>

        <div className="mt-2">
          <p className="text-sm">
            Players: {game.player1.username}
            {game.player2 && ` vs ${game.player2.username}`}
          </p>
          {game.winner && (
            <p className="text-sm font-semibold">
              Winner: {game.winner.username}
            </p>
          )}
        </div>

        <div className="mt-4">
          {type === "open" && !isMyGame && (
            <Link
              to={`/game/${game._id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
              Join Game
            </Link>
          )}
          {isMyGame && (
            <Link
              to={`/game/${game._id}`}
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
              {game.status === "open" ? "Continue Setup" : "View Game"}
            </Link>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Games</h1>
        {user && (
          <button
            onClick={handleCreateGame}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create New Game
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {user && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Open Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openGames.length > 0 ? (
                openGames.map((game) => (
                  <GameCard key={game._id} game={game} type="open" />
                ))
              ) : (
                <p className="text-gray-600">No open games available</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">My Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGames.length > 0 ? (
                myGames.map((game) => (
                  <GameCard key={game._id} game={game} type="my" />
                ))
              ) : (
                <p className="text-gray-600">You have no games</p>
              )}
            </div>
          </section>
        </>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {user ? "Other Games" : "Public Games"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherGames.length > 0 ? (
            otherGames.map((game) => (
              <GameCard key={game._id} game={game} type="other" />
            ))
          ) : (
            <p className="text-gray-600">No games available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Games;
