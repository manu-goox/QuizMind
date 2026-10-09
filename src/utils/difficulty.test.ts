import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../types';
import {
  difficultyLabels,
  difficultyOrder,
  difficultyVariants,
  getDifficultyLabel,
} from './difficulty';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'mixed'];

describe('difficulty helpers', () => {
  it('has a label for every difficulty', () => {
    expect(difficultyLabels).toEqual({
      easy: 'Fácil',
      medium: 'Media',
      hard: 'Difícil',
      mixed: 'Mixta',
    });
  });

  it('has a badge variant for every difficulty', () => {
    expect(difficultyVariants).toEqual({
      easy: 'success',
      medium: 'warning',
      hard: 'error',
      mixed: 'info',
    });
  });

  it('lists every difficulty exactly once in order', () => {
    expect(difficultyOrder).toEqual(difficulties);
    expect(new Set(difficultyOrder).size).toBe(difficultyOrder.length);
    expect([...difficultyOrder].sort()).toEqual([...difficulties].sort());
  });

  it('returns the label for a known difficulty', () => {
    for (const difficulty of difficulties) {
      expect(getDifficultyLabel(difficulty)).toBe(difficultyLabels[difficulty]);
    }
  });

  it('falls back to the raw value for unknown difficulties', () => {
    expect(getDifficultyLabel('unknown' as Difficulty)).toBe('unknown');
  });
});
