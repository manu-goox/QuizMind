import type { TestMetadata } from '../../types';
import { TestCard } from './TestCard';
import styles from './TestGrid.module.css';

interface TestGridProps {
  tests: TestMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  statsByTest?: Record<string, { best: number; attempts: number }>;
}

export function TestGrid({
  tests,
  selectedId,
  onSelect,
  statsByTest,
}: TestGridProps) {
  if (tests.length === 0) {
    return (
      <p className={styles.empty}>
        No hay tests que coincidan con los filtros.
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {tests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          selected={test.id === selectedId}
          onClick={() => onSelect(test.id)}
          bestPercentage={statsByTest?.[test.id]?.best}
          attempts={statsByTest?.[test.id]?.attempts}
        />
      ))}
    </div>
  );
}
