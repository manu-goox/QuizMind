import type { TestMetadata } from '../../types';
import { TestCard } from './TestCard';
import styles from './TestGrid.module.css';

interface TestGridProps {
  tests: TestMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TestGrid({ tests, selectedId, onSelect }: TestGridProps) {
  return (
    <div className={styles.grid}>
      {tests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          selected={test.id === selectedId}
          onClick={() => onSelect(test.id)}
        />
      ))}
    </div>
  );
}