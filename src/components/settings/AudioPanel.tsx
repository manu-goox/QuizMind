import { type ReactNode } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import styles from './AudioPanel.module.css';

interface AudioPanelProps {
  children?: ReactNode;
}

export function AudioPanel({ children }: AudioPanelProps) {
  const audio = useSettingsStore((s) => s.audio);
  const toggleEffects = useSettingsStore((s) => s.toggleEffects);
  const toggleMusic = useSettingsStore((s) => s.toggleMusic);
  const setEffectsVolume = useSettingsStore((s) => s.setEffectsVolume);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <button
          className={`${styles.toggle} ${audio.effectsEnabled ? styles.active : ''}`}
          onClick={toggleEffects}
          title={audio.effectsEnabled ? 'Silenciar efectos' : 'Activar efectos'}
          aria-label={audio.effectsEnabled ? 'Silenciar efectos' : 'Activar efectos'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {audio.effectsEnabled ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            )}
          </svg>
        </button>
        <input
          type="range"
          className={styles.slider}
          min="0"
          max="1"
          step="0.05"
          value={audio.effectsVolume}
          onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
          disabled={!audio.effectsEnabled}
          aria-label="Volumen de efectos"
        />
        </div>

        <div className={styles.divider} />

        <div className={styles.row}>
        <button
          className={`${styles.toggle} ${audio.musicEnabled ? styles.active : ''}`}
          onClick={toggleMusic}
          title={audio.musicEnabled ? 'Silenciar música' : 'Activar música'}
          aria-label={audio.musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          {audio.musicEnabled ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          )}
        </button>
        <input
          type="range"
          className={styles.slider}
          min="0"
          max="1"
          step="0.05"
          value={audio.musicVolume}
          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
          disabled={!audio.musicEnabled}
          aria-label="Volumen de música"
        />
      </div>

      {children}
    </div>
  );
}