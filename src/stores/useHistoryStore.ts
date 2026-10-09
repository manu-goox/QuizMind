import { create } from 'zustand';

export interface HistoryEntry {
  id: string;
  testId: string;
  testTitle: string;
  date: number;
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  mode: 'normal' | 'practice';
}

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'date'>) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'quizmind-history';
const MAX_ENTRIES = 200;

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        !!entry &&
        typeof entry === 'object' &&
        typeof entry.id === 'string' &&
        typeof entry.testId === 'string' &&
        typeof entry.testTitle === 'string' &&
        Number.isFinite(entry.date) &&
        Number.isFinite(entry.correct) &&
        Number.isFinite(entry.total) &&
        Number.isFinite(entry.percentage) &&
        typeof entry.passed === 'boolean' &&
        Number.isFinite(entry.timeSpent) &&
        (entry.mode === 'normal' || entry.mode === 'practice'),
    );
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    console.warn('Failed to save history to localStorage');
  }
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: readHistory(),

  addEntry: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
    };
    const entries = [newEntry, ...get().entries].slice(0, MAX_ENTRIES);
    set({ entries });
    writeHistory(entries);
  },

  removeEntry: (id) => {
    const entries = get().entries.filter((entry) => entry.id !== id);
    set({ entries });
    writeHistory(entries);
  },

  clearAll: () => {
    set({ entries: [] });
    writeHistory([]);
  },
}));
