import type { SoundType } from '../types';

class AudioManager {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private volume = { music: 0.5, effects: 0.7 };
  private enabled = { music: false, effects: true };
  private cooldowns: Map<SoundType, number> = new Map();
  private readonly COOLDOWN_MS = 80;

  init() {
    this.loadMusicFiles();
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      this.ctx = new AudioContext();
      if (this.enabled.music) this.playMusic();
    } catch {
      console.warn('Web Audio API not available');
    }
  }

  /* ================================================================
     Tone generators — pure Web Audio API, no external files needed
     ================================================================ */

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volOverride?: number,
  ) {
    if (!this.unlocked || !this.enabled.effects || !this.ctx) return;
    const vol = volOverride ?? this.volume.effects;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.01);
  }

  private arpeggio(notes: number[], totalDuration: number) {
    if (!this.unlocked || !this.enabled.effects || !this.ctx) return;
    const vol = this.volume.effects;
    const noteDuration = totalDuration / notes.length;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      const startTime = this.ctx!.currentTime + i * noteDuration;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol * 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + noteDuration + 0.03,
      );
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.04);
    });
  }

  /* ================================================================
     Public play — cooldown per sound type
     ================================================================ */

  play(sound: SoundType) {
    const now = Date.now();
    const last = this.cooldowns.get(sound) || 0;
    if (now - last < this.COOLDOWN_MS) return;
    this.cooldowns.set(sound, now);

    switch (sound) {
      /* Click — short, crisp tap (~800Hz, 60ms) */
      case 'click':
        this.tone(900, 0.06, 'sine', this.volume.effects * 0.5);
        break;

      /* Skip — neutral thin tone (~500Hz, triangle, 80ms) */
      case 'skip':
        this.tone(500, 0.08, 'triangle');
        break;

      /* Win — ascending arpeggio (CEGC, 400ms) */
      case 'win':
        this.arpeggio([523, 659, 784, 1047], 0.4);
        break;

      /* Complete — warm single tone (~500Hz, 200ms) */
      case 'complete':
        this.tone(500, 0.2, 'sine');
        break;

      /* Start — bright anticipation (~700Hz, triangle, 150ms) */
      case 'start':
        this.tone(700, 0.15, 'triangle');
        break;

      /* Correct — soft two-note ascending chime (E5→B5, 140ms) */
      case 'correct':
        this.arpeggio([659, 988], 0.14);
        break;

      /* Incorrect — low muted tone (~160Hz, triangle, 180ms) */
      case 'incorrect':
        this.tone(160, 0.18, 'triangle');
        break;
    }
  }

  /* ================================================================
     Music — MP3 file-based with random track rotation
     ================================================================ */

  private musicAudio: HTMLAudioElement | null = null;
  private musicFiles: string[] = [];
  private currentMusicIndex = -1;
  private musicPlaying = false;

  async loadMusicFiles() {
    try {
      const res = await fetch('/sounds/index.json');
      if (!res.ok) throw new Error('Failed to load music index');
      const data = await res.json();
      this.musicFiles = data.tracks || [];
    } catch {
      this.musicFiles = [];
    }
    /* Retry autostart: covers the race where music was enabled and the
       context unlocked before the track index finished loading. */
    if (this.enabled.music && this.unlocked && !this.musicPlaying) {
      this.playMusic();
    }
  }

  playMusic() {
    if (!this.enabled.music) return;
    if (this.musicPlaying) return;
    if (this.musicFiles.length === 0) return;

    this.musicPlaying = true;

    if (!this.musicAudio) {
      this.musicAudio = new Audio();
      this.musicAudio.volume = this.volume.music;
      this.musicAudio.addEventListener('ended', () => this.playRandomTrack());
    }

    this.playRandomTrack();
  }

  private playRandomTrack() {
    if (!this.musicPlaying || this.musicFiles.length === 0 || !this.musicAudio)
      return;

    let nextIndex: number;
    if (this.musicFiles.length === 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * this.musicFiles.length);
      } while (nextIndex === this.currentMusicIndex);
    }

    this.currentMusicIndex = nextIndex;
    this.musicAudio.src = this.musicFiles[nextIndex];
    this.musicAudio.play().catch(() => {});
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
  }

  /* ================================================================
     Settings sync — called by store or panel
     ================================================================ */

  setMusicEnabled(enabled: boolean) {
    this.enabled.music = enabled;
    if (enabled) this.playMusic();
    if (!enabled) this.stopMusic();
  }

  setEffectsEnabled(enabled: boolean) {
    this.enabled.effects = enabled;
  }

  setMusicVolume(volume: number) {
    this.volume.music = volume;
    if (this.musicAudio) {
      this.musicAudio.volume = volume;
    }
  }

  setEffectsVolume(volume: number) {
    this.volume.effects = volume;
  }

  muteAll() {
    this.enabled.music = false;
    this.enabled.effects = false;
    this.stopMusic();
  }

  isEffectsEnabled() {
    return this.enabled.effects;
  }

  isMusicEnabled() {
    return this.enabled.music;
  }

  getEffectsVolume() {
    return this.volume.effects;
  }

  getMusicVolume() {
    return this.volume.music;
  }
}

export const audioManager = new AudioManager();
