/**
 * QATT-FRACTAL: Interactive Dual-Layer 60fps Canvas Engine
 * Combines Generative Kaleidoscope & Brush, Sacred Asiri Mandala & Hilbert Fractal,
 * Pigment Dust Particles, 3D Gypsum Emboss Lighting, 4K PNG & CNC Vector SVG Export.
 *
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

import { MaqamAudioEngine } from './audio';
import {
  fractalMandalaToSVG,
  generateHilbertPoints,
  HilbertPoint,
  renderFractalMandala,
} from './hilbert';
import {
  MotifId,
  MotifStamp,
  motifStampToSVG,
  renderMotifStamp2D,
} from './motifs';
import { PALETTES, PaletteId, PigmentPalette } from './palettes';

export type AtelierMode = 'kaleidoscope' | 'fractal_mandala';

export interface TelemetrySnapshot {
  fps: number;
  entityCount: number;
  symmetryFolds: number;
  mode: AtelierMode;
  strokeCount: number;
  particleCount: number;
}

interface PigmentParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class QattAtelierEngine {
  private artCanvas: HTMLCanvasElement;
  private fxCanvas: HTMLCanvasElement;
  private artCtx: CanvasRenderingContext2D;
  private fxCtx: CanvasRenderingContext2D;
  private audio: MaqamAudioEngine;

  private width = 960;
  private height = 640;
  private dpr = 1;

  // State parameters
  private mode: AtelierMode = 'kaleidoscope';
  private motif: MotifId = 'banat';
  private paletteId: PaletteId = 'asiri_natural';
  private symmetryFolds = 8;
  private mirrorSymmetry = true;
  private brushSize = 26;
  private embossRelief = true;
  private plasterTextureEnabled = true;
  private showGuides = true;
  private autoWeave = false;

  // Fractal mode parameters
  private hilbertOrder = 4;
  private goldenPulseSpeed = 1.0;
  private hilbertPoints: HilbertPoint[] = generateHilbertPoints(4);

  // Drawing & Undo history
  private stamps: MotifStamp[] = [];
  private strokeHistoryStarts: number[] = [];
  private isDrawing = false;
  private lastDrawX = 0;
  private lastDrawY = 0;
  private colorCycleIdx = 0;

  // Auto-Weave bot state
  private weaveTime = 0;
  private lastWeaveStampTime = 0;

  // Kinetic particles & pointer
  private particles: PigmentParticle[] = [];
  private pointerX = 0;
  private pointerY = 0;
  private pointerActive = false;

  // Plaster offscreen tile
  private plasterDarkTile: HTMLCanvasElement;
  private plasterLightTile: HTMLCanvasElement;

  // Animation loop & FPS telemetry
  private rafId = 0;
  private startTime = performance.now();
  private lastFrameTime = performance.now();
  private frameCounter = 0;
  private fpsAccumTime = 0;
  private currentFps = 60;
  private onTelemetry?: (snap: TelemetrySnapshot) => void;
  private artNeedsRedraw = true;

  constructor(
    artCanvas: HTMLCanvasElement,
    fxCanvas: HTMLCanvasElement,
    audio: MaqamAudioEngine,
    onTelemetry?: (snap: TelemetrySnapshot) => void
  ) {
    this.artCanvas = artCanvas;
    this.fxCanvas = fxCanvas;
    const aCtx = artCanvas.getContext('2d');
    const fCtx = fxCanvas.getContext('2d');
    if (!aCtx || !fCtx) {
      throw new Error('2D Canvas context unavailable');
    }
    this.artCtx = aCtx;
    this.fxCtx = fCtx;
    this.audio = audio;
    this.onTelemetry = onTelemetry;

    this.plasterDarkTile = this.createGypsumPlasterTile(false);
    this.plasterLightTile = this.createGypsumPlasterTile(true);

    this.bindPointerEvents();
    this.resize();
    this.seedInitialAtelierComposition();
    this.startLoop();
  }

  public get palette(): PigmentPalette {
    return PALETTES[this.paletteId];
  }

  public getMode(): AtelierMode {
    return this.mode;
  }

  public setMode(mode: AtelierMode): void {
    this.mode = mode;
    this.artNeedsRedraw = true;
    this.emitTelemetry();
  }

  public setMotif(motif: MotifId): void {
    this.motif = motif;
  }

  public setPalette(id: PaletteId): void {
    this.paletteId = id;
    this.artNeedsRedraw = true;
  }

  public setSymmetryFolds(folds: number): void {
    this.symmetryFolds = folds;
    this.emitTelemetry();
  }

  public setMirrorSymmetry(mirror: boolean): void {
    this.mirrorSymmetry = mirror;
  }

  public setBrushSize(size: number): void {
    this.brushSize = Math.max(10, Math.min(64, size));
  }

  public setEmbossRelief(enabled: boolean): void {
    this.embossRelief = enabled;
    // Update existing stamps or keep per-stamp? Updating future + redraw looks cohesive
    this.stamps.forEach((s) => {
      s.emboss = enabled;
    });
    this.artNeedsRedraw = true;
  }

  public setPlasterTexture(enabled: boolean): void {
    this.plasterTextureEnabled = enabled;
    this.artNeedsRedraw = true;
  }

  public setShowGuides(enabled: boolean): void {
    this.showGuides = enabled;
  }

  public setAutoWeave(enabled: boolean): void {
    this.autoWeave = enabled;
    if (enabled && this.mode === 'kaleidoscope') {
      this.strokeHistoryStarts.push(this.stamps.length);
    }
  }

  public isAutoWeaveEnabled(): boolean {
    return this.autoWeave;
  }

  public setHilbertOrder(order: number): void {
    this.hilbertOrder = Math.max(2, Math.min(5, Math.floor(order)));
    this.hilbertPoints = generateHilbertPoints(this.hilbertOrder);
    this.emitTelemetry();
  }

  public setGoldenPulseSpeed(speed: number): void {
    this.goldenPulseSpeed = Math.max(0.2, Math.min(2.5, speed));
  }

  public undo(): void {
    if (this.mode !== 'kaleidoscope') return;
    if (this.strokeHistoryStarts.length > 0) {
      const startIdx = this.strokeHistoryStarts.pop()!;
      this.stamps.splice(startIdx);
    } else if (this.stamps.length > 0) {
      this.stamps.pop();
    }
    this.artNeedsRedraw = true;
    this.emitTelemetry();
  }

  public clear(): void {
    this.stamps = [];
    this.strokeHistoryStarts = [];
    this.particles = [];
    this.artNeedsRedraw = true;
    this.emitTelemetry();
  }

  public resize(): void {
    const parent = this.artCanvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    this.width = Math.max(320, Math.floor(rect.width));
    this.height = Math.max(320, Math.floor(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (const canvas of [this.artCanvas, this.fxCanvas]) {
      canvas.width = Math.floor(this.width * this.dpr);
      canvas.height = Math.floor(this.height * this.dpr);
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
    }

    this.artCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fxCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.artNeedsRedraw = true;
  }

  /** Creates a seamless 160x160 procedural gypsum wall plaster grain texture */
  private createGypsumPlasterTile(lightMode: boolean): HTMLCanvasElement {
    const tile = document.createElement('canvas');
    tile.width = 160;
    tile.height = 160;
    const ctx = tile.getContext('2d')!;
    const img = ctx.createImageData(160, 160);
    const data = img.data;

    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 32;
      if (lightMode) {
        const base = 225 + grain;
        data[i] = Math.max(0, Math.min(255, base));
        data[i + 1] = Math.max(0, Math.min(255, base - 6));
        data[i + 2] = Math.max(0, Math.min(255, base - 16));
        data[i + 3] = 28;
      } else {
        const base = 180 + grain;
        data[i] = Math.max(0, Math.min(255, base));
        data[i + 1] = Math.max(0, Math.min(255, base));
        data[i + 2] = Math.max(0, Math.min(255, base + 8));
        data[i + 3] = 18;
      }
    }
    ctx.putImageData(img, 0, 0);
    return tile;
  }

  /** Seed an authentic starter Qatt Al-Asiri rosette so the studio opens with beauty */
  private seedInitialAtelierComposition(): void {
    const pal = this.palette;
    const starter: Array<{
      motif: MotifId;
      r: number;
      size: number;
      angleOffset: number;
      cIdx: number;
    }> = [
      { motif: 'balsana', r: 46, size: 18, angleOffset: 0, cIdx: 2 },
      { motif: 'banat', r: 108, size: 24, angleOffset: Math.PI / 2, cIdx: 1 },
      { motif: 'maharib', r: 168, size: 22, angleOffset: Math.PI / 2, cIdx: 0 },
    ];

    this.strokeHistoryStarts.push(0);
    for (const item of starter) {
      this.stamps.push({
        motif: item.motif,
        x: item.r,
        y: 0,
        angle: item.angleOffset,
        size: item.size,
        primaryColor: pal.pigments[item.cIdx % pal.pigments.length],
        secondaryColor: pal.pigments[(item.cIdx + 2) % pal.pigments.length],
        accentColor: pal.gypsumWhite,
        lineColor: pal.charcoalLine,
        symmetryFolds: this.symmetryFolds,
        mirror: this.mirrorSymmetry,
        emboss: this.embossRelief,
      });
    }
    this.artNeedsRedraw = true;
  }

  private bindPointerEvents(): void {
    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = this.fxCanvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    this.fxCanvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.audio.unlock();
      this.fxCanvas.setPointerCapture(e.pointerId);
      const [px, py] = toLocal(e);
      this.pointerX = px;
      this.pointerY = py;
      this.pointerActive = true;

      if (this.mode === 'kaleidoscope') {
        this.isDrawing = true;
        this.strokeHistoryStarts.push(this.stamps.length);
        this.lastDrawX = px;
        this.lastDrawY = py;
        this.placeBrushStamp(px, py, 0);
      } else {
        // Fractal mode click triggers resonant burst & Maqam chime
        this.spawnRadialParticles(px, py, 14);
        const normPitch = 1 - py / Math.max(1, this.height);
        const pan = (px / Math.max(1, this.width)) * 2 - 1;
        this.audio.triggerGeometryNote(normPitch, pan, 0.78);
      }
    });

    this.fxCanvas.addEventListener('pointermove', (e: PointerEvent) => {
      const [px, py] = toLocal(e);
      this.pointerX = px;
      this.pointerY = py;
      this.pointerActive = true;

      if (this.mode === 'kaleidoscope' && this.isDrawing) {
        const dx = px - this.lastDrawX;
        const dy = py - this.lastDrawY;
        const dist = Math.hypot(dx, dy);
        const spacing = Math.max(14, this.brushSize * 0.85);
        if (dist >= spacing) {
          const moveAngle = Math.atan2(dy, dx);
          this.placeBrushStamp(px, py, moveAngle);
          this.lastDrawX = px;
          this.lastDrawY = py;
        }
      } else if (this.mode === 'fractal_mandala' && Math.random() < 0.25) {
        this.spawnRadialParticles(px, py, 1);
      }
    });

    const endDraw = () => {
      this.isDrawing = false;
    };
    this.fxCanvas.addEventListener('pointerup', endDraw);
    this.fxCanvas.addEventListener('pointercancel', endDraw);
    this.fxCanvas.addEventListener('pointerleave', () => {
      this.isDrawing = false;
      this.pointerActive = false;
    });
  }

  private placeBrushStamp(px: number, py: number, moveAngle: number): void {
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const rx = px - cx;
    const ry = py - cy;
    const radialAngle = Math.atan2(ry, rx);
    const pal = this.palette;

    const pIdx = this.colorCycleIdx % pal.pigments.length;
    const sIdx = (this.colorCycleIdx + 2) % pal.pigments.length;
    const aIdx = (this.colorCycleIdx + 3) % pal.pigments.length;
    this.colorCycleIdx++;

    const angle =
      this.motif === 'misht'
        ? radialAngle + Math.PI * 0.5
        : moveAngle !== 0
          ? moveAngle + Math.PI * 0.5
          : radialAngle + Math.PI * 0.5;

    const stamp: MotifStamp = {
      motif: this.motif,
      x: rx,
      y: ry,
      angle,
      size: this.brushSize,
      primaryColor: pal.pigments[pIdx],
      secondaryColor: pal.pigments[sIdx],
      accentColor: pal.isLightSurface ? pal.pigments[aIdx] : pal.gypsumWhite,
      lineColor: pal.charcoalLine,
      symmetryFolds: this.symmetryFolds,
      mirror: this.mirrorSymmetry,
      emboss: this.embossRelief,
    };

    this.stamps.push(stamp);
    // Render new stamp immediately onto persistent art canvas
    renderMotifStamp2D(this.artCtx, stamp, cx, cy, 1);

    // Spawn symmetrical pigment dust particles
    this.spawnSymmetricalParticles(rx, ry, stamp.primaryColor, stamp.symmetryFolds);

    // Musical feedback mapped to radial distance & horizontal pan
    const maxR = Math.min(this.width, this.height) * 0.5;
    const normPitch = 1 - Math.min(1, Math.hypot(rx, ry) / Math.max(1, maxR));
    const pan = rx / Math.max(1, cx);
    this.audio.triggerGeometryNote(normPitch, pan, 0.68);
  }

  private spawnRadialParticles(x: number, y: number, count: number): void {
    const pal = this.palette;
    for (let i = 0; i < count; i++) {
      if (this.particles.length > 420) this.particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.9;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.4 + Math.random() * 2.8,
        color: pal.pigments[Math.floor(Math.random() * pal.pigments.length)],
        alpha: 0.9,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.9,
      });
    }
  }

  private spawnSymmetricalParticles(
    rx: number,
    ry: number,
    color: string,
    folds: number
  ): void {
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const step = (Math.PI * 2) / folds;
    const baseAngle = Math.atan2(ry, rx);
    const radius = Math.hypot(rx, ry);

    for (let i = 0; i < folds; i++) {
      if (this.particles.length > 420) this.particles.shift();
      const theta = baseAngle + i * step;
      const px = cx + Math.cos(theta) * radius;
      const py = cy + Math.sin(theta) * radius;
      const driftAngle = theta + (Math.random() - 0.5) * 1.4;
      const speed = 0.35 + Math.random() * 1.25;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(driftAngle) * speed,
        vy: Math.sin(driftAngle) * speed,
        size: 1.5 + Math.random() * 2.4,
        color,
        alpha: 0.85,
        life: 0,
        maxLife: 0.85 + Math.random() * 0.75,
      });
    }
  }

  private drawPlasterBackdrop(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ): void {
    const pal = this.palette;
    const grad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      20,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.72
    );
    grad.addColorStop(0, pal.canvasBgSecondary);
    grad.addColorStop(1, pal.canvasBg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (this.plasterTextureEnabled) {
      const tile = pal.isLightSurface ? this.plasterLightTile : this.plasterDarkTile;
      const pattern = ctx.createPattern(tile, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }
  }

  private redrawArtLayer(): void {
    this.artCtx.clearRect(0, 0, this.width, this.height);
    this.drawPlasterBackdrop(this.artCtx, this.width, this.height);

    if (this.mode === 'kaleidoscope') {
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      for (const stamp of this.stamps) {
        renderMotifStamp2D(this.artCtx, stamp, cx, cy, 1);
      }
    }
    this.artNeedsRedraw = false;
  }

  private stepAutoWeave(nowSec: number): void {
    if (!this.autoWeave || this.mode !== 'kaleidoscope') return;
    if (nowSec - this.lastWeaveStampTime < 0.12) return;
    this.lastWeaveStampTime = nowSec;
    this.weaveTime += 0.14;

    // Rose curve harmonic path for automated Asiri weaving
    const maxR = Math.min(this.width, this.height) * 0.39;
    const k = (this.symmetryFolds % 3) + 2;
    const r = maxR * (0.28 + 0.62 * Math.abs(Math.cos(k * this.weaveTime * 0.45)));
    const theta = this.weaveTime * 0.65;
    const px = this.width * 0.5 + Math.cos(theta) * r;
    const py = this.height * 0.5 + Math.sin(theta) * r;

    // Cycle motif gently every ~18 stamps
    const motifOrder: MotifId[] = ['banat', 'misht', 'maharib', 'balsana'];
    if (this.colorCycleIdx % 18 === 0) {
      const nextMotif = motifOrder[Math.floor(this.colorCycleIdx / 18) % motifOrder.length];
      this.motif = nextMotif;
    }

    this.placeBrushStamp(px, py, theta + Math.PI * 0.5);

    // Prevent unbounded growth during long auto-weave sessions
    if (this.stamps.length > 260) {
      this.stamps.shift();
      this.artNeedsRedraw = true;
    }
  }

  private updateAndDrawParticles(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Subtle curl-like swirling drift
      const swirl = Math.sin(p.life * 6 + p.x * 0.02) * 0.18;
      p.vx += swirl * dt * 12;
      p.vy -= 0.12 * dt * 10;
      p.x += p.vx;
      p.y += p.vy;

      const progress = p.life / p.maxLife;
      const alpha = (1 - progress) * p.alpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawSymmetryGuides(ctx: CanvasRenderingContext2D): void {
    if (!this.showGuides || this.mode !== 'kaleidoscope') return;
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const maxR = Math.min(this.width, this.height) * 0.46;
    const pal = this.palette;

    ctx.save();
    ctx.strokeStyle = pal.isLightSurface
      ? 'rgba(28, 25, 23, 0.14)'
      : 'rgba(248, 250, 252, 0.11)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    // Concentric Qatt proportion circles
    for (const frac of [0.32, 0.62, 0.94]) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial fold axes
    const step = (Math.PI * 2) / this.symmetryFolds;
    for (let i = 0; i < this.symmetryFolds; i++) {
      const a = i * step;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.stroke();
    }
    ctx.restore();
  }

  private startLoop(): void {
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      const elapsedSec = (now - this.startTime) / 1000;

      // FPS counter
      this.frameCounter++;
      this.fpsAccumTime += dt;
      if (this.fpsAccumTime >= 0.35) {
        this.currentFps = Math.round(this.frameCounter / this.fpsAccumTime);
        this.frameCounter = 0;
        this.fpsAccumTime = 0;
        this.emitTelemetry();
      }

      if (this.artNeedsRedraw) {
        this.redrawArtLayer();
      }

      if (this.mode === 'kaleidoscope') {
        this.stepAutoWeave(elapsedSec);
      }

      // Render FX kinetic canvas
      this.fxCtx.clearRect(0, 0, this.width, this.height);

      if (this.mode === 'kaleidoscope') {
        this.drawSymmetryGuides(this.fxCtx);
      } else {
        renderFractalMandala(
          this.fxCtx,
          {
            width: this.width,
            height: this.height,
            time: elapsedSec,
            symmetryFolds: this.symmetryFolds,
            hilbertOrder: this.hilbertOrder,
            goldenPulse: this.goldenPulseSpeed,
            pointerX: this.pointerX,
            pointerY: this.pointerY,
            pointerActive: this.pointerActive,
            pigments: this.palette.pigments,
            gypsumWhite: this.palette.gypsumWhite,
            charcoalLine: this.palette.charcoalLine,
            emboss: this.embossRelief,
          },
          this.hilbertPoints
        );
      }

      this.updateAndDrawParticles(this.fxCtx, dt);
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private emitTelemetry(): void {
    if (!this.onTelemetry) return;
    const entityCount =
      this.mode === 'kaleidoscope'
        ? this.stamps.length * this.symmetryFolds * (this.mirrorSymmetry ? 2 : 1) +
          this.particles.length
        : this.hilbertPoints.length + this.symmetryFolds * 12 + this.particles.length;

    this.onTelemetry({
      fps: this.currentFps,
      entityCount,
      symmetryFolds: this.symmetryFolds,
      mode: this.mode,
      strokeCount: this.stamps.length,
      particleCount: this.particles.length,
    });
  }

  /** Export Ultra-HD 4K PNG (3840px wide, aspect-preserving) */
  public export4KPng(): void {
    const outW = 3840;
    const outH = Math.round((this.height / Math.max(1, this.width)) * outW);
    const scale = outW / Math.max(1, this.width);

    const off = document.createElement('canvas');
    off.width = outW;
    off.height = outH;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    this.drawPlasterBackdrop(ctx, outW, outH);

    if (this.mode === 'kaleidoscope') {
      const cx = outW * 0.5;
      const cy = outH * 0.5;
      for (const stamp of this.stamps) {
        renderMotifStamp2D(ctx, stamp, cx, cy, scale);
      }
    } else {
      const elapsedSec = (performance.now() - this.startTime) / 1000;
      renderFractalMandala(
        ctx,
        {
          width: outW,
          height: outH,
          time: elapsedSec,
          symmetryFolds: this.symmetryFolds,
          hilbertOrder: this.hilbertOrder,
          goldenPulse: this.goldenPulseSpeed,
          pointerX: outW * 0.5,
          pointerY: outH * 0.5,
          pointerActive: false,
          pigments: this.palette.pigments,
          gypsumWhite: this.palette.gypsumWhite,
          charcoalLine: this.palette.charcoalLine,
          emboss: this.embossRelief,
        },
        this.hilbertPoints
      );
    }

    // Subtle architect signature watermark at bottom corner
    ctx.save();
    ctx.font = '600 34px "Outfit", sans-serif';
    ctx.fillStyle = this.palette.isLightSurface
      ? 'rgba(28, 25, 23, 0.55)'
      : 'rgba(248, 250, 252, 0.55)';
    ctx.textAlign = 'right';
    ctx.fillText(
      'QATT-FRACTAL • أ. طارق ابوعشي | Tareq Abuashi',
      outW - 64,
      outH - 52
    );
    ctx.restore();

    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qatt-fractal-4k-${this.mode}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  /** Export clean CNC-ready Vector SVG */
  public exportVectorSVG(): void {
    const w = this.width;
    const h = this.height;
    const pal = this.palette;

    let bodySvg = '';
    if (this.mode === 'kaleidoscope') {
      const cx = w * 0.5;
      const cy = h * 0.5;
      bodySvg = this.stamps.map((s) => motifStampToSVG(s, cx, cy)).join('\n  ');
    } else {
      bodySvg = fractalMandalaToSVG(
        w,
        h,
        this.symmetryFolds,
        this.hilbertPoints,
        pal.pigments,
        pal.gypsumWhite
      );
    }

    const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <title>QATT-FRACTAL Generative Asiri Geometry — أ. طارق ابوعشي | Tareq Abuashi</title>
  <rect width="${w}" height="${h}" fill="${pal.canvasBg}" />
  <g id="qatt-asiri-geometry">
  ${bodySvg}
  </g>
</svg>`;

    const blob = new Blob([svgDoc], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qatt-fractal-cnc-${this.mode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public destroy(): void {
    cancelAnimationFrame(this.rafId);
  }
}
