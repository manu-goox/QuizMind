import { afterEach, describe, expect, it } from 'vitest';
import { isTauri } from './desktop';

type GlobalWithTauri = typeof globalThis & { __TAURI_INTERNALS__?: unknown };

describe('isTauri', () => {
  afterEach(() => {
    delete (globalThis as GlobalWithTauri).__TAURI_INTERNALS__;
  });

  it('returns false when Tauri internals are not present', () => {
    expect(isTauri()).toBe(false);
  });

  it('returns true when Tauri internals are present', () => {
    (globalThis as GlobalWithTauri).__TAURI_INTERNALS__ = {};
    expect(isTauri()).toBe(true);
  });
});
