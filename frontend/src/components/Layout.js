import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Layout = ({ children }) => {
  const { darkMode, toggleTheme, colors } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${colors.bg} ${colors.text}`}>
      <header className={`border-b ${colors.border} p-4`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Toolkit</h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;