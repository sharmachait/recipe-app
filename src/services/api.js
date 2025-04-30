import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Recipe API service
export const RecipeService = {
  // Get all recipes
  getAllRecipes: async () => {
    try {
      const response = await api.get('/recipes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipe by ID
  getRecipeById: async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search recipes by query
  searchRecipes: async (query) => {
    try {
      const response = await api.get(`/recipes/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipes by tag
  getRecipesByTag: async (tag) => {
    try {
      const response = await api.get(`/recipes/tag/${encodeURIComponent(tag)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;