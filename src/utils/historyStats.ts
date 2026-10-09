import type { HistoryEntry } from '../stores/useHistoryStore';

export function getTestHistory(
  entries: HistoryEntry[],
  testId: string,
): HistoryEntry[] {
  return entries.filter((entry) => entry.testId === testId);
}

export function getBestPercentage(entries: HistoryEntry[]): number | null {
  if (entries.length === 0) return null;
  return Math.max(...entries.map((entry) => entry.percentage));
}

export function getAveragePercentage(entries: HistoryEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, entry) => acc + entry.percentage, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}
