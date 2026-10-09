export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

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
  tags?: string[];
  difficulty: Difficulty;
  passThreshold: number;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: Question[];
}

export interface TestMetadata {
  id: string;
  file: string;
  title: string;
  category?: string;
  tags?: string[];
  difficulty: Difficulty;
  questionCount: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  skipped: Set<string>;
  startTime: number | null;
  activeTest: Test | null;
  status: 'idle' | 'in-progress' | 'reviewing' | 'finished';
  practiceMode: boolean;
  result: QuizResult | null;
}

export interface QuizResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  annulled: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
}

export type SoundType =
  'click' | 'skip' | 'win' | 'complete' | 'start' | 'correct' | 'incorrect';

export interface Theme {
  id: string;
  name: string;
  file: string;
}
