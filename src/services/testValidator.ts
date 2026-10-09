import { z } from 'zod';

z.config(z.locales.es());

export const difficultySchema = z.enum(['easy', 'medium', 'hard', 'mixed']);

const answerSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean().optional(),
});

const questionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    type: z.enum(['single', 'multiple']),
    answers: z.array(answerSchema).min(2).max(6),
    explanation: z.string().optional(),
  })
  .superRefine((question, ctx) => {
    if (question.type === 'multiple') {
      ctx.addIssue({
        code: 'custom',
        message:
          'Las preguntas de tipo multiple aún no están soportadas; usa single',
        path: ['type'],
      });
      return;
    }
    const answerIds = question.answers.map((answer) => answer.id);
    if (new Set(answerIds).size !== answerIds.length) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Los identificadores de respuesta deben ser únicos dentro de la pregunta',
        path: ['answers'],
      });
    }
    const correctCount = question.answers.filter(
      (answer) => answer.correct,
    ).length;
    if (correctCount > 1) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Una pregunta de tipo single no puede tener más de una respuesta correcta',
        path: ['answers'],
      });
    }
  });

const testSchema = z
  .object({
    id: z.string().min(1).max(50),
    title: z.string().min(1).max(100),
    description: z.string().max(300).optional(),
    category: z.string().optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    difficulty: difficultySchema,
    passThreshold: z.number().min(0).max(1).default(0.6),
    timeLimit: z.number().int().positive().optional(),
    shuffleQuestions: z.boolean().default(false),
    shuffleAnswers: z.boolean().default(false),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((test, ctx) => {
    const seen = new Set<string>();
    test.questions.forEach((question, index) => {
      if (seen.has(question.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `El identificador de pregunta "${question.id}" está duplicado`,
          path: ['questions', index, 'id'],
        });
      }
      seen.add(question.id);
    });
  });

export function validateTest(data: unknown) {
  return testSchema.safeParse(data);
}

export function formatValidationError(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'raíz';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
