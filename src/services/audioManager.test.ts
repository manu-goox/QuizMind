import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeGainNode {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}

class FakeOscillatorNode {
  type = '';
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  currentTime = 0;
  destination = {};
  oscillators: FakeOscillatorNode[] = [];

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = new FakeOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGainNode();
  }
}

class FakeAudio {
  static instances: FakeAudio[] = [];
  src = '';
  volume = 1;
  currentTime = 0;
  play = vi.fn(async () => {});
  pause = vi.fn();
  listeners: Record<string, Array<() => void>> = {};

  constructor() {
    FakeAudio.instances.push(this);
  }

  addEventListener = vi.fn((type: string, callback: () => void) => {
    (this.listeners[type] ??= []).push(callback);
  });
}

vi.stubGlobal('AudioContext', FakeAudioContext);
vi.stubGlobal('Audio', FakeAudio);

async function freshManager() {
  vi.resetModules();
  const module = await import('./audioManager');
  return module.audioManager;
}

function stubFetch(tracks: string[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ tracks }),
    })),
  );
}

beforeEach(() => {
  FakeAudioContext.instances.length = 0;
  FakeAudio.instances.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('audioManager', () => {
  it('does nothing before unlock', async () => {
    const manager = await freshManager();
    manager.play('click');
    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('creates a single AudioContext on unlock', async () => {
    const manager = await freshManager();
    manager.unlock();
    manager.unlock();
    expect(FakeAudioContext.instances).toHaveLength(1);
  });

  it('warns when Web Audio is unavailable', async () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('not supported');
        }
      },
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const manager = await freshManager();
    manager.unlock();
    expect(warnSpy).toHaveBeenCalled();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    warnSpy.mockRestore();
  });

  it('plays a tone for click and skip', async () => {
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.play('click');
    manager.play('skip');

    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators[0].type).toBe('sine');
    expect(context.oscillators[1].type).toBe('triangle');
  });

  it('plays an arpeggio for win', async () => {
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.play('win');
    expect(context.oscillators).toHaveLength(4);
  });

  it('plays a chime for correct and a low tone for incorrect', async () => {
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.play('correct');
    expect(context.oscillators).toHaveLength(2);

    manager.play('incorrect');
    expect(context.oscillators).toHaveLength(3);
    expect(context.oscillators[2].type).toBe('triangle');
  });

  it('applies an 80ms cooldown per sound type', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.play('click');
    manager.play('click');
    expect(context.oscillators).toHaveLength(1);

    vi.setSystemTime(1_000_100);
    manager.play('click');
    expect(context.oscillators).toHaveLength(2);
  });

  it('ignores effects when disabled', async () => {
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.setEffectsEnabled(false);
    manager.play('click');

    expect(context.oscillators).toHaveLength(0);
    expect(manager.isEffectsEnabled()).toBe(false);
  });

  it('stops effects after muteAll', async () => {
    const manager = await freshManager();
    manager.unlock();
    const context = FakeAudioContext.instances[0];

    manager.muteAll();
    manager.play('click');

    expect(context.oscillators).toHaveLength(0);
  });

  it('loads tracks and plays music when enabled', async () => {
    stubFetch(['/sounds/a.mp3', '/sounds/b.mp3']);
    const manager = await freshManager();

    await manager.loadMusicFiles();
    manager.setMusicEnabled(true);

    expect(FakeAudio.instances).toHaveLength(1);
    const audio = FakeAudio.instances[0];
    expect(audio.play).toHaveBeenCalled();
    expect(['/sounds/a.mp3', '/sounds/b.mp3']).toContain(audio.src);

    manager.setMusicEnabled(false);
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('rotates to a different track when one ends', async () => {
    stubFetch(['/sounds/a.mp3', '/sounds/b.mp3']);
    const manager = await freshManager();

    await manager.loadMusicFiles();
    manager.setMusicEnabled(true);

    const audio = FakeAudio.instances[0];
    const firstSrc = audio.src;
    audio.listeners.ended[0]();

    expect(audio.src).not.toBe(firstSrc);
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it('updates the music volume', async () => {
    stubFetch(['/sounds/a.mp3']);
    const manager = await freshManager();

    await manager.loadMusicFiles();
    manager.setMusicEnabled(true);
    manager.setMusicVolume(0.2);

    expect(FakeAudio.instances[0].volume).toBe(0.2);
    expect(manager.getMusicVolume()).toBe(0.2);
  });

  it('starts music once the index loads if already enabled and unlocked', async () => {
    stubFetch(['/sounds/a.mp3']);
    const manager = await freshManager();
    manager.unlock();
    manager.setMusicEnabled(true);
    expect(FakeAudio.instances).toHaveLength(0);

    await manager.loadMusicFiles();

    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0].play).toHaveBeenCalled();
  });

  it('does not throw when enabling music without tracks', async () => {
    const manager = await freshManager();
    expect(() => manager.setMusicEnabled(true)).not.toThrow();
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it('exposes volume getters and setters', async () => {
    const manager = await freshManager();
    expect(manager.getEffectsVolume()).toBe(0.7);
    expect(manager.getMusicVolume()).toBe(0.5);

    manager.setEffectsVolume(0.4);
    expect(manager.getEffectsVolume()).toBe(0.4);
  });
});
