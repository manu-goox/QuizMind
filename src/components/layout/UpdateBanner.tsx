import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui';
import {
  checkAndInstallUpdate,
  relaunchApp,
  type UpdateStatus,
} from '../../utils/autoUpdate';
import styles from './UpdateBanner.module.css';

type BannerStatus = UpdateStatus | { phase: 'restart'; version: string };

const DEMO_VERSION = '0.2.0';

function title(status: BannerStatus): string {
  switch (status.phase) {
    case 'downloading':
      return `Actualizando a la versión ${status.version}`;
    case 'installing':
      return `Aplicando la versión ${status.version}`;
    case 'restart':
      return `Versión ${status.version} lista`;
  }
}

function subtitle(status: BannerStatus): string {
  switch (status.phase) {
    case 'downloading':
      return status.percent === null
        ? 'Descargando…'
        : `Descargando… ${status.percent}%`;
    case 'installing':
      return 'La aplicación se reiniciará sola en unos segundos';
    case 'restart':
      return 'Se aplicará al reiniciar la aplicación';
  }
}

function isUpdateDemo(): boolean {
  return (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('updateDemo')
  );
}

export function UpdateBanner() {
  const [demo] = useState(isUpdateDemo);
  const [status, setStatus] = useState<BannerStatus | null>(() =>
    demo ? { phase: 'downloading', version: DEMO_VERSION, percent: 0 } : null,
  );

  useEffect(() => {
    // Demo en desarrollo: abre la app web con ?updateDemo=1 para ver el aviso
    // en bucle con progreso simulado (no se incluye en los builds de
    // producción).
    if (demo) {
      let percent = 0;
      let timer: number;
      const tick = () => {
        percent += 10;
        if (percent < 100) {
          setStatus({ phase: 'downloading', version: DEMO_VERSION, percent });
          timer = window.setTimeout(tick, 350);
        } else {
          setStatus({ phase: 'installing', version: DEMO_VERSION });
          percent = 0;
          timer = window.setTimeout(tick, 2500);
        }
      };
      timer = window.setTimeout(tick, 350);
      return () => window.clearTimeout(timer);
    }

    let active = true;
    void checkAndInstallUpdate({
      onStatus: (next) => {
        if (active) setStatus(next);
      },
    }).then((update) => {
      if (!active) return;
      // El actualizador cierra la app por su cuenta al instalar; si seguimos
      // vivos es que el instalador no la cerró: ofrecemos reiniciar a mano.
      setStatus(update ? { phase: 'restart', version: update.version } : null);
    });
    return () => {
      active = false;
    };
  }, [demo]);

  const progressPercent =
    status === null || status.phase === 'restart'
      ? null
      : status.phase === 'installing'
        ? 100
        : status.percent;

  return (
    <AnimatePresence>
      {status !== null && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.dialog}
            role="status"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.text}>
              <span className={styles.title}>{title(status)}</span>
              <span className={styles.subtitle}>{subtitle(status)}</span>
            </div>
            {progressPercent !== null && (
              <div
                className={styles.progress}
                role="progressbar"
                aria-label="Progreso de la actualización"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            {status.phase === 'restart' && (
              <div className={styles.actions}>
                <Button
                  onClick={() => {
                    void relaunchApp();
                  }}
                >
                  Reiniciar ahora
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
