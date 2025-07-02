
import React, { useState, useEffect, useCallback } from 'react';
import AccessPage from './components/AccessPage';
import ConfigPage from './components/ConfigPage';
import MainPage from './components/MainPage';
import { ApiKeys } from './types';

type AppState = 'ACCESS' | 'CONFIG' | 'MAIN';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('ACCESS');
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);

  useEffect(() => {
    const hasAccess = sessionStorage.getItem('app_accessed') === 'true';
    if (!hasAccess) {
      setAppState('ACCESS');
      return;
    }

    try {
      const keysString = localStorage.getItem('api_keys');
      if (keysString) {
        const parsedKeys = JSON.parse(keysString) as ApiKeys;
        if (parsedKeys.gemini && parsedKeys.openrouter) {
          setApiKeys(parsedKeys);
          setAppState('MAIN');
        } else {
          setAppState('CONFIG');
        }
      } else {
        setAppState('CONFIG');
      }
    } catch (error) {
        console.error("Failed to parse API keys from localStorage", error);
        setAppState('CONFIG');
    }
  }, []);

  const handleAccessGranted = useCallback(() => {
    sessionStorage.setItem('app_accessed', 'true');
    setAppState('CONFIG');
  }, []);

  const handleConfigSaved = useCallback((savedKeys: ApiKeys) => {
    setApiKeys(savedKeys);
    setAppState('MAIN');
  }, []);
  
  const handleReconfigure = useCallback(() => {
    setAppState('CONFIG');
  }, []);

  const renderPage = () => {
    switch (appState) {
      case 'ACCESS':
        return <AccessPage onAccessGranted={handleAccessGranted} />;
      case 'CONFIG':
        return <ConfigPage onConfigSaved={handleConfigSaved} />;
      case 'MAIN':
        return apiKeys ? <MainPage apiKeys={apiKeys} onReconfigure={handleReconfigure} /> : <ConfigPage onConfigSaved={handleConfigSaved} />;
      default:
        return <AccessPage onAccessGranted={handleAccessGranted} />;
    }
  };

  return (
    <div className="bg-background text-text-primary min-h-screen font-sans">
      {renderPage()}
    </div>
  );
};

export default App;
