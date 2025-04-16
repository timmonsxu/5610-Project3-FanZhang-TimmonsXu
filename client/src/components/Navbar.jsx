import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/styles.css";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            Battleship
          </Link>
          <Link to="/rules" className="hover:text-gray-300">
            Rules
          </Link>
          <Link to="/high-scores" className="hover:text-gray-300">
            High Scores
          </Link>
          {user && (
            <>
              <Link to="/games" className="hover:text-gray-300">
                All Games
              </Link>
              <Link to="/games/new" className="hover:text-gray-300">
                New Game
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-300">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
