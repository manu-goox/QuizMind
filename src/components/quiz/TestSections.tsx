import { useState } from 'react';
import type { TestMetadata } from '../../types';
import { TestGrid } from './TestGrid';
import styles from './TestSections.module.css';

interface TestSectionsProps {
  groups: { category: string; tests: TestMetadata[] }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  statsByTest?: Record<string, { best: number; attempts: number }>;
}

const DOT_CLASSES = ['dot0', 'dot1', 'dot2'] as const;

export function TestSections({
  groups,
  selectedId,
  onSelect,
  statsByTest,
}: TestSectionsProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (category: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className={styles.sections}>
      {groups.map((group, index) => {
        const sectionId = `test-section-${index}`;
        const isCollapsed = collapsed.has(group.category);
        const dotClass = styles[DOT_CLASSES[index % DOT_CLASSES.length]];
        return (
          <section key={group.category} className={styles.section}>
            <button
              type="button"
              className={styles.header}
              onClick={() => toggle(group.category)}
              aria-expanded={!isCollapsed}
              aria-controls={sectionId}
            >
              <span
                className={`${styles.dot} ${dotClass}`}
                aria-hidden="true"
              />
              <span className={styles.category}>{group.category}</span>
              <span className={styles.count}>{group.tests.length}</span>
              <span className={styles.chevron} aria-hidden="true">
                ▾
              </span>
            </button>
            <div id={sectionId} hidden={isCollapsed}>
              <TestGrid
                tests={group.tests}
                selectedId={selectedId}
                onSelect={onSelect}
                statsByTest={statsByTest}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
