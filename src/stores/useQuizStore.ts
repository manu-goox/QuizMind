import { create } from 'zustand';
import type { Test, QuizState, QuizResult } from '../types';
import { calculateResults } from '../utils/scoring';

interface QuizStore extends QuizState {
  startTest: (test: Test) => void;
  setAnswer: (questionId: string, answerId: string) => void;
  skipQuestion: (questionId: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  finishTest: () => QuizResult;
  resetQuiz: () => void;
  getCurrentQuestion: () => Test['questions'][number] | null;
  getResults: () => QuizResult | null;
}

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: {},
  skipped: new Set(),
  startTime: null,
  activeTest: null,
  status: 'idle',
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  startTest: (test: Test) => {
    set({
      activeTest: test,
      currentQuestionIndex: 0,
      answers: {},
      skipped: new Set(),
      startTime: Date.now(),
      status: 'in-progress',
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
    set((state) => ({
      skipped: new Set([...state.skipped, questionId]),
    }));
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

  finishTest: () => {
    const state = get();
    if (!state.activeTest) {
      throw new Error('No active test');
    }
    set({ status: 'finished' });
    const results = calculateResults(
      state.activeTest,
      state.answers,
      state.startTime ? Date.now() - state.startTime : 0
    );
    return results;
  },

  resetQuiz: () => set(initialState),

  getCurrentQuestion: () => {
    const state = get();
    if (!state.activeTest) return null;
    return state.activeTest.questions[state.currentQuestionIndex] || null;
  },

  getResults: () => {
    const state = get();
    if (!state.activeTest || state.status !== 'finished') return null;
    return calculateResults(
      state.activeTest,
      state.answers,
      state.startTime ? Date.now() - state.startTime : 0
    );
  },
}));