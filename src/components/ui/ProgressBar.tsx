import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  skipped?: number;
}

export function ProgressBar({ current, total, skipped = 0 }: ProgressBarProps) {
  const answered = current;
  const percent = (value: number) => (total > 0 ? (value / total) * 100 : 0);

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
          style={{ width: `${percent(answered)}%` }}
        />
        <div
          className={styles.skipped}
          style={{ width: `${percent(skipped)}%` }}
        />
      </div>
      <span className={styles.text}>
        {answered} / {total}
      </span>
    </div>
  );
}
