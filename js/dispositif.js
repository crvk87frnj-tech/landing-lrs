/* ============================================================
   PAGE — LE DISPOSITIF · interactions
   (1) Progression au scroll de « Comment se passe une séance ? »
       Barre jaune → verte (complétude) + étapes qui s'allument.
   (2) Carrousel des mesures : flèches + état des boutons + hint.
   Vanilla, sans dépendance. Respecte prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- (1) Progression des étapes ---------- */
  (function steps() {
    var root = document.querySelector('[data-steps]');
    if (!root) return;
    var fill = root.querySelector('[data-steps-fill]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-step]'));
    if (!fill || !items.length) return;

    // jaune clair #FFE89E → jaune OuiCycle saturé #F5A800 (montée en intensité)
    var A = [255, 232, 158], B = [245, 168, 0];
    function mix(t) {
      var r = Math.round(A[0] + (B[0] - A[0]) * t);
      var g = Math.round(A[1] + (B[1] - A[1]) * t);
      var b = Math.round(A[2] + (B[2] - A[2]) * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    var ticking = false;
    function update() {
      ticking = false;
      var rect = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // progression : de l'entrée (bas de viewport) à la sortie (haut)
      var total = rect.height + vh * 0.35;
      var scrolled = vh * 0.8 - rect.top;
      var p = Math.max(0, Math.min(1, scrolled / total));

      fill.style.height = (p * 100).toFixed(1) + '%';
      fill.style.background = mix(p);

      // seuils d'activation des étapes (répartis sur la progression)
      var thresholds = [0.05, 0.30, 0.55, 0.82];
      items.forEach(function (li, i) {
        if (p >= thresholds[i]) li.classList.add('is-active');
        else li.classList.remove('is-active');
      });
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    if (reduce) {
      // pas d'animation : tout est « complété »
      fill.style.height = '100%';
      fill.style.background = 'rgb(245,168,0)';
      items.forEach(function (li) { li.classList.add('is-active'); });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
    }
  })();

  /* ---------- (2) Carrousel des mesures ---------- */
  (function measures() {
    var track = document.querySelector('[data-measures-track]');
    if (!track) return;
    var prev = document.querySelector('[data-measures-prev]');
    var next = document.querySelector('[data-measures-next]');
    var count = document.querySelector('[data-measures-count]');
    var cards = track.querySelectorAll('.measure');

    function step() {
      var card = track.querySelector('.measure');
      if (!card) return track.clientWidth * 0.5;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24) || 24;
      return card.getBoundingClientRect().width + gap;
    }
    function syncButtons() {
      var maxScroll = track.scrollWidth - track.clientWidth - 1;
      var atStart = track.scrollLeft <= 1;
      var atEnd = track.scrollLeft >= maxScroll;
      // flèches MASQUÉES aux extrémités (pas de fausse affordance)
      if (prev) prev.hidden = atStart;
      if (next) next.hidden = atEnd;
      if (count && cards.length) {
        var idx = Math.max(1, Math.min(cards.length, Math.round(track.scrollLeft / step()) + 1));
        count.textContent = idx + '/' + cards.length;
      }
    }

    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(syncButtons); }, { passive: true });
    window.addEventListener('resize', syncButtons, { passive: true });
    syncButtons();
  })();

  /* ---------- (3) Illustrations des mesures : mise à l'échelle ----------
     Chaque illustration est un iframe à canevas fixe 1200×800 (3:2).
     On la redimensionne (scale CSS) pour qu'elle remplisse exactement
     son cadre, quelle que soit la largeur de la carte (mobile compris). */
  (function illusScale() {
    var frames = document.querySelectorAll('[data-illus-frame]');
    if (!frames.length) return;

    function fit(frame) {
      var iframe = frame.querySelector('iframe');
      if (!iframe) return;
      var scale = frame.clientWidth / 1200;
      iframe.style.transform = 'scale(' + scale + ')';
      iframe.style.opacity = '1';   /* révélée une fois scalée → plus de glitch au démarrage */
    }

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { fit(entry.target); });
      });
      frames.forEach(function (f) { ro.observe(f); });
    } else {
      // repli sans ResizeObserver
      frames.forEach(fit);
      window.addEventListener('resize', function () { frames.forEach(fit); }, { passive: true });
    }
  })();

  /* --- 4 plans : déroulé MOBILE (repris de la landing) ---
     « Moteur » + aperçu fondu du 2e plan + flèche ; le clic ouvre le panneau. */
  (function () {
    var toggles = document.querySelectorAll('[data-plans-toggle]');
    if (!toggles.length) return;
    var mq = window.matchMedia('(max-width: 760px)');
    toggles.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      var scope = btn.closest('[data-plans-scope]') || panel.parentElement;
      var isOpen = function () { return scope.classList.contains('is-plans-open'); };
      var setOpen = function (open) {
        scope.classList.toggle('is-plans-open', open);
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '';
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Masquer les plans' : 'Voir les 3 autres plans');
      };
      var sync = function () {
        if (mq.matches) { setOpen(isOpen()); }
        else { scope.classList.remove('is-plans-open'); panel.style.maxHeight = ''; btn.setAttribute('aria-expanded', 'false'); }
      };
      btn.setAttribute('aria-expanded', 'false');
      sync();
      btn.addEventListener('click', function () { if (mq.matches) setOpen(!isOpen()); });
      mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
    });
  })();
})();
