export interface ScoreResult {
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

export function calculateResults(
  test: {
    questions: Array<{
      id: string;
      answers: Array<{ id: string; correct?: boolean }>;
    }>;
    passThreshold?: number;
  },
  answers: Record<string, string>,
  timeSpent: number,
): ScoreResult {
  let answered = 0;
  let correct = 0;
  let annulled = 0;

  for (const question of test.questions) {
    const correctAnswer = question.answers.find((a) => a.correct);
    if (!correctAnswer) {
      annulled++;
      continue;
    }
    const userAnswer = answers[question.id];
    if (!userAnswer) continue;
    answered++;
    if (correctAnswer.id === userAnswer) {
      correct++;
    }
  }

  const total = test.questions.length - annulled;
  const wrong = answered - correct;
  const blank = total - answered;
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  const passThreshold = test.passThreshold ?? 0.6;
  const passed = total > 0 && correct / total >= passThreshold;

  return {
    total,
    answered,
    correct,
    wrong,
    blank,
    annulled,
    percentage,
    passed,
    timeSpent,
  };
}
