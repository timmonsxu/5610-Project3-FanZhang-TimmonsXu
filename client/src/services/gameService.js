import api from "./api";

const gameService = {
  // 获取开放游戏列表
  getOpenGames: async () => {
    try {
      const response = await api.get("/games/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取我的开放游戏
  getMyOpenGames: async () => {
    try {
      const response = await api.get("/games/my/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取我的进行中游戏
  getMyActiveGames: async () => {
    try {
      const response = await api.get("/games/my/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取我的已完成游戏
  getMyCompletedGames: async () => {
    try {
      const response = await api.get("/games/my/completed");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取其他用户的游戏
  getOtherGames: async () => {
    try {
      const response = await api.get("/games/other");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取公开的进行中游戏
  getPublicActiveGames: async () => {
    try {
      const response = await api.get("/games/public/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取公开的已完成游戏
  getPublicCompletedGames: async () => {
    try {
      const response = await api.get("/games/public/completed");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

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

  // 获取游戏详情
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

  // 进行游戏移动
  makeMove: async (gameId, moveData) => {
    try {
      const response = await api.post(`/games/${gameId}/move`, moveData);
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
      const response = await api.post(`/games/${gameId}/move`, { x, y });
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
