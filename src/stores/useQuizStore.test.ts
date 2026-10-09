import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Test } from '../types';
import { useQuizStore } from './useQuizStore';

const PERSIST_KEY = 'quizmind-active-quiz';

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
vi.stubGlobal('sessionStorage', storage);

const buildTest = (overrides: Partial<Test> = {}): Test => ({
  id: 't1',
  title: 'Test de prueba',
  difficulty: 'mixed',
  passThreshold: 0.6,
  shuffleQuestions: false,
  shuffleAnswers: false,
  questions: [
    {
      id: 'q1',
      text: 'Q1',
      type: 'single',
      answers: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B' },
      ],
    },
    {
      id: 'q2',
      text: 'Q2',
      type: 'single',
      answers: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B', correct: true },
      ],
    },
    {
      id: 'q3',
      text: 'Q3',
      type: 'single',
      answers: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B' },
      ],
    },
  ],
  ...overrides,
});

beforeEach(() => {
  storage.clear();
  useQuizStore.getState().resetQuiz();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useQuizStore', () => {
  it('starts a test with a clean state', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());
    store.setAnswer('q1', 'a');
    store.skipQuestion('q2');

    useQuizStore.getState().startTest(buildTest());
    const state = useQuizStore.getState();
    expect(state.status).toBe('in-progress');
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.skipped.size).toBe(0);
    expect(state.result).toBeNull();
    expect(typeof state.startTime).toBe('number');
    expect(state.activeTest?.id).toBe('t1');
  });

  it('keeps the original order when shuffling is disabled', () => {
    useQuizStore.getState().startTest(buildTest());
    const questions = useQuizStore.getState().activeTest?.questions ?? [];
    expect(questions.map((question) => question.id)).toEqual([
      'q1',
      'q2',
      'q3',
    ]);
  });

  it('shuffles questions and answers when enabled', () => {
    useQuizStore
      .getState()
      .startTest(buildTest({ shuffleQuestions: true, shuffleAnswers: true }));
    const questions = useQuizStore.getState().activeTest?.questions ?? [];
    expect([...questions.map((question) => question.id)].sort()).toEqual([
      'q1',
      'q2',
      'q3',
    ]);
    for (const question of questions) {
      expect([...question.answers.map((answer) => answer.id)].sort()).toEqual([
        'a',
        'b',
      ]);
    }
  });

  it('setAnswer removes the question from the skipped list', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());
    store.skipQuestion('q1');
    expect(useQuizStore.getState().skipped.has('q1')).toBe(true);

    useQuizStore.getState().setAnswer('q1', 'a');
    const state = useQuizStore.getState();
    expect(state.answers.q1).toBe('a');
    expect(state.skipped.has('q1')).toBe(false);
  });

  it('skipQuestion on an answered question only advances', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());
    store.setAnswer('q1', 'a');

    useQuizStore.getState().skipQuestion('q1');
    const state = useQuizStore.getState();
    expect(state.skipped.size).toBe(0);
    expect(state.currentQuestionIndex).toBe(1);
  });

  it('clamps navigation to the test bounds', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());

    useQuizStore.getState().goToPrevious();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(0);

    useQuizStore.getState().goToQuestion(99);
    expect(useQuizStore.getState().currentQuestionIndex).toBe(2);

    useQuizStore.getState().goToNext();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(2);

    useQuizStore.getState().goToQuestion(-5);
    expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
  });

  it('toggles between reviewing and in-progress', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());

    useQuizStore.getState().startReviewing();
    expect(useQuizStore.getState().status).toBe('reviewing');

    useQuizStore.getState().resumeQuiz();
    expect(useQuizStore.getState().status).toBe('in-progress');

    useQuizStore.getState().resumeQuiz();
    expect(useQuizStore.getState().status).toBe('in-progress');
  });

  it('throws when finishing without an active test', () => {
    expect(() => useQuizStore.getState().finishTest()).toThrow(
      'No active test',
    );
  });

  it('computes and freezes the result at finish time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);

    const store = useQuizStore.getState();
    store.startTest(buildTest());
    store.setAnswer('q1', 'a');
    store.setAnswer('q2', 'a');

    vi.setSystemTime(1_001_000);
    const results = useQuizStore.getState().finishTest();
    expect(results.total).toBe(3);
    expect(results.correct).toBe(1);
    expect(results.wrong).toBe(1);
    expect(results.blank).toBe(1);
    expect(results.percentage).toBe(33.3);
    expect(results.passed).toBe(false);
    expect(results.timeSpent).toBe(1000);

    vi.setSystemTime(1_002_000);
    expect(useQuizStore.getState().getResults()).toBe(results);
    expect(useQuizStore.getState().getResults()?.timeSpent).toBe(1000);
  });

  it('persists the active quiz and clears it when finished or reset', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());
    const saved = storage.getItem(PERSIST_KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved as string);
    expect(parsed.activeTest.id).toBe('t1');
    expect(parsed.status).toBe('in-progress');

    useQuizStore.getState().setAnswer('q1', 'a');
    const updated = JSON.parse(storage.getItem(PERSIST_KEY) as string);
    expect(updated.answers).toEqual({ q1: 'a' });

    useQuizStore.getState().finishTest();
    expect(storage.getItem(PERSIST_KEY)).toBeNull();

    useQuizStore.getState().startTest(buildTest());
    useQuizStore.getState().resetQuiz();
    expect(storage.getItem(PERSIST_KEY)).toBeNull();
  });

  it('restores a persisted quiz on load', async () => {
    storage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        activeTest: buildTest(),
        currentQuestionIndex: 1,
        answers: { q1: 'a' },
        skipped: ['q2'],
        startTime: 123,
        status: 'in-progress',
      }),
    );
    vi.resetModules();
    const { useQuizStore: restored } = await import('./useQuizStore');
    const state = restored.getState();
    expect(state.activeTest?.id).toBe('t1');
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.answers).toEqual({ q1: 'a' });
    expect(state.skipped.has('q2')).toBe(true);
    expect(state.startTime).toBe(123);
    expect(state.status).toBe('in-progress');
    expect(state.result).toBeNull();
  });

  it('resets practiceMode when starting a new test', () => {
    const store = useQuizStore.getState();
    store.startTest(buildTest());
    useQuizStore.getState().setPracticeMode(true);
    expect(useQuizStore.getState().practiceMode).toBe(true);

    useQuizStore.getState().startTest(buildTest());
    expect(useQuizStore.getState().practiceMode).toBe(false);
  });

  it('defaults practiceMode to false and allows toggling it', () => {
    expect(useQuizStore.getState().practiceMode).toBe(false);
    useQuizStore.getState().setPracticeMode(true);
    expect(useQuizStore.getState().practiceMode).toBe(true);
    useQuizStore.getState().setPracticeMode(false);
    expect(useQuizStore.getState().practiceMode).toBe(false);
  });

  it('persists practiceMode in sessionStorage', () => {
    useQuizStore.getState().startTest(buildTest());
    useQuizStore.getState().setPracticeMode(true);
    const saved = JSON.parse(storage.getItem(PERSIST_KEY) as string);
    expect(saved.practiceMode).toBe(true);
  });

  it('restores practiceMode on load', async () => {
    storage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        activeTest: buildTest(),
        currentQuestionIndex: 0,
        answers: {},
        skipped: [],
        startTime: 1,
        status: 'in-progress',
        practiceMode: true,
      }),
    );
    vi.resetModules();
    const { useQuizStore: restored } = await import('./useQuizStore');
    expect(restored.getState().practiceMode).toBe(true);
  });
});
