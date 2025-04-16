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
      const response = await api.post("/users/login", credentials);
      if (response.data.user?.token) {
        localStorage.setItem("token", response.data.user.token);
      }
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
  logout: () => {
    localStorage.removeItem("token");
  },
};

export default userService;
