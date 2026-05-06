export interface ScoreResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
}

export function calculateResults(
  test: { questions: Array<{ id: string; answers: Array<{ id: string; correct?: boolean }> }> },
  answers: Record<string, string>,
  timeSpent: number
): ScoreResult {
  const total = test.questions.length;
  let correct = 0;
  let answered = 0;

  for (const question of test.questions) {
    const userAnswer = answers[question.id];
    if (!userAnswer) continue;
    answered++;
    const correctAnswer = question.answers.find((a) => a.correct);
    if (correctAnswer && correctAnswer.id === userAnswer) {
      correct++;
    }
  }

  const wrong = answered - correct;
  const blank = total - answered;
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  const passed = percentage >= 60;

  return { total, answered, correct, wrong, blank, percentage, passed, timeSpent };
}