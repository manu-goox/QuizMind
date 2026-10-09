import { describe, expect, it } from 'vitest';
import { calculateResults } from './scoring';

const test = {
  questions: [
    { id: 'q1', answers: [{ id: 'a', correct: true }, { id: 'b' }] },
    { id: 'q2', answers: [{ id: 'a', correct: true }, { id: 'b' }] },
    { id: 'q3', answers: [{ id: 'a', correct: true }, { id: 'b' }] },
    { id: 'q4', answers: [{ id: 'a', correct: true }, { id: 'b' }] },
  ],
};

const buildQuestions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `q${i}`,
    answers: [{ id: 'a', correct: true }, { id: 'b' }],
  }));

describe('calculateResults', () => {
  it('counts correct, wrong and blank answers', () => {
    const results = calculateResults(test, { q1: 'a', q2: 'b' }, 1000);
    expect(results.total).toBe(4);
    expect(results.answered).toBe(2);
    expect(results.correct).toBe(1);
    expect(results.wrong).toBe(1);
    expect(results.blank).toBe(2);
    expect(results.annulled).toBe(0);
    expect(results.percentage).toBe(25);
    expect(results.timeSpent).toBe(1000);
  });

  it('uses the 60% default threshold', () => {
    const good = calculateResults(test, { q1: 'a', q2: 'a', q3: 'a' }, 0);
    expect(good.percentage).toBe(75);
    expect(good.passed).toBe(true);

    const half = calculateResults(test, { q1: 'a', q2: 'a' }, 0);
    expect(half.percentage).toBe(50);
    expect(half.passed).toBe(false);
  });

  it('respects a custom passThreshold', () => {
    const strict = calculateResults(
      { ...test, passThreshold: 0.8 },
      { q1: 'a', q2: 'a', q3: 'a' },
      0,
    );
    expect(strict.percentage).toBe(75);
    expect(strict.passed).toBe(false);

    const lenient = calculateResults(
      { ...test, passThreshold: 0.5 },
      { q1: 'a', q2: 'a' },
      0,
    );
    expect(lenient.passed).toBe(true);
  });

  it('passes exactly at the 60% threshold', () => {
    const results = calculateResults(
      { questions: buildQuestions(5), passThreshold: 0.6 },
      { q0: 'a', q1: 'a', q2: 'a', q3: 'b', q4: 'b' },
      0,
    );
    expect(results.percentage).toBe(60);
    expect(results.passed).toBe(true);
  });

  it('passes exactly at a 70% threshold', () => {
    const questions = buildQuestions(10);
    const answers = Object.fromEntries(
      questions.map((question, index) => [question.id, index < 7 ? 'a' : 'b']),
    );
    const results = calculateResults(
      { questions, passThreshold: 0.7 },
      answers,
      0,
    );
    expect(results.percentage).toBe(70);
    expect(results.passed).toBe(true);
  });

  it('rounds percentages to one decimal', () => {
    const three = buildQuestions(3);
    expect(
      calculateResults({ questions: three }, { q0: 'a' }, 0).percentage,
    ).toBe(33.3);
    expect(
      calculateResults({ questions: three }, { q0: 'a', q1: 'a' }, 0)
        .percentage,
    ).toBe(66.7);
  });

  it('counts an answer with an unknown id as wrong', () => {
    const results = calculateResults(test, { q1: 'zzz' }, 0);
    expect(results.answered).toBe(1);
    expect(results.correct).toBe(0);
    expect(results.wrong).toBe(1);
  });

  it('excludes annulled questions from the total', () => {
    const annulledTest = {
      questions: [
        ...test.questions,
        { id: 'q5', answers: [{ id: 'a' }, { id: 'b' }] },
      ],
    };
    const results = calculateResults(
      annulledTest,
      { q1: 'a', q2: 'a', q3: 'a' },
      500,
    );
    expect(results.annulled).toBe(1);
    expect(results.total).toBe(4);
    expect(results.answered).toBe(3);
    expect(results.blank).toBe(1);
    expect(results.percentage).toBe(75);
    expect(results.passed).toBe(true);
  });

  it('fails a test where every question is annulled', () => {
    const results = calculateResults(
      { questions: [{ id: 'q1', answers: [{ id: 'a' }, { id: 'b' }] }] },
      { q1: 'a' },
      0,
    );
    expect(results.total).toBe(0);
    expect(results.annulled).toBe(1);
    expect(results.answered).toBe(0);
    expect(results.percentage).toBe(0);
    expect(results.passed).toBe(false);
  });

  it('handles a test without questions', () => {
    const results = calculateResults({ questions: [] }, {}, 0);
    expect(results.total).toBe(0);
    expect(results.annulled).toBe(0);
    expect(results.percentage).toBe(0);
    expect(results.passed).toBe(false);
  });

  it('keeps the provided timeSpent', () => {
    expect(calculateResults(test, {}, 0).timeSpent).toBe(0);
    expect(calculateResults(test, {}, 12345).timeSpent).toBe(12345);
  });
});
