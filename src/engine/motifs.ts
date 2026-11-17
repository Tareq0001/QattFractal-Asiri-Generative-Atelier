/**
 * Authentic Qatt Al-Asiri Vector Motif Engine & 3D Gypsum Relief Renderer
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export type MotifId = 'banat' | 'misht' | 'maharib' | 'balsana';

export interface MotifInfo {
  id: MotifId;
  nameAr: string;
  nameEn: string;
  subtitle: string;
}

export const MOTIFS: Record<MotifId, MotifInfo> = {
  banat: {
    id: 'banat',
    nameAr: 'البنات',
    nameEn: 'Al-Banat (Maidens)',
    subtitle: 'Triangular Maiden Motifs',
  },
  misht: {
    id: 'misht',
    nameAr: 'المشط',
    nameEn: 'Al-Misht (Comb)',
    subtitle: 'Comb Zigzags & Teeth',
  },
  maharib: {
    id: 'maharib',
    nameAr: 'المحاريب',
    nameEn: 'Al-Maharib (Arches)',
    subtitle: 'Sacred Stepped Arches',
  },
  balsana: {
    id: 'balsana',
    nameAr: 'البلسنة',
    nameEn: 'Al-Balsana (Diamonds)',
    subtitle: 'Faceted Geometric Lozenges',
  },
};

export interface VectorShape {
  kind: 'polygon' | 'polyline' | 'circle';
  points?: Array<[number, number]>;
  cx?: number;
  cy?: number;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface MotifStamp {
  motif: MotifId;
  /** Offset from canvas center in normalized logical coordinates */
  x: number;
  y: number;
  angle: number;
  size: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lineColor: string;
  symmetryFolds: number;
  mirror: boolean;
  emboss: boolean;
}

/**
 * Generates normalized local vector primitives (centered at 0,0, scaled by `size`)
 * so both Canvas2D and CNC-ready SVG Export share exact geometry.
 */
export function buildMotifPrimitives(
  motif: MotifId,
  size: number,
  primary: string,
  secondary: string,
  accent: string,
  lineColor: string
): VectorShape[] {
  const s = size;
  const shapes: VectorShape[] = [];

  switch (motif) {
    case 'banat': {
      // Iconic Asiri Triangular Maiden ("Al-Banat") with nested inner triangle & crown
      shapes.push({
        kind: 'polygon',
        points: [
          [0, -s * 0.95],
          [s * 0.78, s * 0.65],
          [-s * 0.78, s * 0.65],
        ],
        fill: primary,
        stroke: lineColor,
        strokeWidth: Math.max(1.2, s * 0.09),
      });
      shapes.push({
        kind: 'polygon',
        points: [
          [0, -s * 0.52],
          [s * 0.44, s * 0.42],
          [-s * 0.44, s * 0.42],
        ],
        fill: secondary,
        stroke: accent,
        strokeWidth: Math.max(1, s * 0.06),
      });
      // Maiden headdress diamond + twin shoulder dots
      shapes.push({
        kind: 'polygon',
        points: [
          [0, -s * 1.18],
          [s * 0.16, -s * 0.98],
          [0, -s * 0.8],
          [-s * 0.16, -s * 0.98],
        ],
        fill: accent,
        stroke: lineColor,
        strokeWidth: Math.max(0.8, s * 0.05),
      });
      shapes.push(
        {
          kind: 'circle',
          cx: -s * 0.42,
          cy: s * 0.82,
          r: s * 0.1,
          fill: accent,
        },
        {
          kind: 'circle',
          cx: s * 0.42,
          cy: s * 0.82,
          r: s * 0.1,
          fill: accent,
        },
        {
          kind: 'circle',
          cx: 0,
          cy: s * 0.12,
          r: s * 0.11,
          fill: primary,
        }
      );
      break;
    }

    case 'misht': {
      // "Al-Misht" Comb Zigzag band with twin anchor rails
      const teeth = 4;
      const w = s * 1.45;
      const h = s * 0.52;
      const zigPts: Array<[number, number]> = [];
      for (let i = 0; i <= teeth * 2; i++) {
        const px = -w + (i / (teeth * 2)) * (w * 2);
        const py = i % 2 === 0 ? -h : h;
        zigPts.push([px, py]);
      }
      // Solid zigzag backing band
      shapes.push({
        kind: 'polygon',
        points: [
          [-w, -h * 1.18],
          [w, -h * 1.18],
          [w, h * 1.18],
          [-w, h * 1.18],
        ],
        fill: secondary,
        stroke: lineColor,
        strokeWidth: Math.max(1, s * 0.07),
        opacity: 0.92,
      });
      shapes.push({
        kind: 'polyline',
        points: zigPts,
        stroke: primary,
        strokeWidth: Math.max(2, s * 0.18),
      });
      // Comb spine & accent dots
      shapes.push({
        kind: 'polyline',
        points: [
          [-w, -h * 1.25],
          [w, -h * 1.25],
        ],
        stroke: accent,
        strokeWidth: Math.max(1.4, s * 0.1),
      });
      shapes.push({
        kind: 'polyline',
        points: [
          [-w, h * 1.25],
          [w, h * 1.25],
        ],
        stroke: accent,
        strokeWidth: Math.max(1.4, s * 0.1),
      });
      break;
    }

    case 'maharib': {
      // "Al-Maharib" Sacred Stepped Arches
      shapes.push({
        kind: 'polygon',
        points: [
          [-s * 0.72, s * 0.85],
          [-s * 0.72, -s * 0.1],
          [-s * 0.42, -s * 0.1],
          [-s * 0.42, -s * 0.5],
          [0, -s * 0.95],
          [s * 0.42, -s * 0.5],
          [s * 0.42, -s * 0.1],
          [s * 0.72, -s * 0.1],
          [s * 0.72, s * 0.85],
        ],
        fill: primary,
        stroke: lineColor,
        strokeWidth: Math.max(1.2, s * 0.09),
      });
      shapes.push({
        kind: 'polygon',
        points: [
          [-s * 0.36, s * 0.82],
          [-s * 0.36, -s * 0.12],
          [0, -s * 0.56],
          [s * 0.36, -s * 0.12],
          [s * 0.36, s * 0.82],
        ],
        fill: secondary,
        stroke: accent,
        strokeWidth: Math.max(1, s * 0.06),
      });
      shapes.push({
        kind: 'circle',
        cx: 0,
        cy: -s * 0.16,
        r: s * 0.12,
        fill: accent,
      });
      break;
    }

    case 'balsana': {
      // "Al-Balsana" Geometric Faceted Diamond Lozenge
      shapes.push({
        kind: 'polygon',
        points: [
          [0, -s],
          [s * 0.75, 0],
          [0, s],
          [-s * 0.75, 0],
        ],
        fill: primary,
        stroke: lineColor,
        strokeWidth: Math.max(1.2, s * 0.09),
      });
      shapes.push({
        kind: 'polygon',
        points: [
          [0, -s * 0.56],
          [s * 0.42, 0],
          [0, s * 0.56],
          [-s * 0.42, 0],
        ],
        fill: secondary,
        stroke: accent,
        strokeWidth: Math.max(1, s * 0.06),
      });
      shapes.push({
        kind: 'polyline',
        points: [
          [-s * 0.42, 0],
          [s * 0.42, 0],
        ],
        stroke: accent,
        strokeWidth: Math.max(1, s * 0.06),
      });
      shapes.push({
        kind: 'polyline',
        points: [
          [0, -s * 0.56],
          [0, s * 0.56],
        ],
        stroke: accent,
        strokeWidth: Math.max(1, s * 0.06),
      });
      shapes.push({
        kind: 'circle',
        cx: 0,
        cy: 0,
        r: s * 0.13,
        fill: accent,
      });
      break;
    }
  }

  return shapes;
}

/** Draw a single vector shape on Canvas2D */
function drawShape2D(ctx: CanvasRenderingContext2D, shape: VectorShape): void {
  ctx.save();
  if (shape.opacity !== undefined) {
    ctx.globalAlpha *= shape.opacity;
  }
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (shape.kind === 'polygon' && shape.points && shape.points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i][0], shape.points[i][1]);
    }
    ctx.closePath();
    if (shape.fill) {
      ctx.fillStyle = shape.fill;
      ctx.fill();
    }
    if (shape.stroke && shape.strokeWidth) {
      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  } else if (shape.kind === 'polyline' && shape.points && shape.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i][0], shape.points[i][1]);
    }
    if (shape.stroke && shape.strokeWidth) {
      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  } else if (
    shape.kind === 'circle' &&
    shape.cx !== undefined &&
    shape.cy !== undefined &&
    shape.r !== undefined
  ) {
    ctx.beginPath();
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    if (shape.fill) {
      ctx.fillStyle = shape.fill;
      ctx.fill();
    }
    if (shape.stroke && shape.strokeWidth) {
      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Render a full radially symmetric MotifStamp centered at (cx, cy) on Canvas2D,
 * with optional 3D Gypsum Bump / Emboss Relief Lighting.
 */
export function renderMotifStamp2D(
  ctx: CanvasRenderingContext2D,
  stamp: MotifStamp,
  centerX: number,
  centerY: number,
  scaleFactor = 1
): void {
  const primitives = buildMotifPrimitives(
    stamp.motif,
    stamp.size * scaleFactor,
    stamp.primaryColor,
    stamp.secondaryColor,
    stamp.accentColor,
    stamp.lineColor
  );

  const folds = stamp.symmetryFolds;
  const step = (Math.PI * 2) / folds;
  const lx = stamp.x * scaleFactor;
  const ly = stamp.y * scaleFactor;

  ctx.save();
  ctx.translate(centerX, centerY);

  for (let i = 0; i < folds; i++) {
    const theta = i * step;
    const branches = stamp.mirror ? [1, -1] : [1];

    for (const dir of branches) {
      ctx.save();
      ctx.rotate(theta);
      if (dir === -1) {
        ctx.scale(-1, 1);
      }
      ctx.translate(lx, ly);
      ctx.rotate(stamp.angle);

      if (stamp.emboss) {
        // 3D Carved Gypsum Wall Relief: soft drop shadow + top-left bevel highlight
        ctx.shadowColor = 'rgba(0, 0, 0, 0.52)';
        ctx.shadowBlur = Math.max(3, stamp.size * 0.22 * scaleFactor);
        ctx.shadowOffsetX = 2.2 * scaleFactor;
        ctx.shadowOffsetY = 2.6 * scaleFactor;

        // Top-left rim highlight pass
        ctx.save();
        ctx.translate(-1.1 * scaleFactor, -1.1 * scaleFactor);
        ctx.globalAlpha = 0.38;
        for (const sh of primitives) {
          drawShape2D(ctx, {
            ...sh,
            fill: sh.fill ? '#ffffff' : undefined,
            stroke: sh.stroke ? '#ffffff' : undefined,
          });
        }
        ctx.restore();
      }

      for (const sh of primitives) {
        drawShape2D(ctx, sh);
      }

      ctx.restore();
    }
  }

  ctx.restore();
}

/** Convert a MotifStamp into clean CNC-ready SVG <g> markup */
export function motifStampToSVG(
  stamp: MotifStamp,
  centerX: number,
  centerY: number
): string {
  const primitives = buildMotifPrimitives(
    stamp.motif,
    stamp.size,
    stamp.primaryColor,
    stamp.secondaryColor,
    stamp.accentColor,
    stamp.lineColor
  );

  const innerSvg = primitives
    .map((sh) => {
      const opacityAttr =
        sh.opacity !== undefined ? ` opacity="${sh.opacity.toFixed(2)}"` : '';
      if (sh.kind === 'polygon' && sh.points) {
        const pts = sh.points
          .map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`)
          .join(' ');
        const fill = sh.fill ?? 'none';
        const stroke = sh.stroke ?? 'none';
        const sw = sh.strokeWidth ? sh.strokeWidth.toFixed(2) : '0';
        return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"${opacityAttr}/>`;
      }
      if (sh.kind === 'polyline' && sh.points) {
        const pts = sh.points
          .map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`)
          .join(' ');
        const stroke = sh.stroke ?? 'none';
        const sw = sh.strokeWidth ? sh.strokeWidth.toFixed(2) : '1';
        return `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${opacityAttr}/>`;
      }
      if (
        sh.kind === 'circle' &&
        sh.cx !== undefined &&
        sh.cy !== undefined &&
        sh.r !== undefined
      ) {
        return `<circle cx="${sh.cx.toFixed(2)}" cy="${sh.cy.toFixed(2)}" r="${sh.r.toFixed(2)}" fill="${sh.fill ?? 'none'}"${opacityAttr}/>`;
      }
      return '';
    })
    .join('');

  const folds = stamp.symmetryFolds;
  const stepDeg = 360 / folds;
  const angleDeg = (stamp.angle * 180) / Math.PI;
  const groups: string[] = [];

  for (let i = 0; i < folds; i++) {
    const rotDeg = (i * stepDeg).toFixed(3);
    const branches = stamp.mirror ? [1, -1] : [1];
    for (const dir of branches) {
      const mirrorScale = dir === -1 ? ' scale(-1 1)' : '';
      const transform = `translate(${centerX.toFixed(2)} ${centerY.toFixed(2)}) rotate(${rotDeg})${mirrorScale} translate(${stamp.x.toFixed(2)} ${stamp.y.toFixed(2)}) rotate(${angleDeg.toFixed(2)})`;
      groups.push(`<g transform="${transform}">${innerSvg}</g>`);
    }
  }

  return groups.join('');
}
