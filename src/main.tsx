import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/layout';
import { useSettingsStore } from './stores/useSettingsStore';
import { themeManager } from './services/themeManager';

themeManager.applyTheme(useSettingsStore.getState().theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
