import { describe, expect, it } from 'vitest';
import { getRemainingSeconds } from './timer';

describe('getRemainingSeconds', () => {
  it('returns null when the test has no time limit', () => {
    expect(getRemainingSeconds(1000, undefined, 2000)).toBeNull();
    expect(getRemainingSeconds(null, 0, 2000)).toBeNull();
  });

  it('returns the full limit when the quiz has not started', () => {
    expect(getRemainingSeconds(null, 30, 5000)).toBe(1800);
  });

  it('counts down from the persisted startTime', () => {
    const start = 1_000_000;
    const now = start + 90_000;
    expect(getRemainingSeconds(start, 10, now)).toBe(510);
  });

  it('keeps the remaining time after a simulated refresh', () => {
    const start = 1_000_000;
    const beforeRefresh = start + 60_000;
    const afterRefresh = start + 120_000;
    expect(getRemainingSeconds(start, 5, beforeRefresh)).toBe(240);
    expect(getRemainingSeconds(start, 5, afterRefresh)).toBe(180);
  });

  it('never goes below zero when the time is up', () => {
    const start = 1_000_000;
    expect(getRemainingSeconds(start, 1, start + 120_000)).toBe(0);
  });

  it('clamps negative elapsed time (clock skew)', () => {
    const start = 1_000_000;
    expect(getRemainingSeconds(start, 10, start - 5000)).toBe(600);
  });

  it('floors sub-second precision', () => {
    const start = 1_000_000;
    expect(getRemainingSeconds(start, 10, start + 1500)).toBe(599);
  });
});
