import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, TestStartPage, QuizPage, ResultsPage } from "./pages";
import { useSettingsStore } from "./stores/useSettingsStore";
import { audioManager } from "./services/audioManager";
import { themeManager } from "./services/themeManager";
import "./styles/global.css";
import "./styles/variables.css";

function App() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const unlockAudio = useSettingsStore((s) => s.unlockAudio);

  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    loadSettings();
    audioManager.init();

    const handleFirstInteraction = () => {
      audioManager.unlock();
      unlockAudio();
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, [loadSettings, unlockAudio]);

  useEffect(() => {
    themeManager.applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<TestStartPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
