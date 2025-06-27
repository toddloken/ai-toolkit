import React, { useState } from 'react';
import { Brain, Copy, AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { apiService } from '../services/api';

const ChainOfThought = () => {
  const { colors, darkMode } = useTheme();
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!problem.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.chainOfThoughtPrompt({ problem });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process problem');
      console.error('Error processing chain of thought:', err);
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
      <h2 className="text-xl font-semibold mb-6">Chain of Thought Reasoning</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Complex Problem</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
            rows="4"
            placeholder="Enter a complex problem that requires step-by-step thinking... (Ctrl+Enter to submit)"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !problem.trim()}
          className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
              Thinking...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 inline-block mr-2" />
              Think Through It
            </>
          )}
        </button>

        {result && (
          <div className="space-y-4">
            {/* Thinking Steps */}
            <div>
              <label className="block text-sm font-medium mb-2">Reasoning Process</label>
              <div className={`p-4 border rounded-lg ${colors.input}`}>
                {result.steps.map((step, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex items-start">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 mt-0.5 ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                      <p className="text-sm flex-1">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Answer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Final Answer</label>
                <button
                  onClick={() => copyToClipboard(result.final_answer)}
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className={`p-4 border rounded-lg ${colors.input} ${
                darkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-200'
              }`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{result.final_answer}</pre>
              </div>
            </div>

            {/* Full Reasoning (Collapsible) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                View Full Reasoning Process
              </summary>
              <div className={`mt-2 p-4 border rounded-lg ${colors.input}`}>
                <pre className="whitespace-pre-wrap text-xs">{result.reasoning_process}</pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainOfThought;