import api from "./api";

const userService = {
  
  register: async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  login: async (credentials) => {
    try {
      const response = await api.post("/users/login", credentials, {
        withCredentials: true, 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getUserInfo: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      
      if (error.response?.status === 401) {
        return null;
      }
      
      throw error.response?.data || error.message;
    }
  },


  getUserRankings: async () => {
    try {
      const response = await api.get("/users/rankings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  updateUser: async (userData) => {
    try {
      const response = await api.put("/users/me", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


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
