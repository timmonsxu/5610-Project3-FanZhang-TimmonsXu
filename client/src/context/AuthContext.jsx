import React, { createContext, useState, useContext, useEffect } from "react";
import userService from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const checkAuth = async () => {
    try {
      const userData = await userService.getUserInfo();
      if (userData) {
        setIsLoggedIn(true);
        setUsername(userData.username);
        setUserId(userData._id);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
      setUsername("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await userService.login(credentials);
      if (response.message === "Login successful") {
        setIsLoggedIn(true);
        setUsername(credentials.username);

        const userData = await userService.getUserInfo();
        if (userData?._id) {
          setUserId(userData._id);
        }
      }
      return response;
    } catch (error) {
      setIsLoggedIn(false);
      setUsername("");
      setUserId("");
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

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
