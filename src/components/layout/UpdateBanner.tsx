import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui';
import { checkAndInstallUpdate, relaunchApp } from '../../utils/autoUpdate';
import styles from './UpdateBanner.module.css';

export function UpdateBanner() {
  const [version, setVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    void checkAndInstallUpdate().then((update) => {
      if (active && update) setVersion(update.version);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AnimatePresence>
      {version !== null && !dismissed && (
        <motion.div
          className={styles.banner}
          role="status"
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 24, x: '-50%' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={styles.text}>
            <span className={styles.title}>Versión {version} lista</span>
            <span className={styles.subtitle}>
              Se aplicará al reiniciar la aplicación
            </span>
          </div>
          <div className={styles.actions}>
            <Button
              size="small"
              onClick={() => {
                void relaunchApp();
              }}
            >
              Reiniciar ahora
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              Más tarde
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
