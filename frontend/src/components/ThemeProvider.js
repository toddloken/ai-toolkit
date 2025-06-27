import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-toolkit-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('ai-toolkit-theme', newMode ? 'dark' : 'light');
  };

  const theme = {
    darkMode,
    toggleTheme,
    colors: {
      bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
      text: darkMode ? 'text-gray-100' : 'text-gray-900',
      card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      input: darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      button: darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white',
      tab: (isActive) => darkMode
        ? `px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`
        : `px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`,
      border: darkMode ? 'border-gray-700' : 'border-gray-200'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};