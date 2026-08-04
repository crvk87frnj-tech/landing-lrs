/* ============================================================
   PAGE — POUR QUI ? · interactions
   (1) Bloc « outil de soin » : les points d'intégration apparaissent
       un à un au scroll, le long de la flèche pointillée (progression).
   Vanilla, sans dépendance. Respecte prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- (1) Révélation des points d'intégration ---------- */
  (function integrate() {
    var root = document.querySelector('[data-integr]');
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-integr-item]'));
    if (!items.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      // pas d'animation : tout est visible
      items.forEach(function (li) { li.classList.add('is-visible'); });
      return;
    }

    // léger décalage progressif pour l'effet « un à un »
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var li = entry.target;
        var i = items.indexOf(li);
        li.style.transitionDelay = Math.max(0, i) * 0.08 + 's';
        li.classList.add('is-visible');
        io.unobserve(li);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (li) { io.observe(li); });
  })();

  /* ---------- (2) Parcours en 4 étapes : chaque étape s'allume en entrant
     dans le viewport (IntersectionObserver) -> allumage régulier et aligné
     pour les 4 chiffres (corrige l'étape 4 qui s'activait trop tard). */
  (function steps() {
    var root = document.querySelector('[data-steps]');
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-step]'));
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (li) { li.classList.add('is-active'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-active'); io.unobserve(en.target); }
      });
    }, { threshold: 0.55, rootMargin: '0px 0px -12% 0px' });
    items.forEach(function (li) { io.observe(li); });
  })();

  /* ---------- (3) Rond « validé » de l'arrivée : blanc → jaune + check ---------- */
  (function arrival() {
    var el = document.querySelector('[data-arrival-check]');
    if (!el) return;
    if (reduce || !('IntersectionObserver' in window)) { el.classList.add('is-arrived'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { el.classList.add('is-arrived'); io.unobserve(el); }
      });
    }, { threshold: 0.7 });
    io.observe(el);
  })();

  /* ---------- (4) Carrousel « mesures » : défilement + flèches ---------- */
  (function mesCarousel() {
    var track = document.querySelector('[data-mes-track]');
    if (!track) return;
    var prev = document.querySelector('[data-mes-prev]');
    var next = document.querySelector('[data-mes-next]');
    var count = document.querySelector('[data-mes-count]');
    var cards = track.querySelectorAll('.pq-mes-card');
    function step() {
      var c = track.querySelector('.pq-mes-card');
      if (!c) return track.clientWidth * 0.5;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24) || 24;
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
