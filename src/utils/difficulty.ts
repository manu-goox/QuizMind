import type { Difficulty } from '../types';

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
  mixed: 'Mixta',
};

export const difficultyVariants: Record<
  Difficulty,
  'success' | 'warning' | 'error' | 'info'
> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
  mixed: 'info',
};

export const difficultyOrder: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'mixed',
];

export function getDifficultyLabel(difficulty: Difficulty): string {
  return difficultyLabels[difficulty] ?? difficulty;
}
