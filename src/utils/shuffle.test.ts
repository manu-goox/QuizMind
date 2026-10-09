import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('keeps every element', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort((a, b) => a - b)).toEqual(input);
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single element', () => {
    expect(shuffle([7])).toEqual([7]);
  });

  it('returns a valid permutation of two elements', () => {
    const result = shuffle([1, 2]);
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2]);
  });

  it('keeps the same object references', () => {
    const first = { n: 1 };
    const second = { n: 2 };
    const result = shuffle([first, second]);
    expect(result).toContain(first);
    expect(result).toContain(second);
  });

  it('produces different orders across runs', () => {
    const input = Array.from({ length: 50 }, (_, index) => index);
    const orders = new Set(
      Array.from({ length: 10 }, () => shuffle(input).join(',')),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
