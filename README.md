# QATT-FRACTAL: Generative Asiri Geometry, Fractal Tessellation & Kinetic Mosaic Atelier

> **استوديو القط العسيري الفركتلي — هندسة عسيرية توليدية، فسيفساء حركية بالنّسبة الذهبية، ومحرك صوتي للمقامات العربية**

**Lead Creative Technologist & Systems Architect:**  
**أ. طارق ابوعشي | Tareq Abuashi**

---

## Overview | نظرة عامة

**QATT-FRACTAL** is an interactive computational heritage & generative geometry atelier built with **TypeScript**, **Dual-Layer 60fps HTML5 Canvas**, and **Web Audio API**. It translates the UNESCO-recognized traditional geometric wall art of **Al-Qatt Al-Asiri (القط العسيري)** from Abha, Asir into an expressive digital medium combining dihedral radial symmetry, golden-ratio fractals, procedural gypsum relief lighting, Arabic Maqam audio synthesis, and CNC-ready vector exports.

يجمع المشروع بين أصالة **فن القط العسيري** التراثي في منطقة عسير وأبها وبين خوارزميات الهندسة التوليدية الحديثة، ليقدّم بيئة رسم وتصميم تفاعلية تعمل بسرعة 60 إطاراً في الثانية مع إمكانية التصدير المباشر لملفات القطع بالليزر (`SVG`) والصور فائقة الدقة (`4K PNG`).

---

## Core Architecture & Features | المميزات والهندسة البرمجية

### 1. Generative Kaleidoscope & Brush (`MOD 01`)
- **Dihedral Rotational Symmetry:** Instant switching across `4-Fold`, `6-Fold`, `8-Fold`, `12-Fold`, and `16-Fold` rotational symmetry with toggleable mirror reflection planes ($D_n$).
- **Authentic Qatt Al-Asiri Vector Brushes:**
  - **البنات (Al-Banat):** Triangular maiden motifs with nested chevron crowns.
  - **المشط (Al-Misht):** Rhythmic comb zigzags and parallel anchor rails.
  - **المحاريب (Al-Maharib):** Stepped sacred arches with inner diamond finials.
  - **البلسنة (Al-Balsana):** Faceted geometric lozenges and crosshairs.
- **3D Gypsum Emboss Relief & Pigment Dust Particles:** Directional bevel highlight + carved shadow lighting simulating sculpted lime plaster, paired with curl-drifting pigment dust motes.
- **Auto-Weave Bot:** Automated rose-curve harmonic weaver that composes layered Asiri medallions hands-free.

### 2. Sacred Asiri Mandala & Hilbert Fractal (`MOD 02`)
- **Golden Ratio ($\varphi = 1.618$) Mandala:** Multi-layered concentric tessellation rings breathing in harmonic proportion.
- **Hilbert Space-Filling Curve:** Fast $O(p)$ bitwise quadrant mapping across orders `2` to `5` with traveling luminous pulse.
- **Interactive Parallax & Repulsion Field:** Real-time cursor/touch parallax depth and inverse-square geometric repulsion.

### 3. Authentic Abha Pigment Palettes | لوحات الأصباغ الطبيعية
1. **أصباغ عسير الطبيعية (Asiri Natural Pigments):** Indigo Blue, Red Ochre, Sidr Gum Yellow, Charcoal & Gypsum White (`#f8fafc`).
2. **ليالي السودة النيونية (Soudah Neon Nights)**
3. **ذهب القصور الملكي (Royal Palace Gold)**
4. **جص أبها الكلاسيكي (Abha Classic Plaster)**
5. **تورمالين البحر الأحمر (Red Sea Tourmaline)**

### 4. Web Audio API Arabic Maqam Synth | محرك المقامات الصوتي
- Procedural Oud & Nay synthesis tuned to authentic interval ratios for **مقام الحجاز (Hijaz)**, **مقام بياتي (Bayati)**, **مقام نهوند (Nahawand)**, or **Mute**, complete with spatial stereo panning and synthesized stone-courtyard Convolution Reverb.

### 5. Live HUD, Dossier & Production Exports
- **Live Telemetry HUD:** Real-time FPS, geometric entity count, symmetry fold, and active Maqam.
- **CNC-Ready Vector SVG Export:** Exports clean, mathematically exact `<svg>` vector layers ready for laser cutting, plotting, or print.
- **Ultra-HD 4K PNG Export:** Renders the current composition at `3840px` resolution with gypsum plaster texture.
- **Geometry Dossier Modal:** Bilingual interactive reference detailing $D_n$ symmetry matrices, $\varphi$ phyllotaxis, Hilbert recursion, and Maqam frequency ratios.

---

## Tech Stack | التقنيات المستخدمة
- **Language:** TypeScript (Strict Mode)
- **Bundler:** Vite (`base: './'`)
- **Rendering:** Dual-Layer HTML5 Canvas 2D + Procedural Plaster Texture + Vector SVG Serializer
- **Audio:** Native Web Audio API (Zero external audio dependencies)

---

## Build & Run | التشغيل والبناء

```bash
npm install
npm run dev
npm run build
```

---

**Designed & Architected exclusively by أ. طارق ابوعشي | Tareq Abuashi — Lead Creative Technologist & Systems Architect.**
