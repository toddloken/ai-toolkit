import React, { useState } from 'react';
import { Save, Key, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePreferences } from '../hooks/usePreferences';

const PreferencesPage = () => {
  const { colors } = useTheme();
  const { preferences, savePreferences, loadPreferences, loading, error } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false
  });
  const [manualLoadRequested, setManualLoadRequested] = useState(false);

  // Get API keys from environment variables
  const envKeys = {
    openai_api_key: process.env.REACT_APP_OPENAI_API_KEY || '',
    claude_api_key: process.env.REACT_APP_CLAUDE_API_KEY || '',
  };

  React.useEffect(() => {
    // Merge preferences with environment variables, prioritizing env vars
    const mergedPrefs = {
      ...preferences,
      ...envKeys
    };
    setLocalPrefs(mergedPrefs);
  }, [preferences]);

  const handleLoadPreferences = async () => {
    setManualLoadRequested(true);
    await loadPreferences();
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent form submission

    // Don't save API keys to preferences if they're from environment
    const prefsToSave = { ...localPrefs };
    if (envKeys.openai_api_key) {
      delete prefsToSave.openai_api_key;
    }
    if (envKeys.claude_api_key) {
      delete prefsToSave.claude_api_key;
    }

    const success = await savePreferences(prefsToSave);
    setSaveStatus(success ? 'success' : 'error');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleChange = (field, value) => {
    setLocalPrefs(prev => ({ ...prev, [field]: value }));
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }));
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '••••••••••••••••';
  };

  const isKeyFromEnv = (keyType) => {
    return keyType === 'openai' ? !!envKeys.openai_api_key : !!envKeys.claude_api_key;
  };

  return (
      <div className={`rounded-lg border p-6 ${colors.card}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">API Configuration</h2>
          <button
              onClick={handleLoadPreferences}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button} text-sm`}
          >
            <RefreshCw className={`w-4 h-4 inline-block mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Load Preferences'}
          </button>
        </div>

        {error && manualLoadRequested && (
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

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Key className="w-4 h-4 inline-block mr-1" />
                OpenAI API Key
                {isKeyFromEnv('openai') && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  From Environment
                </span>
                )}
              </label>
              <div className="relative">
                <input
                    type={showKeys.openai ? "text" : "password"}
                    value={isKeyFromEnv('openai') ?
                        (showKeys.openai ? envKeys.openai_api_key : maskKey(envKeys.openai_api_key)) :
                        (localPrefs.openai_api_key || '')
                    }
                    onChange={(e) => !isKeyFromEnv('openai') && handleChange('openai_api_key', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input} ${
                        isKeyFromEnv('openai') ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="sk-..."
                    disabled={isKeyFromEnv('openai')}
                    autoComplete="current-password"
                />
                <button
                    type="button"
                    onClick={() => toggleKeyVisibility('openai')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Key className="w-4 h-4 inline-block mr-1" />
                Claude API Key
                {isKeyFromEnv('claude') && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  From Environment
                </span>
                )}
              </label>
              <div className="relative">
                <input
                    type={showKeys.claude ? "text" : "password"}
                    value={isKeyFromEnv('claude') ?
                        (showKeys.claude ? envKeys.claude_api_key : maskKey(envKeys.claude_api_key)) :
                        (localPrefs.claude_api_key || '')
                    }
                    onChange={(e) => !isKeyFromEnv('claude') && handleChange('claude_api_key', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input} ${
                        isKeyFromEnv('claude') ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="sk-ant-..."
                    disabled={isKeyFromEnv('claude')}
                    autoComplete="current-password"
                />
                <button
                    type="button"
                    onClick={() => toggleKeyVisibility('claude')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ollama Endpoint</label>
              <input
                  type="url"
                  value={localPrefs.ollama_endpoint || ''}
                  onChange={(e) => handleChange('ollama_endpoint', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
                  placeholder="http://localhost:11434"
                  autoComplete="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Model</label>
              <select
                  value={localPrefs.default_model || 'gpt-3.5-turbo'}
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
                  value={localPrefs.max_tokens || 2048}
                  onChange={(e) => handleChange('max_tokens', parseInt(e.target.value) || 2048)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
                  min="1"
                  max="8192"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Temperature: {localPrefs.temperature || 0.7}
              </label>
              <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localPrefs.temperature || 0.7}
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
              type="submit"
              disabled={loading}
              className={`mt-6 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
          >
            <Save className="w-4 h-4 inline-block mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
  );
};

export default PreferencesPage;