import { create } from 'zustand';
import type { Theme } from '../types';
import { audioManager } from '../services/audioManager';

interface AudioSettings {
  musicVolume: number;
  effectsVolume: number;
  musicEnabled: boolean;
  effectsEnabled: boolean;
}

interface SettingsStore {
  theme: Theme;
  audio: AudioSettings;
  audioUnlocked: boolean;
  setTheme: (theme: Theme) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  toggleMusic: () => void;
  toggleEffects: () => void;
  muteAll: () => void;
  unlockAudio: () => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const DEFAULT_THEME: Theme = {
  id: 'dark',
  name: 'Dark',
  file: '/themes/dark.css',
};

const DEFAULT_AUDIO: AudioSettings = {
  musicVolume: 0.5,
  effectsVolume: 0.7,
  musicEnabled: false,
  effectsEnabled: true,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  theme: DEFAULT_THEME,
  audio: DEFAULT_AUDIO,
  audioUnlocked: false,

  setTheme: (theme: Theme) => {
    set({ theme });
    get().saveSettings();
  },

  setMusicVolume: (volume: number) => {
    set((state) => ({ audio: { ...state.audio, musicVolume: volume } }));
    audioManager.setMusicVolume(volume);
    get().saveSettings();
  },

  setEffectsVolume: (volume: number) => {
    set((state) => ({ audio: { ...state.audio, effectsVolume: volume } }));
    audioManager.setEffectsVolume(volume);
    get().saveSettings();
  },

  toggleMusic: () => {
    set((state) => {
      const enabled = !state.audio.musicEnabled;
      audioManager.setMusicEnabled(enabled);
      return { audio: { ...state.audio, musicEnabled: enabled } };
    });
    get().saveSettings();
  },

  toggleEffects: () => {
    set((state) => {
      const enabled = !state.audio.effectsEnabled;
      audioManager.setEffectsEnabled(enabled);
      return { audio: { ...state.audio, effectsEnabled: enabled } };
    });
    get().saveSettings();
  },

  muteAll: () => {
    audioManager.muteAll();
    set((state) => ({
      audio: { ...state.audio, musicEnabled: false, effectsEnabled: false },
    }));
    get().saveSettings();
  },

  unlockAudio: () => {
    set({ audioUnlocked: true });
  },

  loadSettings: () => {
    try {
      const saved = localStorage.getItem('quizmind-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const theme = parsed.theme || DEFAULT_THEME;
        const audio = { ...DEFAULT_AUDIO, ...parsed.audio };
        set({ theme, audio });
        audioManager.setEffectsEnabled(audio.effectsEnabled);
        audioManager.setEffectsVolume(audio.effectsVolume);
        audioManager.setMusicEnabled(audio.musicEnabled);
        audioManager.setMusicVolume(audio.musicVolume);
      }
    } catch {
      console.warn('Failed to load settings from localStorage');
    }
  },

  saveSettings: () => {
    const { theme, audio } = get();
    localStorage.setItem('quizmind-settings', JSON.stringify({ theme, audio }));
  },
}));