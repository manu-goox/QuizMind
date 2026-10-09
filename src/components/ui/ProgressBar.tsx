import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  skipped?: number;
}

export function ProgressBar({ current, total, skipped = 0 }: ProgressBarProps) {
  const answered = current;

  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-label={`Progreso del test: ${answered} de ${total} preguntas respondidas`}
      >
        <div
          className={styles.answered}
          style={{ width: `${(answered / total) * 100}%` }}
        />
        <div
          className={styles.skipped}
          style={{ width: `${(skipped / total) * 100}%` }}
        />
      </div>
      <span className={styles.text}>
        {answered} / {total}
      </span>
    </div>
  );
}
