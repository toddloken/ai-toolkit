// frontend/src/services/api.js
import axios from 'axios';

// Your existing API (port 8000)
const MAIN_API_BASE_URL = 'http://localhost:8000';

// Your new support server (port 5000)
const SUPPORT_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const mainApi = axios.create({
  baseURL: MAIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const supportApi = axios.create({
  baseURL: SUPPORT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const apiService = {
  // Your existing endpoints (port 8000)
  getPreferences: () => mainApi.get('/preferences'),
  updatePreferences: (preferences) => mainApi.post('/preferences', preferences),
  chainOfThoughtPrompt: (data) => mainApi.post('/prompt/chain-of-thought', data),
  getModels: () => mainApi.get('/models'),
  healthCheck: () => mainApi.get('/health'),
  getHistory: () => mainApi.get('/history'),

  // Updated simple prompt - try main API first, fallback to support
  simplePrompt: async (data) => {
    try {
      // Try your existing API first
      return await mainApi.post('/prompt/simple', data);
    } catch (error) {
      // If main API fails, try support API
      console.warn('Main API failed, trying support API:', error.message);
      return await supportApi.post('/simple-prompt', data);
    }
  },

  // New MongoDB operations (port 5000)
  savePrompt: async (promptData) => {
    try {
      return await supportApi.post('/prompts/save', promptData);
    } catch (error) {
      console.error('Error in savePrompt:', error);
      throw error;
    }
  },

  getAllPrompts: async () => {
    try {
      return await supportApi.get('/prompts');
    } catch (error) {
      console.error('Error in getAllPrompts:', error);
      throw error;
    }
  },

  getPromptById: async (id) => {
    try {
      return await supportApi.get(`/prompts/${id}`);
    } catch (error) {
      console.error('Error in getPromptById:', error);
      throw error;
    }
  },

  deletePrompt: async (id) => {
    try {
      return await supportApi.delete(`/prompts/${id}`);
    } catch (error) {
      console.error('Error in deletePrompt:', error);
      throw error;
    }
  }
};

export default apiService;