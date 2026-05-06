import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout';
import { Button } from '../components/ui';
import { AudioPanel } from '../components/settings/AudioPanel';
import { useQuizStore } from '../stores/useQuizStore';
import { audioManager } from '../services/audioManager';
import styles from './TestStartPage.module.css';

export function TestStartPage() {
  const navigate = useNavigate();
  const activeTest = useQuizStore((s) => s.activeTest);

  useEffect(() => {
    if (!activeTest) {
      navigate('/');
    }
  }, [activeTest, navigate]);

  const handleStart = () => {
    audioManager.play('start');
    navigate('/quiz');
  };

  if (!activeTest) return null;

  return (
    <PageWrapper>
      <AudioPanel />
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
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
          className={styles.stats}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span>{activeTest.questions.length} preguntas</span>
          <span>Dificultad: {activeTest.difficulty}</span>
        </motion.div>
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
    </PageWrapper>
  );
}