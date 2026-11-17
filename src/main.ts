/**
 * QATT-FRACTAL: Main Entry Point & Atelier Controller
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

import { setupDossierModal } from './components/dossierModal';
import { MAQAMAT, MaqamAudioEngine, MaqamId } from './engine/audio';
import { AtelierMode, QattAtelierEngine } from './engine/canvasEngine';
import { MOTIFS, MotifId } from './engine/motifs';
import { PALETTE_LIST, PaletteId } from './engine/palettes';

function getMotifIconSVG(id: MotifId): string {
  switch (id) {
    case 'banat':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 3 21 20 3 20 12 3"/></svg>`;
    case 'misht':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2 16 6 8 10 16 14 8 18 16 22 8"/></svg>`;
    case 'maharib':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 20V11h3V7l4-4 4 4v4h3v9"/></svg>`;
    case 'balsana':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 21 12 12 22 3 12 12 2"/></svg>`;
  }
}

function bootstrap(): void {
  const artCanvas = document.getElementById('atelier-art-canvas') as HTMLCanvasElement | null;
  const fxCanvas = document.getElementById('atelier-fx-canvas') as HTMLCanvasElement | null;
  if (!artCanvas || !fxCanvas) return;

  const audio = new MaqamAudioEngine();

  // HUD elements
  const hudModeTitle = document.getElementById('hud-mode-title');
  const hudFps = document.getElementById('hud-fps');
  const hudEntities = document.getElementById('hud-entities');
  const hudSymmetry = document.getElementById('hud-symmetry');
  const hudMaqam = document.getElementById('hud-maqam');
  const hudHint = document.getElementById('hud-interaction-hint');
  const headerMaqamLabel = document.getElementById('header-maqam-label');

  let activeMotif: MotifId = 'banat';
  let activeBrushSize = 26;
  let activeHilbertOrder = 4;
  let activeGoldenSpeed = 1.0;

  const engine = new QattAtelierEngine(artCanvas, fxCanvas, audio, (snap) => {
    if (hudFps) hudFps.textContent = `${snap.fps} FPS`;
    if (hudEntities) hudEntities.textContent = `${snap.entityCount} Geo-Units`;
    if (hudSymmetry) hudSymmetry.textContent = `${snap.symmetryFolds}-Fold`;
    if (hudModeTitle) {
      hudModeTitle.textContent =
        snap.mode === 'kaleidoscope'
          ? 'Kaleidoscope Atelier'
          : 'Sacred Mandala & Hilbert';
    }
  });

  // Resize observer for crisp 60fps DPR canvas
  const resizeObserver = new ResizeObserver(() => engine.resize());
  if (artCanvas.parentElement) {
    resizeObserver.observe(artCanvas.parentElement);
  }
  window.addEventListener('resize', () => engine.resize());

  // Render dynamic Mode Sidebar Panel
  const panelModeControls = document.getElementById('panel-mode-controls');
  const wrapMirrorToggle = document.getElementById('wrap-mirror-toggle');
  const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement | null;
  const btnAutoWeave = document.getElementById('btn-autoweave') as HTMLButtonElement | null;

  function renderModeControls(mode: AtelierMode): void {
    if (!panelModeControls) return;

    if (mode === 'kaleidoscope') {
      if (wrapMirrorToggle) wrapMirrorToggle.style.display = 'inline-flex';
      if (btnUndo) btnUndo.disabled = false;
      if (btnAutoWeave) btnAutoWeave.disabled = false;
      if (hudHint) {
        hudHint.innerHTML = '<span>Drag / Touch canvas to weave Asiri geometry</span>';
      }

      const motifCards = (Object.keys(MOTIFS) as MotifId[])
        .map((id) => {
          const m = MOTIFS[id];
          return `
            <button class="motif-btn ${id === activeMotif ? 'active' : ''}" data-motif="${id}">
              <div class="motif-btn-top">
                <span>${m.nameAr}</span>
                ${getMotifIconSVG(id)}
              </div>
              <span class="motif-btn-sub">${m.nameEn}</span>
            </button>
          `;
        })
        .join('');

      panelModeControls.innerHTML = `
        <div class="panel-header">
          <span>Qatt Motif Brushes</span>
          <span class="badge">فرش القط العسيري</span>
        </div>
        <div class="motif-grid">${motifCards}</div>
        <div class="control-group">
          <div class="control-label-row">
            <span>Motif Scale</span>
            <span class="control-val" id="disp-brush-size">${activeBrushSize}px</span>
          </div>
          <input type="range" id="slider-brush-size" min="12" max="54" step="1" value="${activeBrushSize}" />
        </div>
      `;

      panelModeControls.querySelectorAll<HTMLButtonElement>('[data-motif]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeMotif = btn.dataset.motif as MotifId;
          engine.setMotif(activeMotif);
          panelModeControls.querySelectorAll('[data-motif]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      const brushSlider = document.getElementById('slider-brush-size') as HTMLInputElement | null;
      const brushDisp = document.getElementById('disp-brush-size');
      brushSlider?.addEventListener('input', () => {
        activeBrushSize = Number(brushSlider.value);
        engine.setBrushSize(activeBrushSize);
        if (brushDisp) brushDisp.textContent = `${activeBrushSize}px`;
      });
    } else {
      if (wrapMirrorToggle) wrapMirrorToggle.style.display = 'none';
      if (btnUndo) btnUndo.disabled = true;
      if (btnAutoWeave) btnAutoWeave.disabled = true;
      if (hudHint) {
        hudHint.innerHTML = '<span>Move cursor for Parallax &amp; Repulsion • Click for Maqam Resonance</span>';
      }

      panelModeControls.innerHTML = `
        <div class="panel-header">
          <span>Hilbert &amp; φ Mandala</span>
          <span class="badge">φ = 1.618</span>
        </div>
        <div class="control-group" style="margin-top:0">
          <div class="control-label-row">
            <span>Hilbert Recursion Order</span>
            <span class="control-val" id="disp-hilbert-order">Order ${activeHilbertOrder} (${Math.pow(4, activeHilbertOrder)} pts)</span>
          </div>
          <div class="preset-btn-group hilbert-grid">
            ${[2, 3, 4, 5]
              .map(
                (ord) =>
                  `<button class="sub-btn ${ord === activeHilbertOrder ? 'active' : ''}" data-hilbert="${ord}">Ord ${ord}</button>`
              )
              .join('')}
          </div>
        </div>
        <div class="control-group">
          <div class="control-label-row">
            <span>Golden Pulse Cadence (ω)</span>
            <span class="control-val" id="disp-golden-speed">${activeGoldenSpeed.toFixed(2)}×</span>
          </div>
          <input type="range" id="slider-golden-speed" min="0.25" max="2.4" step="0.05" value="${activeGoldenSpeed}" />
        </div>
      `;

      panelModeControls.querySelectorAll<HTMLButtonElement>('[data-hilbert]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeHilbertOrder = Number(btn.dataset.hilbert);
          engine.setHilbertOrder(activeHilbertOrder);
          const disp = document.getElementById('disp-hilbert-order');
          if (disp) {
            disp.textContent = `Order ${activeHilbertOrder} (${Math.pow(4, activeHilbertOrder)} pts)`;
          }
          panelModeControls.querySelectorAll('[data-hilbert]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      const speedSlider = document.getElementById('slider-golden-speed') as HTMLInputElement | null;
      const speedDisp = document.getElementById('disp-golden-speed');
      speedSlider?.addEventListener('input', () => {
        activeGoldenSpeed = Number(speedSlider.value);
        engine.setGoldenPulseSpeed(activeGoldenSpeed);
        if (speedDisp) speedDisp.textContent = `${activeGoldenSpeed.toFixed(2)}×`;
      });
    }
  }

  renderModeControls('kaleidoscope');

  // Mode Tabs
  document.querySelectorAll<HTMLButtonElement>('.system-tab[data-mode]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode as AtelierMode;
      engine.setMode(mode);
      document.querySelectorAll('.system-tab[data-mode]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderModeControls(mode);
    });
  });

  // Symmetry Folds
  document.querySelectorAll<HTMLButtonElement>('#symmetry-selector [data-folds]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const folds = Number(btn.dataset.folds);
      engine.setSymmetryFolds(folds);
      document.querySelectorAll('#symmetry-selector [data-folds]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Emboss & Mirror Toggles
  const chkEmboss = document.getElementById('chk-emboss') as HTMLInputElement | null;
  chkEmboss?.addEventListener('change', () => engine.setEmbossRelief(chkEmboss.checked));

  const chkMirror = document.getElementById('chk-mirror') as HTMLInputElement | null;
  chkMirror?.addEventListener('change', () => engine.setMirrorSymmetry(chkMirror.checked));

  // Authentic Abha Pigment Palettes
  const paletteListEl = document.getElementById('palette-list');
  if (paletteListEl) {
    paletteListEl.innerHTML = PALETTE_LIST.map(
      (pal, idx) => `
      <button class="palette-card ${idx === 0 ? 'active' : ''}" data-palette="${pal.id}">
        <div class="palette-meta">
          <span class="palette-name-ar">${pal.nameAr}</span>
          <span class="palette-name-en">${pal.nameEn}</span>
        </div>
        <div class="palette-swatches">
          ${pal.pigments
            .slice(0, 5)
            .map((hex) => `<span class="swatch-dot" style="background:${hex}"></span>`)
            .join('')}
        </div>
      </button>
    `
    ).join('');

    paletteListEl.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach((card) => {
      card.addEventListener('click', () => {
        const pid = card.dataset.palette as PaletteId;
        engine.setPalette(pid);
        paletteListEl.querySelectorAll('[data-palette]').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  // Maqam Synth Selector + Header Quick Cycle
  function selectMaqam(id: MaqamId): void {
    audio.setMaqam(id);
    const def = MAQAMAT[id];
    if (hudMaqam) hudMaqam.textContent = def.id === 'mute' ? 'Mute' : def.id.toUpperCase();
    if (headerMaqamLabel) headerMaqamLabel.textContent = `${def.nameAr} • ${def.nameEn.replace('Maqam ', '')}`;
    document.querySelectorAll('#maqam-selector [data-maqam]').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.maqam === id);
    });
    if (id !== 'mute') {
      audio.triggerGeometryNote(0.45, 0, 0.72);
    }
  }

  document.querySelectorAll<HTMLButtonElement>('#maqam-selector [data-maqam]').forEach((btn) => {
    btn.addEventListener('click', () => selectMaqam(btn.dataset.maqam as MaqamId));
  });

  const maqamCycle: MaqamId[] = ['hijaz', 'bayati', 'nahawand', 'mute'];
  document.getElementById('header-audio-pill')?.addEventListener('click', () => {
    const nextIdx = (maqamCycle.indexOf(audio.maqam) + 1) % maqamCycle.length;
    selectMaqam(maqamCycle[nextIdx]);
  });

  // Bottom Control Actions
  btnUndo?.addEventListener('click', () => engine.undo());
  document.getElementById('btn-clear')?.addEventListener('click', () => engine.clear());

  btnAutoWeave?.addEventListener('click', () => {
    const next = !engine.isAutoWeaveEnabled();
    engine.setAutoWeave(next);
    btnAutoWeave.classList.toggle('active', next);
    const txt = document.getElementById('txt-autoweave');
    if (txt) txt.textContent = next ? 'Weaving...' : 'Auto-Weave';
  });

  const btnPlaster = document.getElementById('btn-plaster');
  let plasterOn = true;
  btnPlaster?.addEventListener('click', () => {
    plasterOn = !plasterOn;
    engine.setPlasterTexture(plasterOn);
    btnPlaster.classList.toggle('active', plasterOn);
  });

  document.getElementById('btn-export-svg')?.addEventListener('click', () => engine.exportVectorSVG());
  document.getElementById('btn-export-png')?.addEventListener('click', () => engine.export4KPng());

  // Geometry Dossier Modal
  setupDossierModal('open-dossier-btn');
}

document.addEventListener('DOMContentLoaded', bootstrap);
