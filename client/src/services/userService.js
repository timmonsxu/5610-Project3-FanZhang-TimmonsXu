import api from "./api";

const userService = {
  // 用户注册
  register: async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 用户登录
  login: async (credentials) => {
    try {
      const response = await api.post("/users/login", credentials, {
        withCredentials: true, // ✅ 关键一行！登录必须显式带 cookie
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取用户信息
  getUserInfo: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      // 如果是 401 未授权错误，返回 null
      if (error.response?.status === 401) {
        return null;
      }
      // 其他错误仍然抛出
      throw error.response?.data || error.message;
    }
  },

  // 获取用户排名
  getUserRankings: async () => {
    try {
      const response = await api.get("/users/rankings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 更新用户信息
  updateUser: async (userData) => {
    try {
      const response = await api.put("/users/me", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 登出
  logout: async () => {
    try {
      const response = await api.post("/users/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
