import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedPage, PageWrapper } from '../components/layout';
import { Button, Modal } from '../components/ui';
import { useQuizStore } from '../stores/useQuizStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { audioManager } from '../services/audioManager';
import { getDifficultyLabel } from '../utils/difficulty';
import { formatTime } from '../utils/formatTime';
import {
  getTestHistory,
  getBestPercentage,
  getAveragePercentage,
} from '../utils/historyStats';
import styles from './TestStartPage.module.css';

export function TestStartPage() {
  const navigate = useNavigate();
  const activeTest = useQuizStore((s) => s.activeTest);
  const practiceMode = useQuizStore((s) => s.practiceMode);
  const setPracticeMode = useQuizStore((s) => s.setPracticeMode);
  const historyEntries = useHistoryStore((s) => s.entries);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!activeTest) {
      navigate('/');
    }
  }, [activeTest, navigate]);

  const handleStart = () => {
    audioManager.play('start');
    navigate('/quiz');
  };

  const testHistory = activeTest
    ? getTestHistory(historyEntries, activeTest.id)
    : [];
  const bestPercentage = getBestPercentage(testHistory);
  const averagePercentage = getAveragePercentage(testHistory);

  if (!activeTest) return null;

  return (
    <PageWrapper>
      <AnimatedPage>
        <motion.div
          className={styles.container}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.hero}>
            <motion.h1
              className={styles.title}
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {activeTest.title}
            </motion.h1>
            <motion.p
              className={styles.description}
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {activeTest.description}
            </motion.p>
            <motion.div
              className={styles.meta}
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>
                  {activeTest.questions.length}
                </span>
                <span className={styles.metaLabel}>Preguntas</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>
                  {getDifficultyLabel(activeTest.difficulty)}
                </span>
                <span className={styles.metaLabel}>Dificultad</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaValue}>
                  {activeTest.timeLimit ? `${activeTest.timeLimit} min` : '—'}
                </span>
                <span className={styles.metaLabel}>Tiempo</span>
              </div>
              {!practiceMode && (
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>
                    {Math.round(activeTest.passThreshold * 100)}%
                  </span>
                  <span className={styles.metaLabel}>Aprobado</span>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            className={styles.practiceBlock}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className={styles.practiceToggle}>
              <input
                type="checkbox"
                className={styles.practiceInput}
                checked={practiceMode}
                onChange={(event) => setPracticeMode(event.target.checked)}
              />
              <span className={styles.switch} aria-hidden="true">
                <span className={styles.switchThumb} />
              </span>
              <span>Modo práctica</span>
            </label>
            <p className={styles.practiceHint}>
              Feedback inmediato con la explicación, sin nota ni registro en el
              historial.
            </p>
          </motion.div>

          {testHistory.length > 0 && (
            <motion.div
              className={styles.history}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <div className={styles.historyStats}>
                <div className={styles.historyStat}>
                  <span className={styles.historyStatValue}>
                    {testHistory.length}
                  </span>
                  <span className={styles.historyStatLabel}>
                    {testHistory.length === 1 ? 'intento' : 'intentos'}
                  </span>
                </div>
                <div className={styles.historyStat}>
                  <span className={styles.historyStatValue}>
                    {bestPercentage ?? 0}%
                  </span>
                  <span className={styles.historyStatLabel}>mejor</span>
                </div>
                <div className={styles.historyStat}>
                  <span className={styles.historyStatValue}>
                    {averagePercentage ?? 0}%
                  </span>
                  <span className={styles.historyStatLabel}>media</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowHistoryModal(true)}
              >
                Ver historial
              </Button>
            </motion.div>
          )}

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button size="large" onClick={handleStart}>
              Iniciar Test
            </Button>
          </motion.div>
        </motion.div>

        <Modal
          open={showHistoryModal}
          title={`Historial — ${activeTest.title}`}
          onClose={() => {
            setShowHistoryModal(false);
            setConfirmClear(false);
          }}
          actions={
            confirmClear ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    testHistory.forEach((entry) => removeEntry(entry.id));
                    setConfirmClear(false);
                  }}
                >
                  Sí, borrar
                </Button>
                <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                {testHistory.length > 0 && (
                  <Button variant="ghost" onClick={() => setConfirmClear(true)}>
                    Borrar historial del test
                  </Button>
                )}
                <Button onClick={() => setShowHistoryModal(false)}>
                  Cerrar
                </Button>
              </>
            )
          }
        >
          {confirmClear && (
            <p className={styles.confirmClear} role="alert">
              ¿Seguro que quieres borrar todo el historial de este test? Esta
              acción no se puede deshacer.
            </p>
          )}
          {testHistory.length === 0 ? (
            <p className={styles.historyEmpty}>Sin intentos registrados.</p>
          ) : (
            <ul className={styles.historyList}>
              {testHistory.map((entry) => (
                <li key={entry.id} className={styles.historyItem}>
                  <span>{new Date(entry.date).toLocaleString('es-ES')}</span>
                  <span
                    className={
                      entry.passed ? styles.historyPassed : styles.historyFailed
                    }
                  >
                    {entry.percentage}%
                  </span>
                  <span>{entry.passed ? 'Aprobado' : 'No aprobado'}</span>
                  <span>
                    {entry.mode === 'practice' ? 'Práctica' : 'Normal'}
                  </span>
                  <span>{formatTime(entry.timeSpent)}</span>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removeEntry(entry.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      </AnimatedPage>
    </PageWrapper>
  );
}
