import { useEffect, useLayoutEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { HomePage, TestStartPage, QuizPage, ResultsPage } from './pages';
import { useSettingsStore } from './stores/useSettingsStore';
import { audioManager } from './services/audioManager';
import { themeManager } from './services/themeManager';
import './styles/global.css';
import './styles/variables.css';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<TestStartPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    loadSettings();
    audioManager.init();

    const handleFirstInteraction = () => {
      audioManager.unlock();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [loadSettings]);

  useLayoutEffect(() => {
    themeManager.applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppRoutes />
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
