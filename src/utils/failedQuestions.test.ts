import { describe, expect, it } from 'vitest';
import type { Test } from '../types';
import {
  buildFailureReviewTest,
  collectFailedQuestions,
} from './failedQuestions';

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

describe('buildFailureReviewTest', () => {
  it('keeps only the failed questions, in order', () => {
    const review = buildFailureReviewTest(buildTest(), {
      q1: 'b',
      q2: 'a',
      q4: 'a',
    });
    expect(review.questions.map((question) => question.id)).toEqual([
      'q1',
      'q2',
    ]);
  });

  it('returns a test with no questions when there are no failures', () => {
    const review = buildFailureReviewTest(buildTest(), {
      q1: 'a',
      q2: 'b',
      q4: 'a',
    });
    expect(review.questions).toEqual([]);
  });

  it('appends the review suffix to the title', () => {
    const review = buildFailureReviewTest(buildTest(), { q1: 'b' });
    expect(review.title).toBe('Test (repaso de fallos)');
  });

  it('does not duplicate the suffix when reviewing a review', () => {
    const review = buildFailureReviewTest(buildTest(), { q1: 'b' });
    const secondReview = buildFailureReviewTest(review, { q1: 'b' });
    expect(secondReview.title).toBe('Test (repaso de fallos)');
  });

  it('preserves the id and metadata', () => {
    const review = buildFailureReviewTest(buildTest(), { q1: 'b' });
    expect(review.id).toBe('t1');
    expect(review.difficulty).toBe('mixed');
    expect(review.passThreshold).toBe(0.6);
  });

  it('disables shuffling and removes the time limit', () => {
    const test: Test = {
      ...buildTest(),
      shuffleQuestions: true,
      shuffleAnswers: true,
      timeLimit: 10,
    };
    const review = buildFailureReviewTest(test, { q1: 'b' });
    expect(review.shuffleQuestions).toBe(false);
    expect(review.shuffleAnswers).toBe(false);
    expect(review.timeLimit).toBeUndefined();
  });
});
