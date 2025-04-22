import api from "./api";

const gameService = {
  
  getOpenGames: async () => {
    try {
      const response = await api.get("/games/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getMyOpenGames: async () => {
    try {
      const response = await api.get("/games/my/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getMyActiveGames: async () => {
    try {
      const response = await api.get("/games/my/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getMyCompletedGames: async () => {
    try {
      const response = await api.get("/games/my/completed");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getOtherGames: async () => {
    try {
      const response = await api.get("/games/other");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPublicActiveGames: async () => {
    try {
      const response = await api.get("/games/public/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  getPublicCompletedGames: async () => {
    try {
      const response = await api.get("/games/public/completed");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  createGame: async () => {
    try {
      const response = await api.post("/games");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  joinGame: async (gameId) => {
    try {
      const response = await api.post(`/games/${gameId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  getGameDetails: async (gameId) => {
    try {
      console.log("Fetching game details for gameId:", gameId);
      const response = await api.get(`/games/${gameId}`);
      console.log("Game details API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching game details:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },


  makeMove: async (gameId, moveData) => {
    try {
      const response = await api.post(`/games/${gameId}/move`, moveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  placeShips: async (gameId, ships) => {
    try {
      const response = await api.post(`/games/${gameId}/ships`, { ships });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  attack: async (gameId, x, y) => {
    try {
      const response = await api.post(`/games/${gameId}/move`, { x, y });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  getGameStatus: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default gameService;
