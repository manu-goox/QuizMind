export interface Answer {
  id: string;
  text: string;
  correct?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  answers: Answer[];
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  passThreshold: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: Question[];
}

export interface TestMetadata {
  id: string;
  file: string;
  title: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export interface TestsIndex {
  tests: TestMetadata[];
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  skipped: Set<string>;
  startTime: number | null;
  activeTest: Test | null;
  status: 'idle' | 'starting' | 'in-progress' | 'reviewing' | 'finished';
}

export interface QuizResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
}

export type SoundType = 'click' | 'correct' | 'wrong' | 'skip' | 'win' | 'complete' | 'start';

export interface Theme {
  id: string;
  name: string;
  file: string;
}