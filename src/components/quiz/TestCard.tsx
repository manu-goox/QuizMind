import type { TestMetadata } from '../../types';
import { Badge } from '../ui';
import styles from './TestCard.module.css';

interface TestCardProps {
  test: TestMetadata;
  selected: boolean;
  onClick: () => void;
}

const difficultyColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
} as const;

export function TestCard({ test, selected, onClick }: TestCardProps) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.header}>
        <span className={styles.category}>{test.category || 'General'}</span>
        <Badge variant={difficultyColors[test.difficulty]}>{test.difficulty}</Badge>
      </div>
      <h3 className={styles.title}>{test.title}</h3>
      <p className={styles.questions}>{test.questionCount} preguntas</p>
    </div>
  );
}