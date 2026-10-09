import { describe, expect, it } from 'vitest';
import type { TestMetadata } from '../types';
import {
  collectTags,
  filterTestsByTags,
  groupTestsByCategory,
  NO_CATEGORY_LABEL,
} from './testGroups';

const buildMetadata = (
  overrides: Partial<TestMetadata> & { id: string },
): TestMetadata => ({
  file: `${overrides.id}.json`,
  title: overrides.id,
  difficulty: 'mixed',
  questionCount: 1,
  ...overrides,
});

describe('groupTestsByCategory', () => {
  it('groups tests by category with alphabetical order', () => {
    const tests = [
      buildMetadata({ id: 'b', title: 'Zeta', category: 'Redes' }),
      buildMetadata({ id: 'a', title: 'Alfa', category: 'Bases' }),
      buildMetadata({ id: 'c', title: 'Beta', category: 'Bases' }),
    ];
    const groups = groupTestsByCategory(tests);
    expect(groups.map((group) => group.category)).toEqual(['Bases', 'Redes']);
    expect(groups[0].tests.map((test) => test.title)).toEqual(['Alfa', 'Beta']);
    expect(groups[1].tests.map((test) => test.title)).toEqual(['Zeta']);
  });

  it('places tests without category in a trailing group', () => {
    const tests = [
      buildMetadata({ id: 'a', title: 'Sin', category: undefined }),
      buildMetadata({ id: 'b', title: 'Con', category: 'Redes' }),
      buildMetadata({ id: 'c', title: 'Blanco', category: '   ' }),
    ];
    const groups = groupTestsByCategory(tests);
    expect(groups.map((group) => group.category)).toEqual([
      'Redes',
      NO_CATEGORY_LABEL,
    ]);
    expect(groups[1].tests.map((test) => test.title)).toEqual([
      'Blanco',
      'Sin',
    ]);
  });

  it('returns an empty array for no tests', () => {
    expect(groupTestsByCategory([])).toEqual([]);
  });
});

describe('collectTags', () => {
  it('collects unique tags sorted alphabetically', () => {
    const tests = [
      buildMetadata({ id: 'a', tags: ['shell', 'linux'] }),
      buildMetadata({ id: 'b', tags: ['linux', 'procesos'] }),
      buildMetadata({ id: 'c' }),
    ];
    expect(collectTags(tests)).toEqual(['linux', 'procesos', 'shell']);
  });

  it('returns an empty array when there are no tags', () => {
    expect(collectTags([buildMetadata({ id: 'a' })])).toEqual([]);
  });
});

describe('filterTestsByTags', () => {
  const tests = [
    buildMetadata({ id: 'a', tags: ['linux', 'shell'] }),
    buildMetadata({ id: 'b', tags: ['linux'] }),
    buildMetadata({ id: 'c' }),
  ];

  it('returns all tests when no tags are selected', () => {
    expect(filterTestsByTags(tests, [])).toEqual(tests);
  });

  it('filters by a single tag', () => {
    expect(filterTestsByTags(tests, ['linux']).map((test) => test.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('requires every selected tag (AND)', () => {
    expect(
      filterTestsByTags(tests, ['linux', 'shell']).map((test) => test.id),
    ).toEqual(['a']);
  });

  it('returns an empty array for an unknown tag', () => {
    expect(filterTestsByTags(tests, ['no-existe'])).toEqual([]);
  });
});
