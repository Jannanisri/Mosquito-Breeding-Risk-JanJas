// Web Audio API synthesized alert sound generator
// Eliminates external MP3 dependencies, CORS issues, or broken sound paths

class SoundAlertController {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private lastAlertTime: number = 0;

  constructor() {
    // Check if user previously enabled sound
    try {
      const saved = localStorage.getItem('mosqguard_sound_enabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    } catch {
      this.soundEnabled = false;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('mosqguard_sound_enabled', enabled ? 'true' : 'false');
    } catch {
      // ignore localStorage errors
    }

    if (enabled) {
      this.initContext();
      this.playTestBeep();
    }
  }

  private initContext(): void {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a restrained, futuristic double-tone alert chime
   * Debounced to prevent continuous loud ringing
   */
  public playRiskAlert(): void {
    if (!this.soundEnabled) return;

    const now = Date.now();
    // Do not repeat within 8 seconds to avoid continuous annoyance
    if (now - this.lastAlertTime < 8000) return;
    this.lastAlertTime = now;

    this.initContext();
    if (!this.audioCtx) return;

    try {
      const t = this.audioCtx.currentTime;

      // Master gain for pleasant volume
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, t);
      masterGain.connect(this.audioCtx.destination);

      // Tone 1: 523.25 Hz (C5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, t);
      gain1.gain.setValueAtTime(0.0, t);
      gain1.gain.linearRampToValueAtTime(0.4, t + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc1.connect(gain1);
      gain1.connect(masterGain);

      // Tone 2: 783.99 Hz (G5) for an alert interval
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, t + 0.12);
      gain2.gain.setValueAtTime(0.0, t + 0.12);
      gain2.gain.linearRampToValueAtTime(0.45, t + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc1.start(t);
      osc1.stop(t + 0.3);
      osc2.start(t + 0.12);
      osc2.stop(t + 0.46);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Short preview chime when user enables audio
   */
  public playTestBeep(): void {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // E5
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // ignore
    }
  }
}

export const soundAlert = new SoundAlertController();
