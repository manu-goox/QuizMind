import { describe, expect, it } from 'vitest';
import type { Test } from '../types';
import { collectFailedQuestions } from './failedQuestions';

const buildTest = (): Test => ({
  id: 't1',
  title: 'Test',
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
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
    },
    {
      id: 'q4',
      text: 'Q4',
      type: 'single',
      answers: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B' },
      ],
    },
  ],
});

describe('collectFailedQuestions', () => {
  it('excludes correctly answered questions', () => {
    const failed = collectFailedQuestions(buildTest(), { q1: 'a' });
    expect(failed.map((question) => question.id)).not.toContain('q1');
  });

  it('includes wrong answers', () => {
    const failed = collectFailedQuestions(buildTest(), { q1: 'b' });
    expect(failed.map((question) => question.id)).toContain('q1');
  });

  it('excludes blank questions', () => {
    const failed = collectFailedQuestions(buildTest(), {});
    expect(failed).toEqual([]);
  });

  it('excludes annulled questions', () => {
    const failed = collectFailedQuestions(buildTest(), {});
    expect(failed.map((question) => question.id)).not.toContain('q3');
  });

  it('returns an empty list when everything is correct', () => {
    const failed = collectFailedQuestions(buildTest(), {
      q1: 'a',
      q2: 'b',
      q4: 'a',
    });
    expect(failed).toEqual([]);
  });

  it('preserves the original question order', () => {
    const failed = collectFailedQuestions(buildTest(), { q1: 'b', q2: 'a' });
    expect(failed.map((question) => question.id)).toEqual(['q1', 'q2']);
  });

  it('treats an unknown answer id as failed', () => {
    const failed = collectFailedQuestions(buildTest(), { q1: 'zzz' });
    expect(failed.map((question) => question.id)).toContain('q1');
  });
});
