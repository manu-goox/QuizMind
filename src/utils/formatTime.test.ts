import { describe, expect, it } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('formats zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('pads seconds', () => {
    expect(formatTime(65_000)).toBe('1:05');
  });

  it('formats long durations in minutes', () => {
    expect(formatTime(3_600_000)).toBe('60:00');
  });

  it('clamps negative values to zero', () => {
    expect(formatTime(-1_000)).toBe('0:00');
  });
});
