import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { useTestsStore } from './useTestsStore';

const testsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'test',
);
const files = readdirSync(testsDir).filter((name) => name.endsWith('.json'));

describe('useTestsStore', () => {
  it('starts empty and loads every test from the test/ folder', async () => {
    expect(useTestsStore.getState().loading).toBe(true);
    expect(useTestsStore.getState().tests).toEqual([]);

    await useTestsStore.getState().loadTests();
    const { tests, warning, loading } = useTestsStore.getState();
    expect(loading).toBe(false);
    expect(tests.length).toBe(files.length);
    expect(warning).toBeNull();
    for (const metadata of tests) {
      expect(metadata.id).toBeTruthy();
      expect(metadata.file.endsWith('.json')).toBe(true);
      expect(metadata.questionCount).toBeGreaterThan(0);
    }
  });

  it('loads a test and caches the same instance', async () => {
    await useTestsStore.getState().loadTests();
    const first = useTestsStore.getState().loadTest('tema5-dificil');
    expect(first).not.toBeNull();
    const second = useTestsStore.getState().loadTest('tema5-dificil');
    expect(second).toBe(first);
    expect(useTestsStore.getState().loadedTests['tema5-dificil']).toBe(first);
  });

  it('reports an error for an unknown test id', () => {
    const result = useTestsStore.getState().loadTest('no-existe');
    expect(result).toBeNull();
    expect(useTestsStore.getState().loadError).toBe(
      'El test seleccionado no existe',
    );
  });

  it('clears the load error when selecting a test', () => {
    useTestsStore.getState().loadTest('no-existe');
    expect(useTestsStore.getState().loadError).not.toBeNull();

    useTestsStore.getState().setSelectedTestId('tema5-dificil');
    expect(useTestsStore.getState().selectedId).toBe('tema5-dificil');
    expect(useTestsStore.getState().loadError).toBeNull();
  });

  it('reloads the catalog from the registry', async () => {
    await useTestsStore.getState().loadTests();
    expect(useTestsStore.getState().tests.length).toBe(files.length);
    expect(useTestsStore.getState().warning).toBeNull();
  });

  it('keeps metadata in sync with the loaded test', async () => {
    await useTestsStore.getState().loadTests();
    for (const metadata of useTestsStore.getState().tests) {
      const test = useTestsStore.getState().loadTest(metadata.id);
      expect(test, metadata.id).not.toBeNull();
      expect(test?.title).toBe(metadata.title);
      expect(test?.difficulty).toBe(metadata.difficulty);
      expect(test?.questions.length).toBe(metadata.questionCount);
    }
  });
});
