/**
 * Authentic Abha Pigment Palettes for QATT-FRACTAL
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export type PaletteId =
  | 'asiri_natural'
  | 'soudah_neon'
  | 'royal_palace_gold'
  | 'abha_plaster_classic'
  | 'red_sea_tourmaline';

export interface PigmentPalette {
  id: PaletteId;
  nameAr: string;
  nameEn: string;
  description: string;
  canvasBg: string;
  canvasBgSecondary: string;
  gypsumWhite: string;
  charcoalLine: string;
  isLightSurface: boolean;
  /** Primary traditional/generative pigment sequence */
  pigments: string[];
  accentGlow: string;
}

export const PALETTES: Record<PaletteId, PigmentPalette> = {
  asiri_natural: {
    id: 'asiri_natural',
    nameAr: 'أصباغ عسير الطبيعية',
    nameEn: 'Asiri Natural Pigments',
    description: 'Indigo Blue, Red Ochre, Sidr Gum Yellow, Charcoal & Gypsum White',
    canvasBg: '#0c111d',
    canvasBgSecondary: '#131b2e',
    gypsumWhite: '#f8fafc',
    charcoalLine: '#0f172a',
    isLightSurface: false,
    pigments: [
      '#1e40af', // النيلة الزرقاء - Natural Indigo
      '#c83e2b', // المغرة الحمراء - Red Ochre
      '#eab308', // صمغ السدر الأصفر - Sidr Gum Yellow
      '#f8fafc', // الجص الأبيض - Gypsum White
      '#10b981', // البرسيم الجبلي - Mountain Alfalfa Green
      '#334155', // الفحم - Charcoal Slate
    ],
    accentGlow: 'rgba(234, 179, 8, 0.35)',
  },
  soudah_neon: {
    id: 'soudah_neon',
    nameAr: 'ليالي السودة النيونية',
    nameEn: 'Soudah Neon Nights',
    description: 'High-altitude midnight slate electrified with cyan, violet & amber',
    canvasBg: '#060913',
    canvasBgSecondary: '#0f1629',
    gypsumWhite: '#f1f5f9',
    charcoalLine: '#020617',
    isLightSurface: false,
    pigments: [
      '#06b6d4', // Electric Cyan
      '#8b5cf6', // Juniper Violet
      '#f59e0b', // Mist Amber
      '#ec4899', // Magenta Bloom
      '#f8fafc', // Crisp Starlight
      '#38bdf8', // Sky Laser
    ],
    accentGlow: 'rgba(6, 182, 212, 0.4)',
  },
  royal_palace_gold: {
    id: 'royal_palace_gold',
    nameAr: 'ذهب القصور الملكي',
    nameEn: 'Royal Palace Gold',
    description: 'Obsidian stone inlaid with 24K gold leaf, burnished copper & crimson',
    canvasBg: '#0a0807',
    canvasBgSecondary: '#18120e',
    gypsumWhite: '#fef3c7',
    charcoalLine: '#1c140d',
    isLightSurface: false,
    pigments: [
      '#d4af37', // 24K Royal Gold
      '#b45309', // Burnished Copper
      '#991b1b', // Majlis Crimson
      '#faf5e8', // Ivory Gypsum
      '#fbbf24', // Saffron Gold
      '#78350f', // Roasted Cedar
    ],
    accentGlow: 'rgba(212, 175, 55, 0.38)',
  },
  abha_plaster_classic: {
    id: 'abha_plaster_classic',
    nameAr: 'جص أبها الكلاسيكي',
    nameEn: 'Abha Classic Plaster',
    description: 'Sunlit limestone gypsum wall with mineral ochre, cobalt & soot ink',
    canvasBg: '#efe7da',
    canvasBgSecondary: '#e4d8c5',
    gypsumWhite: '#ffffff',
    charcoalLine: '#1c1917',
    isLightSurface: true,
    pigments: [
      '#b93829', // Mineral Red Ochre
      '#1d4ed8', // Deep Indigo Cobalt
      '#d97706', // Turmeric Sidr
      '#1c1917', // Soot Charcoal
      '#15803d', // Highland Olive Leaf
      '#ffffff', // Pure Lime Gypsum
    ],
    accentGlow: 'rgba(185, 56, 41, 0.25)',
  },
  red_sea_tourmaline: {
    id: 'red_sea_tourmaline',
    nameAr: 'تورمالين البحر الأحمر',
    nameEn: 'Red Sea Tourmaline',
    description: 'Abyssal turquoise depths, emerald crystal, coral rose & pearl',
    canvasBg: '#031a1a',
    canvasBgSecondary: '#062c2b',
    gypsumWhite: '#ecfeff',
    charcoalLine: '#042f2e',
    isLightSurface: false,
    pigments: [
      '#10b981', // Tourmaline Emerald
      '#14b8a6', // Lagoon Teal
      '#f43f5e', // Red Sea Coral
      '#f1f5f9', // Pearl Gypsum
      '#2dd4bf', // Aqua Prism
      '#fbbf24', // Sunlit Sand
    ],
    accentGlow: 'rgba(20, 184, 166, 0.36)',
  },
};

export const PALETTE_LIST: PigmentPalette[] = Object.values(PALETTES);
