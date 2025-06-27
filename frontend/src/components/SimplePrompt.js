import React, { useState } from 'react';
import { Send, Copy, AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { apiService } from '../services/api';

const SimplePrompt = () => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await apiService.simplePrompt({ prompt });
      setResponse(result.data.response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process prompt');
      console.error('Error processing prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${colors.card}`}>
      <h2 className="text-xl font-semibold mb-6">Simple Prompt</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            rows="4"
            placeholder="Enter your prompt here... (Ctrl+Enter to submit)"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 inline-block mr-2" />
              Send Prompt
            </>
          )}
        </button>

        {response && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Response</label>
              <button
                onClick={() => copyToClipboard(response)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
            <div className={`p-4 border rounded-lg ${colors.input}`}>
              <pre className="whitespace-pre-wrap text-sm font-mono">{response}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePrompt;