/**
 * Sacred Asiri Mandala (Golden Ratio Phi = 1.618) & Hilbert Space-Filling Fractal Generator
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export const PHI = (1 + Math.sqrt(5)) / 2; // 1.61803398875
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.507764 deg

export interface HilbertPoint {
  x: number; // normalized -0.5 .. 0.5
  y: number; // normalized -0.5 .. 0.5
}

/**
 * Iterative bitwise Hilbert curve mapping from index d in [0, N*N) to (x, y) in [0, N).
 * Fast O(order) per point with zero recursion overhead.
 */
function d2xy(n: number, d: number): [number, number] {
  let rx: number;
  let ry: number;
  let s: number;
  let t = d;
  let x = 0;
  let y = 0;

  for (s = 1; s < n; s *= 2) {
    rx = 1 & (t >> 1);
    ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const tmp = x;
      x = y;
      y = tmp;
    }
    x += s * rx;
    y += s * ry;
    t = t >> 2;
  }
  return [x, y];
}

export function generateHilbertPoints(order: number): HilbertPoint[] {
  const clampedOrder = Math.max(1, Math.min(5, Math.floor(order)));
  const n = 1 << clampedOrder;
  const total = n * n;
  const pts: HilbertPoint[] = new Array(total);
  const inv = n > 1 ? 1 / (n - 1) : 1;

  for (let d = 0; d < total; d++) {
    const [gx, gy] = d2xy(n, d);
    pts[d] = {
      x: gx * inv - 0.5,
      y: gy * inv - 0.5,
    };
  }
  return pts;
}

export interface FractalRenderParams {
  width: number;
  height: number;
  time: number;
  symmetryFolds: number;
  hilbertOrder: number;
  goldenPulse: number;
  pointerX: number; // canvas coords
  pointerY: number;
  pointerActive: boolean;
  pigments: string[];
  gypsumWhite: string;
  charcoalLine: string;
  emboss: boolean;
}

/**
 * Computes pointer repulsion displacement in 2D space.
 */
function applyRepulsion(
  px: number,
  py: number,
  mx: number,
  my: number,
  active: boolean,
  strength = 1800,
  maxDist = 175
): [number, number] {
  if (!active) return [px, py];
  const dx = px - mx;
  const dy = py - my;
  const distSq = dx * dx + dy * dy;
  if (distSq > maxDist * maxDist || distSq < 1) return [px, py];
  const dist = Math.sqrt(distSq);
  const falloff = (1 - dist / maxDist) * (1 - dist / maxDist);
  const push = (strength / (dist + 28)) * falloff;
  return [px + (dx / dist) * push, py + (dy / dist) * push];
}

/**
 * Renders Mode 2: Multi-layered Sacred Asiri Mandala (Golden Ratio Phi) + Hilbert Fractal Tessellation
 * with interactive pointer Parallax & Repulsion Field.
 */
export function renderFractalMandala(
  ctx: CanvasRenderingContext2D,
  params: FractalRenderParams,
  hilbertPoints: HilbertPoint[]
): void {
  const {
    width,
    height,
    time,
    symmetryFolds,
    goldenPulse,
    pointerX,
    pointerY,
    pointerActive,
    pigments,
    gypsumWhite,
    charcoalLine,
    emboss,
  } = params;

  const cx = width * 0.5;
  const cy = height * 0.5;
  const minDim = Math.min(width, height);
  const maxRadius = minDim * 0.43;

  // Parallax offset from pointer position
  const parallaxX = pointerActive ? ((pointerX - cx) / Math.max(1, cx)) * 22 : Math.sin(time * 0.35) * 6;
  const parallaxY = pointerActive ? ((pointerY - cy) / Math.max(1, cy)) * 22 : Math.cos(time * 0.28) * 6;

  // 1. Background Sacred Golden-Ratio Rings & Star Lattice (Parallax depth 0.35)
  ctx.save();
  ctx.translate(cx + parallaxX * 0.35, cy + parallaxY * 0.35);
  const rings = 5;
  for (let rIdx = rings; rIdx >= 1; rIdx--) {
    const ratio = Math.pow(1 / PHI, rIdx - 1);
    const breath = 1 + 0.045 * Math.sin(time * 1.4 * goldenPulse + rIdx * PHI);
    const radius = maxRadius * ratio * breath;
    const rot = time * (rIdx % 2 === 0 ? 0.14 : -0.11) * (1 + rIdx * 0.12);
    const color = pigments[(rIdx - 1) % pigments.length];

    ctx.save();
    ctx.rotate(rot);

    // Outer Qatt polygonal boundary
    ctx.beginPath();
    const steps = symmetryFolds * 2;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const waveR = i % 2 === 0 ? radius : radius * (1 - 0.16 / Math.sqrt(rIdx));
      const vx = Math.cos(a) * waveR;
      const vy = Math.sin(a) * waveR;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, 3.2 - rIdx * 0.4);
    ctx.globalAlpha = 0.55;
    ctx.stroke();

    // Inner Asiri triangle/diamond tessellation teeth
    const toothStep = (Math.PI * 2) / symmetryFolds;
    for (let f = 0; f < symmetryFolds; f++) {
      const a0 = f * toothStep;
      const aMid = a0 + toothStep * 0.5;
      const rInner = radius * 0.72;
      const rTip = radius * 0.96;

      const x1 = Math.cos(a0) * rInner;
      const y1 = Math.sin(a0) * rInner;
      const xTip = Math.cos(aMid) * rTip;
      const yTip = Math.sin(aMid) * rTip;
      const x2 = Math.cos(a0 + toothStep) * rInner;
      const y2 = Math.sin(a0 + toothStep) * rInner;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(xTip, yTip);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.16;
      ctx.fill();
      ctx.strokeStyle = gypsumWhite;
      ctx.lineWidth = 0.85;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
    }

    ctx.restore();
  }
  ctx.restore();

  // 2. Hilbert Space-Filling Fractal Tessellation (Parallax depth 0.75 + Repulsion Field)
  if (hilbertPoints.length > 1) {
    const hilbertScale = minDim * 0.52 * (1 + 0.03 * Math.sin(time * 1.1));
    const hCenterX = cx + parallaxX * 0.75;
    const hCenterY = cy + parallaxY * 0.75;
    const hRot = time * 0.08;
    const cosR = Math.cos(hRot);
    const sinR = Math.sin(hRot);

    ctx.save();
    if (emboss) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    const segCount = hilbertPoints.length - 1;
    const chunkSize = Math.max(4, Math.floor(segCount / pigments.length));

    for (let start = 0; start < segCount; start += chunkSize) {
      const end = Math.min(segCount, start + chunkSize);
      const colorIdx = Math.floor((start / segCount) * pigments.length) % pigments.length;
      ctx.beginPath();

      for (let i = start; i <= end; i++) {
        const pt = hilbertPoints[i];
        const rx = (pt.x * cosR - pt.y * sinR) * hilbertScale;
        const ry = (pt.x * sinR + pt.y * cosR) * hilbertScale;
        const [fx, fy] = applyRepulsion(
          hCenterX + rx,
          hCenterY + ry,
          pointerX,
          pointerY,
          pointerActive,
          2100,
          170
        );
        if (i === start) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }

      ctx.strokeStyle = pigments[colorIdx];
      ctx.lineWidth = Math.max(1.3, 3.2 - hilbertPoints.length / 360);
      ctx.globalAlpha = 0.82;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Animated traveling energy pulse along Hilbert path
    const pulseProgress = ((time * 0.16) % 1) * segCount;
    const pulseIdx = Math.floor(pulseProgress);
    const pPt = hilbertPoints[pulseIdx];
    const pRx = (pPt.x * cosR - pPt.y * sinR) * hilbertScale;
    const pRy = (pPt.x * sinR + pPt.y * cosR) * hilbertScale;
    const [pFx, pFy] = applyRepulsion(
      hCenterX + pRx,
      hCenterY + pRy,
      pointerX,
      pointerY,
      pointerActive,
      2100,
      170
    );

    ctx.beginPath();
    ctx.arc(pFx, pFy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = gypsumWhite;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.restore();
  }

  // 3. Golden-Angle Phyllotaxis Asiri Diamond Nodes (Parallax depth 1.15 + Repulsion)
  const nodeCount = Math.min(89, symmetryFolds * 7); // Fibonacci-inspired count
  const nodeCx = cx + parallaxX * 1.15;
  const nodeCy = cy + parallaxY * 1.15;

  ctx.save();
  for (let n = 1; n <= nodeCount; n++) {
    const frac = n / nodeCount;
    const r = Math.sqrt(frac) * maxRadius * 0.94;
    const theta = n * GOLDEN_ANGLE + time * 0.22;
    const rawX = nodeCx + Math.cos(theta) * r;
    const rawY = nodeCy + Math.sin(theta) * r;
    const [nx, ny] = applyRepulsion(rawX, rawY, pointerX, pointerY, pointerActive, 2400, 180);

    const pulse = 0.75 + 0.35 * Math.sin(time * 2.4 - frac * Math.PI * 2);
    const dSize = (3.5 + (1 - frac) * 6.5) * pulse;
    const color = pigments[n % pigments.length];

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(theta + Math.PI * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -dSize);
    ctx.lineTo(dSize * 0.72, 0);
    ctx.lineTo(0, dSize);
    ctx.lineTo(-dSize * 0.72, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.88;
    ctx.fill();
    ctx.strokeStyle = charcoalLine;
    ctx.lineWidth = 0.9;
    ctx.globalAlpha = 0.65;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Generates clean CNC-ready SVG markup for the Sacred Mandala + Hilbert Fractal mode.
 */
export function fractalMandalaToSVG(
  width: number,
  height: number,
  symmetryFolds: number,
  hilbertPoints: HilbertPoint[],
  pigments: string[],
  gypsumWhite: string
): string {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const minDim = Math.min(width, height);
  const maxRadius = minDim * 0.43;
  const parts: string[] = [];

  // Sacred Golden-Ratio Mandala rings
  for (let rIdx = 5; rIdx >= 1; rIdx--) {
    const radius = maxRadius * Math.pow(1 / PHI, rIdx - 1);
    const color = pigments[(rIdx - 1) % pigments.length];
    const steps = symmetryFolds * 2;
    const polyPts: string[] = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const waveR = i % 2 === 0 ? radius : radius * (1 - 0.16 / Math.sqrt(rIdx));
      polyPts.push(`${(cx + Math.cos(a) * waveR).toFixed(2)},${(cy + Math.sin(a) * waveR).toFixed(2)}`);
    }
    parts.push(
      `<polygon points="${polyPts.join(' ')}" fill="none" stroke="${color}" stroke-width="${Math.max(1.2, 3.2 - rIdx * 0.4).toFixed(2)}" opacity="0.65"/>`
    );

    const toothStep = (Math.PI * 2) / symmetryFolds;
    for (let f = 0; f < symmetryFolds; f++) {
      const a0 = f * toothStep;
      const aMid = a0 + toothStep * 0.5;
      const rInner = radius * 0.72;
      const rTip = radius * 0.96;
      const pts = [
        `${(cx + Math.cos(a0) * rInner).toFixed(2)},${(cy + Math.sin(a0) * rInner).toFixed(2)}`,
        `${(cx + Math.cos(aMid) * rTip).toFixed(2)},${(cy + Math.sin(aMid) * rTip).toFixed(2)}`,
        `${(cx + Math.cos(a0 + toothStep) * rInner).toFixed(2)},${(cy + Math.sin(a0 + toothStep) * rInner).toFixed(2)}`,
      ].join(' ');
      parts.push(
        `<polygon points="${pts}" fill="${color}" fill-opacity="0.18" stroke="${gypsumWhite}" stroke-opacity="0.4" stroke-width="0.9"/>`
      );
    }
  }

  // Hilbert curve path segments
  if (hilbertPoints.length > 1) {
    const hilbertScale = minDim * 0.52;
    const segCount = hilbertPoints.length - 1;
    const chunkSize = Math.max(4, Math.floor(segCount / pigments.length));
    for (let start = 0; start < segCount; start += chunkSize) {
      const end = Math.min(segCount, start + chunkSize);
      const color = pigments[Math.floor((start / segCount) * pigments.length) % pigments.length];
      let dAttr = '';
      for (let i = start; i <= end; i++) {
        const pt = hilbertPoints[i];
        const x = (cx + pt.x * hilbertScale).toFixed(2);
        const y = (cy + pt.y * hilbertScale).toFixed(2);
        dAttr += i === start ? `M${x} ${y}` : ` L${x} ${y}`;
      }
      parts.push(
        `<path d="${dAttr}" fill="none" stroke="${color}" stroke-width="${Math.max(1.3, 3.2 - hilbertPoints.length / 360).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`
      );
    }
  }

  // Golden-angle diamond nodes
  const nodeCount = Math.min(89, symmetryFolds * 7);
  for (let n = 1; n <= nodeCount; n++) {
    const frac = n / nodeCount;
    const r = Math.sqrt(frac) * maxRadius * 0.94;
    const theta = n * GOLDEN_ANGLE;
    const nx = cx + Math.cos(theta) * r;
    const ny = cy + Math.sin(theta) * r;
    const dSize = 3.5 + (1 - frac) * 6.5;
    const color = pigments[n % pigments.length];
    const deg = ((theta + Math.PI * 0.25) * 180) / Math.PI;
    parts.push(
      `<polygon points="0,${(-dSize).toFixed(2)} ${(dSize * 0.72).toFixed(2)},0 0,${dSize.toFixed(2)} ${(-dSize * 0.72).toFixed(2)},0" fill="${color}" transform="translate(${nx.toFixed(2)} ${ny.toFixed(2)}) rotate(${deg.toFixed(2)})"/>`
    );
  }

  return parts.join('');
}
