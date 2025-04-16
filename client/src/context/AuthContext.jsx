import React, { createContext, useState, useContext, useEffect } from "react";
import userService from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const checkAuth = async () => {
    try {
      const userData = await userService.getUserInfo();
      if (userData) {
        setIsLoggedIn(true);
        setUsername(userData.username);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUsername("");
    }
  };

  const login = async (credentials) => {
    try {
      const response = await userService.login(credentials);
      if (response.message === "Login successful") {
        setIsLoggedIn(true);
        setUsername(credentials.username);
      }
      return response;
    } catch (error) {
      setIsLoggedIn(false);
      setUsername("");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
      setIsLoggedIn(false);
      setUsername("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
