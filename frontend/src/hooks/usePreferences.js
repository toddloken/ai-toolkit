import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState({
    openai_api_key: '',
    claude_api_key: '',
    ollama_endpoint: 'http://localhost:11434',
    default_model: 'gpt-3.5-turbo',
    max_tokens: 2048,
    temperature: 0.7
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPreferences();
      setPreferences(response.data);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updatePreferences(newPreferences);
      setPreferences(response.data);
      return true;
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preferences,
    loadPreferences,
    savePreferences,
    loading,
    error
  };
};