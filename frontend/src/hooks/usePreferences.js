import { useState, useEffect } from 'react';
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

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPreferences();
      setPreferences(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPrefs) => {
    try {
      setLoading(true);
      await apiService.updatePreferences(newPrefs);
      setPreferences(newPrefs);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    setPreferences,
    savePreferences,
    loading,
    error,
    reload: loadPreferences
  };
};