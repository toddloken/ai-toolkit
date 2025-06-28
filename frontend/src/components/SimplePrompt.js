import React, { useState, useEffect } from 'react';
import { Send, Copy, AlertCircle, Save, HelpCircle } from 'lucide-react';
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

      const result = await apiService.savePrompt(promptData);

      // Success feedback - you might want to show a success message
      console.log('Prompt saved successfully:', result.data);

      // Optional: Show success message to user
      alert('Prompt saved successfully to database!');

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prompt to database');
      console.error('Error saving prompt:', err);
    } finally {
      setLoading(false);
    }
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

        <div className="space-y-6">
          {/* Title Field */}
          <InputField
              label="Title"
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
          <div className="flex gap-4">
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
                    Save to Database
                  </>
              )}
            </button>
          </div>

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