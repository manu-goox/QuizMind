import { describe, expect, it } from 'vitest';
import type { HistoryEntry } from '../stores/useHistoryStore';
import {
  getAveragePercentage,
  getBestPercentage,
  getTestHistory,
} from './historyStats';

const buildEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'e1',
  testId: 't1',
  testTitle: 'Test',
  date: 1,
  correct: 1,
  total: 2,
  percentage: 50,
  passed: false,
  timeSpent: 1000,
  mode: 'normal',
  ...overrides,
});

describe('historyStats', () => {
  it('filters entries by test id', () => {
    const entries = [
      buildEntry({ id: 'a', testId: 't1' }),
      buildEntry({ id: 'b', testId: 't2' }),
      buildEntry({ id: 'c', testId: 't1' }),
    ];
    const filtered = getTestHistory(entries, 't1');
    expect(filtered).toHaveLength(2);
    expect(filtered.map((entry) => entry.id)).toEqual(['a', 'c']);
  });

  it('returns null for best and average with no entries', () => {
    expect(getBestPercentage([])).toBeNull();
    expect(getAveragePercentage([])).toBeNull();
  });

  it('computes the best percentage', () => {
    const entries = [
      buildEntry({ percentage: 50 }),
      buildEntry({ percentage: 80 }),
      buildEntry({ percentage: 65 }),
    ];
    expect(getBestPercentage(entries)).toBe(80);
  });

  it('computes the average with one decimal', () => {
    const entries = [
      buildEntry({ percentage: 50 }),
      buildEntry({ percentage: 75 }),
      buildEntry({ percentage: 80 }),
    ];
    expect(getAveragePercentage(entries)).toBe(68.3);
  });
});
