/* ============================================================
   PAGE — NOS PREUVES · interactions
   Vanilla, sans dépendance. Chaque comportement se branche seulement
   si sa cible existe. Respecte prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- (1) Chiffres décerclés : gris 300 → jaune profond ----------
     À l'entrée dans le viewport (motif .pq-step__num de la plaquette).
     Le compteur 350→400 est géré séparément par main.js (data-count-to). */
  (function litNumbers() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-lit]'));
    if (!els.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-lit'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-lit'); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- (4) Onglets témoignages (segmented control) ----------
     ARIA tablist : clic + navigation clavier (flèches, Home/End). */
  (function tabs() {
    var root = document.querySelector('[data-tabs]');
    if (!root) return;
    var tabList = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabList.length) return;

    function select(tab) {
      tabList.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      var target = tab.getAttribute('aria-controls');
      panels.forEach(function (p) {
        var on = p.id === target;
        p.classList.toggle('is-active', on);
        p.hidden = !on;
      });
    }

    root.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    root.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) === -1) return;
      var i = tabList.indexOf(document.activeElement);
      if (i === -1) return;
      e.preventDefault();
      var n = tabList.length;
      var j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1
            : e.key === 'ArrowRight' ? (i + 1) % n : (i - 1 + n) % n;
      tabList[j].focus();
      select(tabList[j]);
    });
  })();

  /* ---------- (5) Illustrations des mesures : mise à l'échelle ----------
     Chaque illustration est un iframe à canevas fixe 1200×800 (3:2) :
     on la met à l'échelle pour remplir exactement son cadre. */
  (function illusScale() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('[data-illus-frame]'));
    if (!frames.length) return;
    function fit(frame) {
      var iframe = frame.querySelector('iframe');
      if (iframe) { iframe.style.transform = 'scale(' + (frame.clientWidth / 1200) + ')'; iframe.style.opacity = '1'; }
    }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { fit(entry.target); });
      });
      frames.forEach(function (f) { ro.observe(f); });
    } else {
      frames.forEach(fit);
      window.addEventListener('resize', function () { frames.forEach(fit); }, { passive: true });
    }
  })();

  /* ---------- (6) Carrousel « mesures » (mobile) : défilement + flèches + « 1/4 » ---------- */
  (function pvMeasures() {
    var track = document.querySelector('[data-pvm-track]');
    if (!track) return;
    var prev = document.querySelector('[data-pvm-prev]');
    var next = document.querySelector('[data-pvm-next]');
    var count = document.querySelector('[data-pvm-count]');
    var cards = track.querySelectorAll('.pv-measure');
    function step() {
      var c = track.querySelector('.pv-measure');
      if (!c) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 20) || 20;
      return c.getBoundingClientRect().width + gap;
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (prev) prev.hidden = track.scrollLeft <= 1;
      if (next) next.hidden = track.scrollLeft >= max;
      if (count && cards.length) {
        var idx = Math.max(1, Math.min(cards.length, Math.round(track.scrollLeft / step()) + 1));
        count.textContent = idx + '/' + cards.length;
      }
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  })();

})();
