import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '../types';
import { audioManager } from '../services/audioManager';
import { useSettingsStore } from './useSettingsStore';

const STORAGE_KEY = 'quizmind-settings';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  };
}

const storage = createMemoryStorage();
vi.stubGlobal('localStorage', storage);

const initialTheme = useSettingsStore.getState().theme;
const initialAudio = useSettingsStore.getState().audio;

const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  file: '/themes/light.css',
};

beforeEach(() => {
  storage.clear();
  useSettingsStore.setState({ theme: initialTheme, audio: initialAudio });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSettingsStore', () => {
  it('starts with the default theme and audio settings', () => {
    const state = useSettingsStore.getState();
    expect(state.theme.id).toBe('dark');
    expect(state.audio).toEqual({
      musicVolume: 0.5,
      effectsVolume: 0.7,
      musicEnabled: false,
      effectsEnabled: true,
    });
  });

  it('updates the theme and persists it', () => {
    useSettingsStore.getState().setTheme(lightTheme);
    expect(useSettingsStore.getState().theme.id).toBe('light');
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) as string);
    expect(saved.theme.id).toBe('light');
  });

  it('propagates volume changes to the audio manager and persists them', () => {
    const musicSpy = vi
      .spyOn(audioManager, 'setMusicVolume')
      .mockImplementation(() => {});
    const effectsSpy = vi
      .spyOn(audioManager, 'setEffectsVolume')
      .mockImplementation(() => {});

    useSettingsStore.getState().setMusicVolume(0.2);
    useSettingsStore.getState().setEffectsVolume(0.4);

    expect(useSettingsStore.getState().audio.musicVolume).toBe(0.2);
    expect(useSettingsStore.getState().audio.effectsVolume).toBe(0.4);
    expect(musicSpy).toHaveBeenCalledWith(0.2);
    expect(effectsSpy).toHaveBeenCalledWith(0.4);
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) as string);
    expect(saved.audio.musicVolume).toBe(0.2);
    expect(saved.audio.effectsVolume).toBe(0.4);
  });

  it('toggles music and effects', () => {
    const musicSpy = vi
      .spyOn(audioManager, 'setMusicEnabled')
      .mockImplementation(() => {});
    const effectsSpy = vi
      .spyOn(audioManager, 'setEffectsEnabled')
      .mockImplementation(() => {});

    useSettingsStore.getState().toggleMusic();
    expect(useSettingsStore.getState().audio.musicEnabled).toBe(true);
    expect(musicSpy).toHaveBeenLastCalledWith(true);

    useSettingsStore.getState().toggleMusic();
    expect(useSettingsStore.getState().audio.musicEnabled).toBe(false);
    expect(musicSpy).toHaveBeenLastCalledWith(false);

    useSettingsStore.getState().toggleEffects();
    expect(useSettingsStore.getState().audio.effectsEnabled).toBe(false);
    expect(effectsSpy).toHaveBeenLastCalledWith(false);
  });

  it('mutes everything', () => {
    const muteSpy = vi
      .spyOn(audioManager, 'muteAll')
      .mockImplementation(() => {});
    useSettingsStore.getState().muteAll();
    const audio = useSettingsStore.getState().audio;
    expect(audio.musicEnabled).toBe(false);
    expect(audio.effectsEnabled).toBe(false);
    expect(muteSpy).toHaveBeenCalledTimes(1);
  });

  it('applies stored settings on load', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: lightTheme,
        audio: { musicEnabled: true, musicVolume: 0.2 },
      }),
    );
    const effectsEnabledSpy = vi
      .spyOn(audioManager, 'setEffectsEnabled')
      .mockImplementation(() => {});
    const effectsVolumeSpy = vi
      .spyOn(audioManager, 'setEffectsVolume')
      .mockImplementation(() => {});
    const musicEnabledSpy = vi
      .spyOn(audioManager, 'setMusicEnabled')
      .mockImplementation(() => {});
    const musicVolumeSpy = vi
      .spyOn(audioManager, 'setMusicVolume')
      .mockImplementation(() => {});

    useSettingsStore.getState().loadSettings();

    const state = useSettingsStore.getState();
    expect(state.theme.id).toBe('light');
    expect(state.audio).toEqual({
      musicVolume: 0.2,
      effectsVolume: 0.7,
      musicEnabled: true,
      effectsEnabled: true,
    });
    expect(effectsEnabledSpy).toHaveBeenCalledWith(true);
    expect(effectsVolumeSpy).toHaveBeenCalledWith(0.7);
    expect(musicEnabledSpy).toHaveBeenCalledWith(true);
    expect(musicVolumeSpy).toHaveBeenCalledWith(0.2);
  });

  it('keeps defaults when nothing is stored', () => {
    const musicSpy = vi
      .spyOn(audioManager, 'setMusicEnabled')
      .mockImplementation(() => {});
    useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().theme.id).toBe('dark');
    expect(musicSpy).not.toHaveBeenCalled();
  });

  it('ignores corrupt stored settings', () => {
    storage.setItem(STORAGE_KEY, '{not-json');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    useSettingsStore.getState().loadSettings();

    expect(useSettingsStore.getState().theme.id).toBe('dark');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('does not throw when saving fails', () => {
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() =>
      useSettingsStore.getState().setTheme(lightTheme),
    ).not.toThrow();
    expect(useSettingsStore.getState().theme.id).toBe('light');
    expect(warnSpy).toHaveBeenCalled();
  });
});
