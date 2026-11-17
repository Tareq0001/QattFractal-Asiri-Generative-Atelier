/**
 * Geometry & Philosophy Dossier Modal
 * Lead Creative Technologist & Systems Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export function setupDossierModal(openBtnId: string): void {
  const openBtn = document.getElementById(openBtnId);
  if (!openBtn) return;

  const modal = document.createElement('div');
  modal.id = 'geometry-dossier-modal';
  modal.className = 'dossier-backdrop hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'dossier-title');

  modal.innerHTML = `
    <div class="dossier-dialog custom-scroll">
      <div class="dossier-header">
        <div>
          <div class="dossier-kicker">COMPUTATIONAL HERITAGE &amp; GENERATIVE GEOMETRY DOSSIER</div>
          <h2 id="dossier-title">QATT-FRACTAL — الفلسفة الهندسية ومعادلات القط العسيري</h2>
        </div>
        <button id="close-dossier-btn" class="dossier-close-btn" aria-label="Close Dossier">&times;</button>
      </div>

      <div class="dossier-architect-banner">
        <span>Lead Creative Technologist &amp; Systems Architect:</span>
        <strong>أ. طارق ابوعشي | Tareq Abuashi</strong>
      </div>

      <div class="dossier-grid">
        <section class="dossier-card">
          <h3>1. Dihedral Symmetry Group D<sub>n</sub> (التناظر الإشعاعي)</h3>
          <p>
            Every brushstroke in the <strong>Generative Kaleidoscope</strong> is transformed across
            <em>n</em> ∈ {4, 6, 8, 12, 16} rotational folds and optional mirror reflection planes, forming
            the dihedral symmetry group <code>D<sub>n</sub></code>:
          </p>
          <pre class="math-block">R(θ<sub>k</sub>) = [ cos(2πk/n)  -sin(2πk/n) ] · M<sub>±</sub>
        [ sin(2πk/n)   cos(2πk/n) ]</pre>
          <p class="ar-note" dir="rtl">
            يحاكي التناظر الإشعاعي والانعكاسي قواعد الزخرفة الجدارية في فن القط العسيري (أبها - عسير)، مع إضاءة نحت بارز ثلاثي الأبعاد (Bump / Emboss) تحاكي ملمس الجص المنحوت.
          </p>
        </section>

        <section class="dossier-card">
          <h3>2. Golden Ratio Mandala &amp; Phyllotaxis (φ = 1.618)</h3>
          <p>
            The Sacred Asiri Mandala layers scale recursively by <code>φ⁻¹ ≈ 0.6180339</code> while diamond
            nodes distribute along the Golden Angle <code>α = π(3 − √5) ≈ 137.508°</code>:
          </p>
          <pre class="math-block">r<sub>m</sub> = R<sub>max</sub> · φ<sup>−(m−1)</sup> · (1 + ε·sin(ωt + mφ))
θ<sub>j</sub> = j · 137.507764° + Ωt</pre>
          <p class="ar-note" dir="rtl">
            تنبض الحلقات الهندسية وفق النسبة الذهبية، وتستجيب لحركة المؤشر عبر حقل إزاحة وتنافر لحظي (Parallax &amp; Repulsion Field).
          </p>
        </section>

        <section class="dossier-card">
          <h3>3. Hilbert Space-Filling Fractal (منحنى هلبرت الفركتلي)</h3>
          <p>
            Continuous 1D-to-2D bijection of order <em>p</em> ∈ [2, 5] maps index <code>d ∈ [0, 4<sup>p</sup>)</code>
            into a non-intersecting recursive lattice using O(p) bitwise quadrant rotation, combined with
            an inverse-square cursor repulsion potential:
          </p>
          <pre class="math-block">F<sub>repel</sub>(r) = (k / (r + r<sub>0</sub>)) · (1 − r / r<sub>max</sub>)² · r̂</pre>
          <p class="ar-note" dir="rtl">
            تندمج وحدات <strong>البنات</strong> و<strong>المشط</strong> و<strong>المحاريب</strong> و<strong>البلسنة</strong> مع المسارات الفركتلية مع قابلية التصدير المتجهي المباشر <code>SVG</code> للطباعة والقص بالليزر CNC.
          </p>
        </section>

        <section class="dossier-card">
          <h3>4. Procedural Arabic Maqam Synth (محرك المقامات الصوتي)</h3>
          <p>
            Real-time Web Audio API physical-inspired Oud &amp; Nay synthesis tuned to authentic Arabic
            interval ratios with a synthesized stone-courtyard Convolution Reverb:
          </p>
          <pre class="math-block">Hijaz:    1 : 1.067 : 1.260 : 1.333 : 1.500 : 1.600 : 1.778 : 2
Bayati:   1 : 1.091 : 1.189 : 1.333 : 1.500 : 1.600 : 1.778 : 2
Nahawand: 1 : 1.125 : 1.200 : 1.333 : 1.500 : 1.600 : 1.875 : 2</pre>
          <p class="ar-note" dir="rtl">
            كل ضربة فرشاة أو نبضة فركتلية تعزف نغمة متناغمة مكانياً (Stereo Pan) مع موقعها الهندسي على اللوحة.
          </p>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#close-dossier-btn');
  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}
