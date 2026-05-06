import { create } from 'zustand';
import type { Test, TestMetadata } from '../types';

interface TestsStore {
  tests: TestMetadata[];
  loadedTests: Record<string, Test>;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  setSelectedTestId: (id: string | null) => void;
  loadTestsIndex: () => Promise<void>;
  loadTest: (id: string) => Promise<Test | null>;
  getTestById: (id: string) => Test | null;
}

export const useTestsStore = create<TestsStore>((set, get) => ({
  tests: [],
  loadedTests: {},
  selectedId: null,
  loading: false,
  error: null,

  setSelectedTestId: (id: string | null) => set({ selectedId: id }),

  loadTestsIndex: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/tests/index.json');
      if (!response.ok) throw new Error('Failed to load tests index');
      const data = await response.json();
      set({ tests: data.tests || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  loadTest: async (id: string) => {
    const { tests, loadedTests } = get();
    const metadata = tests.find((t) => t.id === id);
    if (!metadata) return null;
    if (loadedTests[id]) return loadedTests[id];
    try {
      const response = await fetch(`/tests/${metadata.file}`);
      if (!response.ok) throw new Error(`Failed to load test: ${id}`);
      const test = await response.json();
      set((state) => ({ loadedTests: { ...state.loadedTests, [id]: test } }));
      return test;
    } catch (err) {
      console.error(`Failed to load test ${id}:`, err);
      return null;
    }
  },

  getTestById: (id: string) => {
    return get().loadedTests[id] || null;
  },
}));