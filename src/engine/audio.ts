/**
 * Web Audio API Arabic Maqam Generative Synth (Oud / Nay + Convolution Reverb)
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export type MaqamId = 'hijaz' | 'bayati' | 'nahawand' | 'mute';

export interface MaqamDefinition {
  id: MaqamId;
  nameAr: string;
  nameEn: string;
  /** Frequency ratios relative to tonic (D3 = 146.83 Hz) across 1 octave */
  ratios: number[];
  timbre: 'oud' | 'nay';
  description: string;
}

export const MAQAMAT: Record<MaqamId, MaqamDefinition> = {
  hijaz: {
    id: 'hijaz',
    nameAr: 'مقام الحجاز',
    nameEn: 'Maqam Hijaz',
    // D, Eb (quarter-flat inflected), F#, G, A, Bb, C, D
    ratios: [1, 1.067, 1.26, 1.333, 1.5, 1.6, 1.778, 2],
    timbre: 'oud',
    description: 'Iconic augmented-second desert resonance (1 - b2 - 3 - 4 - 5 - b6 - b7)',
  },
  bayati: {
    id: 'bayati',
    nameAr: 'مقام بياتي',
    nameEn: 'Maqam Bayati',
    // D, E-half-flat (~3/4 tone), F, G, A, Bb, C, D
    ratios: [1, 1.0905, 1.189, 1.333, 1.5, 1.6, 1.778, 2],
    timbre: 'nay',
    description: 'Traditional Asiri highland microtonal 3/4-tone folk warmth',
  },
  nahawand: {
    id: 'nahawand',
    nameAr: 'مقام نهوند',
    nameEn: 'Maqam Nahawand',
    // D, E, F, G, A, Bb, C#, D
    ratios: [1, 1.125, 1.2, 1.333, 1.5, 1.6, 1.875, 2],
    timbre: 'oud',
    description: 'Lyrical minor harmonic cadence with crystalline overtones',
  },
  mute: {
    id: 'mute',
    nameAr: 'صامت',
    nameEn: 'Mute',
    ratios: [1],
    timbre: 'oud',
    description: 'Silent Atelier Mode',
  },
};

export class MaqamAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private activeMaqam: MaqamId = 'hijaz';
  private lastNoteTime = 0;
  private baseFreq = 146.832; // D3

  public get maqam(): MaqamId {
    return this.activeMaqam;
  }

  public setMaqam(id: MaqamId): void {
    this.activeMaqam = id;
    if (id !== 'mute') {
      this.ensureInitialized();
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
    }
  }

  public unlock(): void {
    if (this.activeMaqam === 'mute') return;
    this.ensureInitialized();
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private ensureInitialized(): void {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.42;

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.68;

    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.48;

    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.buildNaturalReverbIR(this.ctx, 2.4, 2.8);

    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.convolver);
    this.convolver.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  /** Synthesize warm Asiri stone-courtyard impulse response */
  private buildNaturalReverbIR(
    ctx: AudioContext,
    durationSec: number,
    decay: number
  ): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Early stone reflections + smooth exponential tail
        const env = Math.pow(1 - t, decay);
        data[i] = (Math.random() * 2 - 1) * env * 0.6;
      }
    }
    return impulse;
  }

  /**
   * Trigger a procedural Maqam note mapped from normalized geometry parameters.
   * @param normalizedPitch 0..1 mapped across 2 octaves of the active Maqam
   * @param pan -1..1 stereo position
   * @param velocity 0..1 intensity
   */
  public triggerGeometryNote(
    normalizedPitch: number,
    pan = 0,
    velocity = 0.65
  ): void {
    if (this.activeMaqam === 'mute') return;
    this.ensureInitialized();
    if (!this.ctx || !this.dryGain || !this.wetGain) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    // Rate-limit to max ~11 notes/sec to maintain musical clarity
    if (now - this.lastNoteTime < 0.088) return;
    this.lastNoteTime = now;

    const maqam = MAQAMAT[this.activeMaqam];
    const ratios = maqam.ratios;
    const clamped = Math.max(0, Math.min(0.999, normalizedPitch));
    const totalSteps = ratios.length * 2 - 1;
    const stepIdx = Math.floor(clamped * totalSteps);
    const octave = Math.floor(stepIdx / ratios.length);
    const degree = stepIdx % ratios.length;
    const freq = this.baseFreq * ratios[degree] * Math.pow(2, octave);

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, pan)), now);
    panner.connect(this.dryGain);
    panner.connect(this.wetGain);

    if (maqam.timbre === 'oud') {
      this.playOudPluck(freq, now, velocity, panner);
    } else {
      this.playNayBreath(freq * 2, now, velocity, panner);
    }
  }

  private playOudPluck(
    freq: number,
    now: number,
    velocity: number,
    dest: AudioNode
  ): void {
    if (!this.ctx) return;

    // Dual-oscillator warm plucked string (fundamental + 2nd harmonic)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2.002, now); // subtle double-course Oud chorus

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 5.2, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(180, freq * 1.4), now + 0.55);
    filter.Q.value = 1.6;

    const env = this.ctx.createGain();
    const peak = Math.min(0.32, 0.14 + velocity * 0.18);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0008, now + 1.35);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.28;

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(env);
    env.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.4);
    osc2.stop(now + 1.4);
  }

  private playNayBreath(
    freq: number,
    now: number,
    velocity: number,
    dest: AudioNode
  ): void {
    if (!this.ctx) return;

    // Breathy flute tone with gentle vibrato
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 5.2;
    lfoGain.gain.value = freq * 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const harmonic = this.ctx.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, now);
    const harmGain = this.ctx.createGain();
    harmGain.gain.value = 0.12;

    const env = this.ctx.createGain();
    const peak = Math.min(0.24, 0.09 + velocity * 0.15);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.075);
    env.gain.exponentialRampToValueAtTime(0.0008, now + 1.15);

    osc.connect(env);
    harmonic.connect(harmGain);
    harmGain.connect(env);
    env.connect(dest);

    lfo.start(now);
    osc.start(now);
    harmonic.start(now);
    lfo.stop(now + 1.2);
    osc.stop(now + 1.2);
    harmonic.stop(now + 1.2);
  }
}
