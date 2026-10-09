import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { formatValidationError, validateTest } from '../services/testValidator';

const testsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'test',
);
const files = readdirSync(testsDir).filter((name) => name.endsWith('.json'));

function loadTest(file: string) {
  const data: unknown = JSON.parse(readFileSync(join(testsDir, file), 'utf8'));
  const result = validateTest(data);
  if (!result.success) {
    throw new Error(`${file}: ${formatValidationError(result.error)}`);
  }
  return result.data;
}

describe('carpeta test/', () => {
  it('contiene al menos un test', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('cada archivo es un test válido con id único', () => {
    const ids = new Set<string>();
    for (const file of files) {
      let data: unknown;
      try {
        data = JSON.parse(readFileSync(join(testsDir, file), 'utf8'));
      } catch (err) {
        throw new Error(`${file}: ${(err as Error).message}`, { cause: err });
      }
      const result = validateTest(data);
      if (!result.success) {
        throw new Error(`${file}: ${formatValidationError(result.error)}`);
      }
      expect(
        ids.has(result.data.id),
        `id duplicado "${result.data.id}" en ${file}`,
      ).toBe(false);
      ids.add(result.data.id);
    }
  });

  it('cada test tiene ids de pregunta únicos', () => {
    for (const file of files) {
      const test = loadTest(file);
      const questionIds = new Set(
        test.questions.map((question) => question.id),
      );
      expect(questionIds.size, `ids de pregunta duplicados en ${file}`).toBe(
        test.questions.length,
      );
    }
  });

  it('cada pregunta single tiene como máximo una respuesta correcta', () => {
    for (const file of files) {
      const test = loadTest(file);
      for (const question of test.questions) {
        const correct = question.answers.filter(
          (answer) => answer.correct,
        ).length;
        expect(correct, `${file} → ${question.id}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('no usa el tipo multiple (aún no soportado en el reproductor)', () => {
    for (const file of files) {
      const test = loadTest(file);
      for (const question of test.questions) {
        expect(question.type, `${file} → ${question.id}`).toBe('single');
      }
    }
  });

  it('la categoría, si existe, no está vacía', () => {
    for (const file of files) {
      const test = loadTest(file);
      if (test.category !== undefined) {
        expect(
          test.category.trim().length,
          `categoría vacía en ${file}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('el límite de tiempo, si existe, es un entero positivo', () => {
    for (const file of files) {
      const test = loadTest(file);
      if (test.timeLimit !== undefined) {
        expect(
          Number.isInteger(test.timeLimit),
          `timeLimit inválido en ${file}`,
        ).toBe(true);
        expect(test.timeLimit, `timeLimit inválido en ${file}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  it('las etiquetas, si existen, son strings no vacíos', () => {
    for (const file of files) {
      const test = loadTest(file);
      if (test.tags !== undefined) {
        expect(Array.isArray(test.tags), `tags inválido en ${file}`).toBe(true);
        expect(
          test.tags.length,
          `demasiadas etiquetas en ${file}`,
        ).toBeLessThanOrEqual(10);
        for (const tag of test.tags) {
          expect(typeof tag, `etiqueta no string en ${file}`).toBe('string');
          expect(
            tag.trim().length,
            `etiqueta vacía en ${file}`,
          ).toBeGreaterThan(0);
          expect(
            tag.length,
            `etiqueta demasiado larga en ${file}`,
          ).toBeLessThanOrEqual(30);
        }
      }
    }
  });
});
