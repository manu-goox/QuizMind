import type { TestMetadata } from '../../types';
import { Badge } from '../ui';
import { difficultyVariants, getDifficultyLabel } from '../../utils/difficulty';
import styles from './TestCard.module.css';

interface TestCardProps {
  test: TestMetadata;
  selected: boolean;
  onClick: () => void;
  bestPercentage?: number;
  attempts?: number;
}

export function TestCard({
  test,
  selected,
  onClick,
  bestPercentage,
  attempts = 0,
}: TestCardProps) {
  const completed = attempts > 0;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      aria-label={`${test.title} — ${test.questionCount} preguntas`}
    >
      <span className={styles.header}>
        <span className={styles.category}>{test.category || 'General'}</span>
        <span className={styles.headerBadges}>
          {completed && (
            <span className={styles.completedMark} aria-hidden="true">
              ✓
            </span>
          )}
          <Badge variant={difficultyVariants[test.difficulty]}>
            {getDifficultyLabel(test.difficulty)}
          </Badge>
        </span>
      </span>
      <span className={styles.title}>{test.title}</span>
      <span className={styles.meta}>
        <span className={styles.questions}>{test.questionCount} preguntas</span>
        {completed && bestPercentage !== undefined && (
          <span className={styles.bestScore}>Mejor {bestPercentage}%</span>
        )}
      </span>
    </button>
  );
}
