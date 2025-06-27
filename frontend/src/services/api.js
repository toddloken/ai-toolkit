import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const apiService = {
  // Preferences
  getPreferences: () => api.get('/preferences'),
  updatePreferences: (preferences) => api.post('/preferences', preferences),

  // Prompts
  simplePrompt: (data) => api.post('/prompt/simple', data),
  chainOfThoughtPrompt: (data) => api.post('/prompt/chain-of-thought', data),

  // Models and health
  getModels: () => api.get('/models'),
  healthCheck: () => api.get('/health'),
  getHistory: () => api.get('/history'),
};

export default apiService;