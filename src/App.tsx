import { useEffect, useLayoutEffect } from 'react';
import {
  BrowserRouter,
  HashRouter,
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
import { isTauri } from './utils/desktop';
import './styles/global.css';
import './styles/variables.css';

// Inside the Tauri webview the app is served over a custom protocol; a hash
// router keeps reloads working on any route (e.g. resuming a quiz), while the
// web build keeps clean URLs.
const Router = isTauri() ? HashRouter : BrowserRouter;

const ROUTE_TITLES: Record<string, string> = {
  '/': 'QuizMind — Tests Interactivos',
  '/start': 'QuizMind — Preparar test',
  '/quiz': 'QuizMind — Test en curso',
  '/results': 'QuizMind — Resultados',
};

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    document.title =
      ROUTE_TITLES[location.pathname] ?? 'QuizMind — Tests Interactivos';
    // En /quiz el foco lo gestiona QuestionCard (h2 de la pregunta)
    if (location.pathname !== '/quiz') {
      document.getElementById('main-content')?.focus();
    }
  }, [location.pathname]);

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
    <Router>
      <MotionConfig reducedMotion="user">
        <AppRoutes />
      </MotionConfig>
    </Router>
  );
}

export default App;
