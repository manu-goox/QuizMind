import type { TestMetadata } from '../types';

export const NO_CATEGORY_LABEL = 'Sin categoría';

export interface TestGroup {
  category: string;
  tests: TestMetadata[];
}

export function groupTestsByCategory(tests: TestMetadata[]): TestGroup[] {
  const groups = new Map<string, TestMetadata[]>();

  for (const test of tests) {
    const category = test.category?.trim() || NO_CATEGORY_LABEL;
    const group = groups.get(category) ?? [];
    group.push(test);
    groups.set(category, group);
  }

  return Array.from(groups.entries())
    .map(([category, groupTests]) => ({
      category,
      tests: [...groupTests].sort((a, b) =>
        a.title.localeCompare(b.title, 'es'),
      ),
    }))
    .sort((a, b) => {
      if (a.category === NO_CATEGORY_LABEL) return 1;
      if (b.category === NO_CATEGORY_LABEL) return -1;
      return a.category.localeCompare(b.category, 'es');
    });
}

export function collectTags(tests: TestMetadata[]): string[] {
  const tags = new Set<string>();
  for (const test of tests) {
    for (const tag of test.tags ?? []) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, 'es'));
}

export function filterTestsByTags(
  tests: TestMetadata[],
  tags: string[],
): TestMetadata[] {
  if (tags.length === 0) return tests;
  return tests.filter((test) => tags.every((tag) => test.tags?.includes(tag)));
}
