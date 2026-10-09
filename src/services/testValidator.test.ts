import { describe, expect, it } from 'vitest';
import { formatValidationError, validateTest } from './testValidator';

const validTest = {
  id: 'demo',
  title: 'Test de demo',
  difficulty: 'mixed',
  passThreshold: 0.7,
  shuffleQuestions: true,
  shuffleAnswers: true,
  questions: [
    {
      id: 'q1',
      text: '¿Cuánto es 2+2?',
      type: 'single',
      answers: [
        { id: 'a', text: '4', correct: true },
        { id: 'b', text: '5' },
      ],
    },
  ],
};

const withAnswers = (
  answers: Array<{ id: string; text: string; correct?: boolean }>,
) => ({
  ...validTest,
  questions: [{ ...validTest.questions[0], answers }],
});

describe('validateTest', () => {
  it('accepts a valid test with mixed difficulty', () => {
    const result = validateTest(validTest);
    expect(result.success).toBe(true);
  });

  it('rejects an unsupported difficulty', () => {
    const result = validateTest({ ...validTest, difficulty: 'impossible' });
    expect(result.success).toBe(false);
  });

  it('rejects a passThreshold outside the 0-1 range', () => {
    expect(validateTest({ ...validTest, passThreshold: 1.5 }).success).toBe(
      false,
    );
    expect(validateTest({ ...validTest, passThreshold: -0.1 }).success).toBe(
      false,
    );
  });

  it('requires at least two answers per question', () => {
    const result = validateTest(
      withAnswers([{ id: 'a', text: '4', correct: true }]),
    );
    expect(result.success).toBe(false);
  });

  it('rejects more than six answers per question', () => {
    const answers = Array.from({ length: 7 }, (_, i) => ({
      id: `a${i}`,
      text: `respuesta ${i}`,
    }));
    expect(validateTest(withAnswers(answers)).success).toBe(false);
  });

  it('rejects empty ids, titles and answer texts', () => {
    expect(validateTest({ ...validTest, id: '' }).success).toBe(false);
    expect(validateTest({ ...validTest, title: '' }).success).toBe(false);
    const result = validateTest(
      withAnswers([
        { id: 'a', text: '', correct: true },
        { id: 'b', text: '5' },
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('rejects ids longer than 50 and titles longer than 100', () => {
    expect(validateTest({ ...validTest, id: 'x'.repeat(51) }).success).toBe(
      false,
    );
    expect(validateTest({ ...validTest, title: 'x'.repeat(101) }).success).toBe(
      false,
    );
  });

  it('rejects a single question with more than one correct answer', () => {
    const result = validateTest(
      withAnswers([
        { id: 'a', text: '4', correct: true },
        { id: 'b', text: '5', correct: true },
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('allows a single question without a correct answer (annulled)', () => {
    const result = validateTest(
      withAnswers([
        { id: 'a', text: '4' },
        { id: 'b', text: '5' },
      ]),
    );
    expect(result.success).toBe(true);
  });

  it('rejects the multiple question type (not supported by the player)', () => {
    const result = validateTest({
      ...validTest,
      questions: [{ ...validTest.questions[0], type: 'multiple' }],
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected an invalid test');
    expect(
      result.error.issues.some((issue) => issue.path[0] === 'questions'),
    ).toBe(true);
  });

  it('rejects duplicate answer ids within a question', () => {
    const result = validateTest(
      withAnswers([
        { id: 'a', text: '4', correct: true },
        { id: 'a', text: '5' },
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('rejects duplicate question ids within a test', () => {
    const result = validateTest({
      ...validTest,
      questions: [validTest.questions[0], validTest.questions[0]],
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected an invalid test');
    expect(
      result.error.issues.some((issue) => issue.message.includes('duplicado')),
    ).toBe(true);
  });

  it('applies the default passThreshold', () => {
    const result = validateTest({ ...validTest, passThreshold: undefined });
    if (!result.success) throw new Error('expected a valid test');
    expect(result.data.passThreshold).toBe(0.6);
  });

  it('defaults shuffle flags to false', () => {
    const result = validateTest({
      ...validTest,
      shuffleQuestions: undefined,
      shuffleAnswers: undefined,
    });
    if (!result.success) throw new Error('expected a valid test');
    expect(result.data.shuffleQuestions).toBe(false);
    expect(result.data.shuffleAnswers).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(validateTest(42).success).toBe(false);
    expect(validateTest(null).success).toBe(false);
    expect(validateTest('test').success).toBe(false);
    expect(validateTest([]).success).toBe(false);
  });
});

describe('formatValidationError', () => {
  it('includes the issue path and message', () => {
    const result = validateTest({ ...validTest, difficulty: 'impossible' });
    if (result.success) throw new Error('expected an invalid test');
    expect(formatValidationError(result.error)).toContain('difficulty');
  });

  it('falls back to "raíz" for root-level issues', () => {
    const result = validateTest(42);
    if (result.success) throw new Error('expected an invalid test');
    expect(formatValidationError(result.error)).toContain('raíz');
  });

  it('joins at most three issues', () => {
    const result = validateTest({
      id: '',
      title: '',
      difficulty: 'impossible',
      questions: [],
    });
    if (result.success) throw new Error('expected an invalid test');
    expect(
      formatValidationError(result.error).split('; ').length,
    ).toBeLessThanOrEqual(3);
  });

  it('includes nested paths', () => {
    const result = validateTest(
      withAnswers([
        { id: 'a', text: '', correct: true },
        { id: 'b', text: '5' },
      ]),
    );
    if (result.success) throw new Error('expected an invalid test');
    expect(formatValidationError(result.error)).toContain('questions');
  });
});

describe('validateTest — tags y timeLimit', () => {
  it('accepts valid tags', () => {
    const result = validateTest({ ...validTest, tags: ['linux', 'shell'] });
    expect(result.success).toBe(true);
  });

  it('accepts tests without tags or timeLimit', () => {
    const result = validateTest({
      ...validTest,
      tags: undefined,
      timeLimit: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid tags', () => {
    expect(validateTest({ ...validTest, tags: [''] }).success).toBe(false);
    expect(validateTest({ ...validTest, tags: ['x'.repeat(31)] }).success).toBe(
      false,
    );
    expect(
      validateTest({
        ...validTest,
        tags: Array.from({ length: 11 }, (_, index) => `tag-${index}`),
      }).success,
    ).toBe(false);
    expect(validateTest({ ...validTest, tags: [42] }).success).toBe(false);
  });

  it('accepts a positive integer timeLimit', () => {
    const result = validateTest({ ...validTest, timeLimit: 30 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid timeLimit values', () => {
    expect(validateTest({ ...validTest, timeLimit: 0 }).success).toBe(false);
    expect(validateTest({ ...validTest, timeLimit: -5 }).success).toBe(false);
    expect(validateTest({ ...validTest, timeLimit: 2.5 }).success).toBe(false);
  });
});
