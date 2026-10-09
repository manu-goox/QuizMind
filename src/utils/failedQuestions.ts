import type { Question, Test } from '../types';

export function collectFailedQuestions(
  test: Test,
  answers: Record<string, string>,
): Question[] {
  return test.questions.filter((question) => {
    const correctAnswer = question.answers.find((answer) => answer.correct);
    if (!correctAnswer) return false;
    const userAnswer = answers[question.id];
    return !!userAnswer && userAnswer !== correctAnswer.id;
  });
}
