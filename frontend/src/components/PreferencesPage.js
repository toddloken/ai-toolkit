import React, { useState } from 'react';
import { Save, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePreferences } from '../hooks/usePreferences';

const PreferencesPage = () => {
  const { colors } = useTheme();
  const { preferences, savePreferences, loading, error } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saveStatus, setSaveStatus] = useState(null);

  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleSave = async () => {
    const success = await savePreferences(localPrefs);
    setSaveStatus(success ? 'success' : 'error');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleChange = (field, value) => {
    setLocalPrefs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`rounded-lg border p-6 ${colors.card}`}>
      <h2 className="text-xl font-semibold mb-6">API Configuration</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Preferences saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            <Key className="w-4 h-4 inline-block mr-1" />
            OpenAI API Key
          </label>
          <input
            type="password"
            value={localPrefs.openai_api_key || ''}
            onChange={(e) => handleChange('openai_api_key', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            placeholder="sk-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Key className="w-4 h-4 inline-block mr-1" />
            Claude API Key
          </label>
          <input
            type="password"
            value={localPrefs.claude_api_key || ''}
            onChange={(e) => handleChange('claude_api_key', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            placeholder="sk-ant-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ollama Endpoint</label>
          <input
            type="url"
            value={localPrefs.ollama_endpoint}
            onChange={(e) => handleChange('ollama_endpoint', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            placeholder="http://localhost:11434"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Default Model</label>
          <select
            value={localPrefs.default_model}
            onChange={(e) => handleChange('default_model', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
          >
            <optgroup label="OpenAI">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </optgroup>
            <optgroup label="Claude">
              <option value="claude-3-haiku">Claude 3 Haiku</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
            </optgroup>
            <optgroup label="Ollama">
              <option value="llama2">Llama 2</option>
              <option value="codellama">Code Llama</option>
              <option value="mistral">Mistral</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Tokens</label>
          <input
            type="number"
            value={localPrefs.max_tokens}
            onChange={(e) => handleChange('max_tokens', parseInt(e.target.value) || 2048)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            min="1"
            max="8192"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Temperature: {localPrefs.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={localPrefs.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`mt-6 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
      >
        <Save className="w-4 h-4 inline-block mr-2" />
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default PreferencesPage;