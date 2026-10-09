import { create } from 'zustand';
import type { Test, TestMetadata } from '../types';
import { formatValidationError, validateTest } from '../services/testValidator';

const testModules = import.meta.glob('/test/*.json', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

interface RegistryEntry {
  metadata: TestMetadata;
  test: Test;
}

interface TestRegistry {
  entries: RegistryEntry[];
  warning: string | null;
}

async function buildRegistry(): Promise<TestRegistry> {
  const paths = Object.keys(testModules).sort();
  const rawFiles = await Promise.all(
    paths.map(async (path) => {
      try {
        return { path, raw: await testModules[path]() };
      } catch {
        return { path, raw: null };
      }
    }),
  );

  const entries: RegistryEntry[] = [];
  const ids = new Set<string>();
  const errors: string[] = [];

  for (const { path, raw } of rawFiles) {
    const file = path.split('/').pop() ?? path;
    if (raw === null) {
      errors.push(`${file}: no se pudo cargar`);
      continue;
    }
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      errors.push(`${file}: JSON inválido`);
      continue;
    }
    const result = validateTest(data);
    if (!result.success) {
      errors.push(`${file}: ${formatValidationError(result.error)}`);
      continue;
    }
    if (ids.has(result.data.id)) {
      errors.push(`${file}: id duplicado "${result.data.id}"`);
      continue;
    }
    ids.add(result.data.id);
    entries.push({
      metadata: {
        id: result.data.id,
        file,
        title: result.data.title,
        category: result.data.category,
        difficulty: result.data.difficulty,
        questionCount: result.data.questions.length,
        tags: result.data.tags,
      },
      test: result.data,
    });
  }

  return {
    entries,
    warning:
      errors.length > 0
        ? `${errors.length} archivo(s) de test omitidos:\n${errors.join('\n')}`
        : null,
  };
}

let registry: TestRegistry = { entries: [], warning: null };
let registryPromise: Promise<TestRegistry> | null = null;

function getRegistry(): Promise<TestRegistry> {
  if (!registryPromise) {
    registryPromise = buildRegistry()
      .then((loaded) => {
        registry = loaded;
        return loaded;
      })
      .catch((error: unknown) => {
        registryPromise = null;
        throw error;
      });
  }
  return registryPromise;
}

interface TestsStore {
  tests: TestMetadata[];
  loadedTests: Record<string, Test>;
  selectedId: string | null;
  warning: string | null;
  loadError: string | null;
  loading: boolean;
  setSelectedTestId: (id: string | null) => void;
  loadTests: () => Promise<void>;
  loadTest: (id: string) => Test | null;
}

export const useTestsStore = create<TestsStore>((set, get) => ({
  tests: [],
  loadedTests: {},
  selectedId: null,
  warning: null,
  loadError: null,
  loading: true,

  setSelectedTestId: (id: string | null) =>
    set({ selectedId: id, loadError: null }),

  loadTests: async () => {
    set({ loading: true, loadError: null });
    try {
      const loaded = await getRegistry();
      set({
        tests: loaded.entries.map((entry) => entry.metadata),
        warning: loaded.warning,
        loading: false,
      });
    } catch (error) {
      set({
        loadError:
          error instanceof Error
            ? `No se pudieron cargar los tests: ${error.message}`
            : 'No se pudieron cargar los tests',
        loading: false,
      });
    }
  },

  loadTest: (id: string) => {
    const { loadedTests } = get();
    set({ loadError: null });
    const entry = registry.entries.find(
      (candidate) => candidate.metadata.id === id,
    );
    if (!entry) {
      set({ loadError: 'El test seleccionado no existe' });
      return null;
    }
    if (loadedTests[id]) return loadedTests[id];
    set((state) => ({
      loadedTests: { ...state.loadedTests, [id]: entry.test },
    }));
    return entry.test;
  },
}));
