import type { Question, Test } from '../types';

const REVIEW_TITLE_SUFFIX = ' (repaso de fallos)';

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

export function buildFailureReviewTest(
  test: Test,
  answers: Record<string, string>,
): Test {
  const baseTitle = test.title.replace(/\s*\(repaso de fallos\)$/, '');
  return {
    ...test,
    title: `${baseTitle}${REVIEW_TITLE_SUFFIX}`,
    questions: collectFailedQuestions(test, answers),
    shuffleQuestions: false,
    shuffleAnswers: false,
    timeLimit: undefined,
  };
}
