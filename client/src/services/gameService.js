import api from "./api";

const gameService = {
  // 创建新游戏
  createGame: async () => {
    try {
      const response = await api.post("/games");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 加入游戏
  joinGame: async (gameId) => {
    try {
      const response = await api.post(`/games/${gameId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取游戏列表
  getGames: async (status = "open") => {
    try {
      const response = await api.get(`/games?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取游戏详情
  getGame: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 放置船只
  placeShips: async (gameId, ships) => {
    try {
      const response = await api.post(`/games/${gameId}/ships`, { ships });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 进行攻击
  attack: async (gameId, x, y) => {
    try {
      const response = await api.post(`/games/${gameId}/attack`, { x, y });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取游戏状态
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
