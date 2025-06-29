import React, { useState, useEffect } from 'react';
import { Send, Copy, AlertCircle, Save, HelpCircle, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { apiService } from '../services/api';

const InputField = ({
                      label,
                      tooltip,
                      value,
                      onChange,
                      type = 'textarea',
                      rows = 3,
                      placeholder = '',
                      colors
                    }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium">{label}</label>
        <div className="relative group">
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      {type === 'input' ? (
          <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.input}`}
              placeholder={placeholder}
          />
      ) : (
          <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${colors.input}`}
              rows={rows}
              placeholder={placeholder}
          />
      )}
    </div>
);

const SimplePrompt = () => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    context: '',
    inputData: '',
    outputIndicator: '',
    negativePrompting: ''
  });
  const [combinedPrompt, setCombinedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // New state for load functionality
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState(null);

  // Update combined prompt whenever form data changes
  useEffect(() => {
    const generateCombinedPrompt = () => {
      const sections = [];

      if (formData.instructions.trim()) {
        sections.push(`Instructions:\n${formData.instructions.trim()}`);
      }

      if (formData.context.trim()) {
        sections.push(`Context:\n${formData.context.trim()}`);
      }

      if (formData.inputData.trim()) {
        sections.push(`Input Data:\n${formData.inputData.trim()}`);
      }

      if (formData.outputIndicator.trim()) {
        sections.push(`Output Requirements:\n${formData.outputIndicator.trim()}`);
      }

      // Only include negative prompting if it's not empty
      if (formData.negativePrompting.trim()) {
        sections.push(`Avoid:\n${formData.negativePrompting.trim()}`);
      }

      return sections.join('\n\n');
    };

    setCombinedPrompt(generateCombinedPrompt());
  }, [formData]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!combinedPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await apiService.simplePrompt({ prompt: combinedPrompt });
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
    setSuccessMessage('Copied to clipboard!');
  };

  const handleSaveToDatabase = async () => {
    if (!formData.title.trim() || !combinedPrompt.trim()) {
      setError('Title and combined prompt are required to save');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promptData = {
        title: formData.title,
        instructions: formData.instructions,
        context: formData.context,
        inputData: formData.inputData,
        outputIndicator: formData.outputIndicator,
        negativePrompting: formData.negativePrompting,
        combinedPrompt: combinedPrompt,
        response: response
      };

      let result;
      if (currentPromptId) {
        // Update existing prompt
        result = await apiService.updatePrompt(currentPromptId, promptData);
        setSuccessMessage('Prompt updated successfully!');
      } else {
        // Create new prompt
        result = await apiService.savePrompt(promptData);
        setCurrentPromptId(result.data.id || result.data._id);
        setSuccessMessage('Prompt saved successfully!');
      }

      console.log('Prompt saved successfully:', result.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prompt to database');
      console.error('Error saving prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load saved prompts from database
  const loadSavedPrompts = async () => {
    setLoadingPrompts(true);
    setError(null);

    try {
      const result = await apiService.getPrompts();
      console.log('API Response:', result); // Debug log

      // Handle different possible response structures
      let prompts = [];
      if (result.data && Array.isArray(result.data)) {
        prompts = result.data;
      } else if (Array.isArray(result)) {
        prompts = result;
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        prompts = result.data.data;
      }

      console.log('Processed prompts:', prompts); // Debug log
      setSavedPrompts(prompts);
      setShowLoadDialog(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prompts from database');
      console.error('Error loading prompts:', err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  // Load selected prompt
  const handleLoadPrompt = async () => {
    if (!selectedPromptId) return;

    setLoading(true);
    setError(null);

    try {
      const selectedPrompt = savedPrompts.find(p => (p._id || p.id) === selectedPromptId);

      if (selectedPrompt) {
        setFormData({
          title: selectedPrompt.title || '',
          instructions: selectedPrompt.instructions || '',
          context: selectedPrompt.context || '',
          inputData: selectedPrompt.inputData || '',
          outputIndicator: selectedPrompt.outputIndicator || '',
          negativePrompting: selectedPrompt.negativePrompting || ''
        });
        setResponse(selectedPrompt.response || '');
        setCurrentPromptId(selectedPrompt._id || selectedPrompt.id);
        setShowLoadDialog(false);
        setSelectedPromptId('');
        setSuccessMessage('Prompt loaded successfully!');
      }
    } catch (err) {
      setError('Failed to load selected prompt');
      console.error('Error loading selected prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete prompt from database
  const handleDeleteFromDatabase = async () => {
    if (!currentPromptId) {
      setError('No prompt is currently loaded to delete');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this prompt from the database? This action cannot be undone.');

    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      await apiService.deletePrompt(currentPromptId);

      // Clear the form after successful deletion
      setFormData({
        title: '',
        instructions: '',
        context: '',
        inputData: '',
        outputIndicator: '',
        negativePrompting: ''
      });
      setResponse('');
      setCurrentPromptId(null);
      setSuccessMessage('Prompt deleted successfully!');

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete prompt from database');
      console.error('Error deleting prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new prompt (clear form)
  const handleNewPrompt = () => {
    setFormData({
      title: '',
      instructions: '',
      context: '',
      inputData: '',
      outputIndicator: '',
      negativePrompting: ''
    });
    setResponse('');
    setCurrentPromptId(null);
    setError(null);
    setSuccessMessage('Form cleared for new prompt!');
  };

  return (
      <div className={`rounded-lg border p-6 ${colors.card}`}>
        <h2 className="text-xl font-semibold mb-6">Enhanced Prompt Builder</h2>

        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
        )}

        {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
        )}

        <div className="space-y-6">
          {/* Title Field with status indicator */}
          <InputField
              label={`Title ${currentPromptId ? '(Currently Loaded)' : '(New)'}`}
              tooltip="Title to be saved to MongoDB"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              type="input"
              placeholder="Enter a title for this prompt..."
              colors={colors}
          />

          {/* Instructions Field */}
          <InputField
              label="Instructions"
              tooltip="Specific tasks and / or directions for the model"
              value={formData.instructions}
              onChange={(value) => handleInputChange('instructions', value)}
              rows={4}
              placeholder="Provide specific tasks and directions..."
              colors={colors}
          />

          {/* Context Field */}
          <InputField
              label="Context"
              tooltip="Background information and Frameworks"
              value={formData.context}
              onChange={(value) => handleInputChange('context', value)}
              rows={4}
              placeholder="Add background information and frameworks..."
              colors={colors}
          />

          {/* Input Data Field */}
          <InputField
              label="Input Data"
              tooltip="Specific Information or Attachments to Process"
              value={formData.inputData}
              onChange={(value) => handleInputChange('inputData', value)}
              rows={4}
              placeholder="Provide specific information or data to process..."
              colors={colors}
          />

          {/* Output Indicator Field */}
          <InputField
              label="Output Indicator"
              tooltip="Desired format and / or type of response"
              value={formData.outputIndicator}
              onChange={(value) => handleInputChange('outputIndicator', value)}
              rows={3}
              placeholder="Specify the desired output format..."
              colors={colors}
          />

          {/* Negative Prompting Field */}
          <InputField
              label="Negative Prompting"
              tooltip="Tell the model what to avoid, or eliminate unwanted content, prevent model assumptions etc."
              value={formData.negativePrompting}
              onChange={(value) => handleInputChange('negativePrompting', value)}
              rows={3}
              placeholder="Specify what the model should avoid... (optional)"
              colors={colors}
          />

          {/* Combined Output */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Combined Prompt Output</label>
              <button
                  onClick={() => copyToClipboard(combinedPrompt)}
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
                  disabled={!combinedPrompt.trim()}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
            <div className={`p-4 border rounded-lg ${colors.input}`}>
            <pre className="whitespace-pre-wrap text-sm font-mono min-h-[100px]">
              {combinedPrompt || 'Your combined prompt will appear here...'}
            </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
                onClick={handleSubmit}
                disabled={loading || !combinedPrompt.trim()}
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

            <button
                onClick={handleSaveToDatabase}
                disabled={loading || !formData.title.trim() || !combinedPrompt.trim()}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save className="w-4 h-4 inline-block mr-2" />
                    {currentPromptId ? 'Update' : 'Save'} to Database
                  </>
              )}
            </button>

            <button
                onClick={loadSavedPrompts}
                disabled={loadingPrompts}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPrompts ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                    Loading...
                  </>
              ) : (
                  <>
                    <Upload className="w-4 h-4 inline-block mr-2" />
                    Load Previous
                  </>
              )}
            </button>

            <button
                onClick={handleDeleteFromDatabase}
                disabled={loading || !currentPromptId}
                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 inline-block mr-2" />
              Delete from Database
            </button>

            <button
                onClick={handleNewPrompt}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4 inline-block mr-2" />
              New Prompt
            </button>
          </div>

          {/* Load Dialog */}
          {showLoadDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`bg-white rounded-lg p-6 w-full max-w-md max-h-96 ${colors.card}`}>
                  <h3 className="text-lg font-semibold mb-4">Load Previous Prompt</h3>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {!Array.isArray(savedPrompts) || savedPrompts.length === 0 ? (
                        <p className="text-gray-500">No saved prompts found.</p>
                    ) : (
                        savedPrompts.map((prompt) => (
                            <div
                                key={prompt._id || prompt.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                    selectedPromptId === (prompt._id || prompt.id)
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedPromptId(prompt._id || prompt.id)}
                            >
                              <div className="font-medium">{prompt.title}</div>
                              <div className="text-sm text-gray-500 truncate">
                                {prompt.instructions?.substring(0, 100)}...
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Created: {new Date(prompt.createdAt || prompt.created_at || Date.now()).toLocaleDateString()}
                              </div>
                            </div>
                        ))
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => {
                          setShowLoadDialog(false);
                          setSelectedPromptId('');
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleLoadPrompt}
                        disabled={!selectedPromptId || loading}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load Selected
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Response Output */}
          {response && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
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