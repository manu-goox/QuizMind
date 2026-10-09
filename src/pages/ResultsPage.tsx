import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { Button, Badge } from '../components/ui';
import { CircularProgress } from '../components/ui/CircularProgress';
import { QuestionCard } from '../components/quiz';
import { useQuizStore } from '../stores/useQuizStore';
import { useTestsStore } from '../stores/useTestsStore';
import { collectFailedQuestions } from '../utils/failedQuestions';
import { useHistoryStore } from '../stores/useHistoryStore';
import {
  getTestHistory,
  getBestPercentage,
  getAveragePercentage,
} from '../utils/historyStats';
import styles from './ResultsPage.module.css';

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function ResultsPage() {
  const navigate = useNavigate();
  const { activeTest, answers, resetQuiz, status } = useQuizStore();
  const results = useQuizStore((s) => s.result);
  const [showReview, setShowReview] = useState(false);
  const selectedId = useTestsStore((s) => s.selectedId);
  const practiceMode = useQuizStore((s) => s.practiceMode);
  const historyEntries = useHistoryStore((s) => s.entries);

  useEffect(() => {
    if (status !== 'finished' || !activeTest) {
      navigate('/');
    }
  }, [status, activeTest, navigate]);

  if (!activeTest || !results) return null;

  const failedQuestions = collectFailedQuestions(activeTest, answers);
  const testHistory = getTestHistory(historyEntries, activeTest.id);
  const bestPercentage = getBestPercentage(testHistory);
  const averagePercentage = getAveragePercentage(testHistory);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    resetQuiz();
    if (selectedId) useTestsStore.getState().setSelectedTestId(selectedId);
    navigate('/');
  };

  const handleRetry = () => {
    if (!activeTest) return;
    useQuizStore.getState().startTest(activeTest);
    navigate('/start');
  };

  const handleReviewFailures = () => {
    if (!activeTest || failedQuestions.length === 0) return;
    const store = useQuizStore.getState();
    store.startTest({
      ...activeTest,
      title: `${activeTest.title} (repaso de fallos)`,
      questions: failedQuestions,
      shuffleQuestions: false,
      shuffleAnswers: false,
    });
    store.setPracticeMode(true);
    navigate('/quiz');
  };

  return (
    <PageWrapper>
      <div className={styles.container}>
        <AnimatedPage>
          <motion.div
            className={styles.scoreCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <CircularProgress
              percentage={results.percentage}
              status={
                practiceMode ? 'neutral' : results.passed ? 'success' : 'error'
              }
            />
            <h1 className={styles.resultTitle}>
              {results.passed ? 'Felicidades' : 'Test completado'}
            </h1>
            {!practiceMode && (
              <>
                <Badge variant={results.passed ? 'success' : 'error'}>
                  {results.passed ? 'Aprobado' : 'No aprobado'}
                </Badge>
                <span className={styles.threshold}>
                  Nota mínima: {Math.round(activeTest.passThreshold * 100)}%
                </span>
              </>
            )}
            {practiceMode && (
              <span className={styles.threshold}>Modo práctica — sin nota</span>
            )}
            {results.annulled > 0 && (
              <span className={styles.annulled}>
                {results.annulled === 1
                  ? '1 pregunta anulada no cuenta para la nota'
                  : `${results.annulled} preguntas anuladas no cuentan para la nota`}
              </span>
            )}
          </motion.div>

          <motion.div
            className={styles.stats}
            variants={statsContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={`${styles.stat} ${styles.statCorrect}`}
              variants={statItemVariants}
            >
              <span className={styles.statValue}>{results.correct}</span>
              <span className={styles.statSub}>de {results.total}</span>
              <span className={styles.statLabel}>Correctas</span>
            </motion.div>
            <motion.div
              className={`${styles.stat} ${styles.statWrong}`}
              variants={statItemVariants}
            >
              <span className={styles.statValue}>{results.wrong}</span>
              <span className={styles.statLabel}>Incorrectas</span>
            </motion.div>
            <motion.div
              className={`${styles.stat} ${styles.statBlank}`}
              variants={statItemVariants}
            >
              <span className={styles.statValue}>{results.blank}</span>
              <span className={styles.statLabel}>En blanco</span>
            </motion.div>
            <motion.div
              className={`${styles.stat} ${styles.statTime}`}
              variants={statItemVariants}
            >
              <span className={styles.statValue}>
                {formatTime(results.timeSpent)}
              </span>
              <span className={styles.statLabel}>Tiempo</span>
            </motion.div>
          </motion.div>

          {!practiceMode && testHistory.length > 0 && (
            <motion.div
              className={styles.history}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className={styles.historyHeader}>
                <h2 className={styles.historyTitle}>Historial del test</h2>
                <span className={styles.historySummary}>
                  Mejor: {bestPercentage}% · Media: {averagePercentage}%
                </span>
              </div>
              <ul className={styles.historyList}>
                {testHistory.slice(0, 5).map((entry) => (
                  <li key={entry.id} className={styles.historyItem}>
                    <span>
                      {new Date(entry.date).toLocaleDateString('es-ES')}
                    </span>
                    <span>{entry.percentage}%</span>
                    <span
                      className={
                        entry.passed
                          ? styles.historyPassed
                          : styles.historyFailed
                      }
                    >
                      {entry.passed ? 'Aprobado' : 'No aprobado'}
                    </span>
                    <span>{formatTime(entry.timeSpent)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            {failedQuestions.length > 0 && (
              <Button variant="secondary" onClick={handleReviewFailures}>
                Repasar fallos ({failedQuestions.length})
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowReview(!showReview)}
            >
              {showReview ? 'Ocultar respuestas' : 'Revisar respuestas'}
            </Button>
            <Button variant="ghost" onClick={handleRetry}>
              Repetir test
            </Button>
            <Button variant="primary" onClick={handleRestart}>
              Volver al inicio
            </Button>
          </motion.div>

          {showReview && (
            <motion.div
              className={styles.review}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeTest.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selectedAnswerId={answers[question.id] || null}
                  showResult={true}
                  onSelectAnswer={() => {}}
                />
              ))}
            </motion.div>
          )}
        </AnimatedPage>
      </div>
    </PageWrapper>
  );
}
