import { useEffect, useState } from 'react';
import { isTauri } from '../../utils/desktop';
import {
  closeWindow,
  isWindowMaximized,
  minimizeWindow,
  onWindowResized,
  toggleMaximizeWindow,
} from '../../utils/windowControls';
import styles from './WindowControls.module.css';

/**
 * Botones de minimizar/maximizar/cerrar integrados en la cabecera.
 * Solo se muestran dentro de la app de escritorio (ventana sin bordes).
 */
export function WindowControls() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void isWindowMaximized().then((value) => {
      if (active) setMaximized(value);
    });
    void onWindowResized(() => {
      void isWindowMaximized().then((value) => {
        if (active) setMaximized(value);
      });
    }).then((unlisten) => {
      unsubscribe = unlisten;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (!isTauri()) return null;

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.button}
        aria-label="Minimizar"
        onClick={() => void minimizeWindow()}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M1.5 6h9" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label={maximized ? 'Restaurar' : 'Maximizar'}
        onClick={() => void toggleMaximizeWindow()}
      >
        {maximized ? (
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M4.2 1.6h5a1.2 1.2 0 0 1 1.2 1.2v5" />
            <rect x="1.6" y="4.2" width="6.2" height="6.2" rx="1.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <rect x="1.6" y="1.6" width="8.8" height="8.8" rx="1.2" />
          </svg>
        )}
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.close}`}
        aria-label="Cerrar"
        onClick={() => void closeWindow()}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M1.8 1.8l8.4 8.4M10.2 1.8l-8.4 8.4" />
        </svg>
      </button>
    </div>
  );
}
