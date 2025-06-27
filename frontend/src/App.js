import React, { useState } from 'react';
import { Settings, MessageSquare, Brain, Plus, History } from 'lucide-react';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import Layout from './components/Layout';
import PreferencesPage from './components/PreferencesPage';
import SimplePrompt from './components/SimplePrompt';
import ChainOfThought from './components/ChainOfThought';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('simple');
  const { colors } = useTheme();

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Settings, component: PreferencesPage },
    { id: 'simple', label: 'Simple Prompt', icon: MessageSquare, component: SimplePrompt },
    { id: 'chainOfThought', label: 'Chain of Thought', icon: Brain, component: ChainOfThought },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SimplePrompt;

  return (
    <Layout>
      {/* Navigation Tabs */}
      <nav className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={colors.tab(activeTab === id)}
          >
            <Icon className="w-4 h-4 inline-block mr-2" />
            {label}
          </button>
        ))}
        <button
          onClick={() => alert('Add new prompt type feature coming soon!')}
          className={colors.tab(false)}
        >
          <Plus className="w-4 h-4 inline-block mr-2" />
          Add New
        </button>
      </nav>

      {/* Active Component */}
      <ActiveComponent />
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;