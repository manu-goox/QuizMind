import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHistoryStore } from './useHistoryStore';

const STORAGE_KEY = 'quizmind-history';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  };
}

const storage = createMemoryStorage();
vi.stubGlobal('localStorage', storage);

const buildEntry = (overrides: Record<string, unknown> = {}) => ({
  testId: 't1',
  testTitle: 'Test',
  correct: 3,
  total: 4,
  percentage: 75,
  passed: true,
  timeSpent: 60000,
  mode: 'normal' as const,
  ...overrides,
});

beforeEach(() => {
  storage.clear();
  useHistoryStore.getState().clearAll();
});

describe('useHistoryStore', () => {
  it('adds entries with a unique id and date, newest first', () => {
    useHistoryStore.getState().addEntry(buildEntry({ percentage: 50 }));
    useHistoryStore.getState().addEntry(buildEntry({ percentage: 80 }));
    const entries = useHistoryStore.getState().entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].percentage).toBe(80);
    expect(entries[0].id).not.toBe(entries[1].id);
    expect(typeof entries[0].date).toBe('number');
  });

  it('persists entries to localStorage', () => {
    useHistoryStore.getState().addEntry(buildEntry());
    const saved = storage.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].testId).toBe('t1');
  });

  it('caps the history at 200 entries (FIFO)', () => {
    for (let index = 0; index < 205; index += 1) {
      useHistoryStore
        .getState()
        .addEntry(buildEntry({ testTitle: `t${index}` }));
    }
    const entries = useHistoryStore.getState().entries;
    expect(entries).toHaveLength(200);
    expect(entries[0].testTitle).toBe('t204');
    expect(entries[199].testTitle).toBe('t5');
  });

  it('removes a single entry', () => {
    useHistoryStore.getState().addEntry(buildEntry());
    useHistoryStore.getState().addEntry(buildEntry({ percentage: 40 }));
    const [newest] = useHistoryStore.getState().entries;
    useHistoryStore.getState().removeEntry(newest.id);
    const entries = useHistoryStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].percentage).toBe(75);
  });

  it('clears all entries', () => {
    useHistoryStore.getState().addEntry(buildEntry());
    useHistoryStore.getState().clearAll();
    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(storage.getItem(STORAGE_KEY)).toBe('[]');
  });

  it('ignores invalid stored entries on load', async () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...buildEntry(), id: 'a', date: 123 },
        { id: 'b' },
        { id: 'c', testId: 't2', date: 456, percentage: 60 },
        { ...buildEntry(), id: 'd', date: 789, mode: 'weird' },
      ]),
    );
    vi.resetModules();
    const { useHistoryStore: restored } = await import('./useHistoryStore');
    const entries = restored.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('a');
  });

  it('returns an empty list when the stored JSON is corrupt', async () => {
    storage.setItem(STORAGE_KEY, '{oops');
    vi.resetModules();
    const { useHistoryStore: restored } = await import('./useHistoryStore');
    expect(restored.getState().entries).toEqual([]);
  });
});
