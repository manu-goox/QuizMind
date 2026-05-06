import { z } from 'zod';

const answerSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean().optional(),
});

const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.enum(['single', 'multiple']),
  answers: z.array(answerSchema).min(2).max(6),
  explanation: z.string().optional(),
});

const testSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  passThreshold: z.number().min(0).max(1).default(0.6),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  questions: z.array(questionSchema).min(1),
});

export function validateTest(data: unknown) {
  return testSchema.safeParse(data);
}

export function validateTestsIndex(data: unknown) {
  const indexSchema = z.object({
    tests: z.array(z.object({
      id: z.string().min(1),
      file: z.string().min(1),
      title: z.string().min(1).max(100),
      category: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      questionCount: z.number().int().positive(),
    }))
  });
  return indexSchema.safeParse(data);
}

export function validateTestMetadata(data: unknown) {
  const metadataSchema = z.object({
    id: z.string().min(1),
    file: z.string().min(1),
    title: z.string().min(1).max(100),
    category: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    questionCount: z.number().int().positive(),
  });
  return metadataSchema.safeParse(data);
}