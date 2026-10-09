import { create } from 'zustand';
import type { Test, QuizState, QuizResult } from '../types';
import { calculateResults } from '../utils/scoring';
import { shuffle } from '../utils/shuffle';

interface QuizStore extends QuizState {
  startTest: (test: Test) => void;
  setAnswer: (questionId: string, answerId: string) => void;
  skipQuestion: (questionId: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (index: number) => void;
  startReviewing: () => void;
  resumeQuiz: () => void;
  setPracticeMode: (enabled: boolean) => void;
  finishTest: (pausedMs?: number) => QuizResult;
  resetQuiz: () => void;
  getResults: () => QuizResult | null;
}

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: {},
  skipped: new Set(),
  startTime: null,
  activeTest: null,
  status: 'idle',
  result: null,
  practiceMode: false,
};

export const PERSIST_KEY = 'quizmind-active-quiz';

function loadPersistedQuiz(): Partial<QuizState> | null {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const test = data.activeTest as QuizState['activeTest'];
    if (
      !test ||
      !Array.isArray(test.questions) ||
      test.questions.length === 0
    ) {
      return null;
    }
    const maxIndex = test.questions.length - 1;
    const questionIds = new Set(test.questions.map((q) => q.id));
    const rawAnswers =
      data.answers && typeof data.answers === 'object'
        ? (data.answers as Record<string, string>)
        : {};
    const answers: Record<string, string> = {};
    for (const [questionId, answerId] of Object.entries(rawAnswers)) {
      if (questionIds.has(questionId) && typeof answerId === 'string') {
        answers[questionId] = answerId;
      }
    }
    const skipped = new Set(
      (Array.isArray(data.skipped) ? (data.skipped as string[]) : []).filter(
        (id) => typeof id === 'string' && questionIds.has(id),
      ),
    );
    return {
      activeTest: test,
      currentQuestionIndex: Math.min(
        Math.max(
          typeof data.currentQuestionIndex === 'number'
            ? data.currentQuestionIndex
            : 0,
          0,
        ),
        maxIndex,
      ),
      answers,
      skipped,
      startTime: typeof data.startTime === 'number' ? data.startTime : null,
      status: 'in-progress',
      result: null,
      practiceMode: data.practiceMode === true,
    };
  } catch {
    return null;
  }
}

const persistedQuiz = loadPersistedQuiz();

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,
  ...(persistedQuiz ?? {}),

  startTest: (test: Test) => {
    let questions = [...test.questions];

    if (test.shuffleQuestions) {
      questions = shuffle(questions);
    }

    const shuffledQuestions = questions.map((q) => {
      let answers = [...q.answers];
      if (test.shuffleAnswers) {
        answers = shuffle(answers);
      }
      return { ...q, answers };
    });

    const shuffledTest: Test = {
      ...test,
      questions: shuffledQuestions,
    };

    set({
      activeTest: shuffledTest,
      currentQuestionIndex: 0,
      answers: {},
      skipped: new Set(),
      startTime: Date.now(),
      status: 'in-progress',
      result: null,
      practiceMode: false,
    });
  },

  setAnswer: (questionId: string, answerId: string) => {
    set((state) => {
      const newAnswers = { ...state.answers, [questionId]: answerId };
      const newSkipped = new Set(state.skipped);
      newSkipped.delete(questionId);
      return { answers: newAnswers, skipped: newSkipped };
    });
  },

  skipQuestion: (questionId: string) => {
    set((state) => {
      if (state.answers[questionId]) return state;
      return { skipped: new Set([...state.skipped, questionId]) };
    });
    get().goToNext();
  },

  goToNext: () => {
    set((state) => {
      if (!state.activeTest) return state;
      const maxIndex = state.activeTest.questions.length - 1;
      if (state.currentQuestionIndex >= maxIndex) return state;
      return { currentQuestionIndex: state.currentQuestionIndex + 1 };
    });
  },

  goToPrevious: () => {
    set((state) => {
      if (state.currentQuestionIndex <= 0) return state;
      return { currentQuestionIndex: state.currentQuestionIndex - 1 };
    });
  },

  goToQuestion: (index: number) => {
    set((state) => {
      if (!state.activeTest) return state;
      const maxIndex = state.activeTest.questions.length - 1;
      const clamped = Math.min(Math.max(index, 0), maxIndex);
      return { currentQuestionIndex: clamped };
    });
  },

  startReviewing: () => set({ status: 'reviewing' }),

  resumeQuiz: () => {
    if (get().status === 'reviewing') set({ status: 'in-progress' });
  },

  setPracticeMode: (enabled: boolean) => set({ practiceMode: enabled }),

  finishTest: (pausedMs = 0) => {
    const state = get();
    if (!state.activeTest) {
      throw new Error('No active test');
    }
    let elapsed = state.startTime
      ? Date.now() - state.startTime - Math.max(0, pausedMs)
      : 0;
    if (elapsed < 0) elapsed = 0;
    if (state.activeTest.timeLimit) {
      elapsed = Math.min(elapsed, state.activeTest.timeLimit * 60 * 1000);
    }
    const results = calculateResults(state.activeTest, state.answers, elapsed);
    set({ status: 'finished', result: results });
    return results;
  },

  resetQuiz: () => set(initialState),

  getResults: () => {
    return get().result;
  },
}));

useQuizStore.subscribe((state) => {
  try {
    if (
      state.activeTest &&
      (state.status === 'in-progress' || state.status === 'reviewing')
    ) {
      sessionStorage.setItem(
        PERSIST_KEY,
        JSON.stringify({
          activeTest: state.activeTest,
          currentQuestionIndex: state.currentQuestionIndex,
          answers: state.answers,
          skipped: Array.from(state.skipped),
          startTime: state.startTime,
          status: state.status,
          practiceMode: state.practiceMode,
        }),
      );
    } else {
      sessionStorage.removeItem(PERSIST_KEY);
    }
  } catch {
    // sessionStorage no disponible (modo privado / cuota): se ignora
  }
});
