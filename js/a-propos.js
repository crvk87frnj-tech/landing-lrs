/* ============================================================
   PAGE — À PROPOS · sous-page 1 « Notre histoire »
   Réécriture vanilla des comportements du template Claude Design :
   (1) reveals au scroll (fondu + translation)
   (2) frise : l'axe vertical se remplit de jaune au fil du scroll
   (3) carrousel « équipe » : 2 photos, billes + flèche unifiée
   Sans dépendance. Respecte prefers-reduced-motion (sans JS, tout
   reste visible → dégradation propre).
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- (1) Reveals ---------- */
  (function reveals() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;
    if (reduce || !('IntersectionObserver' in window)) return;   // reste visible
    nodes.forEach(function (n) {
      n.style.opacity = '0';
      n.style.transform = 'translateY(18px)';
      n.style.transition = 'opacity .6s cubic-bezier(.22,.61,.36,1), transform .6s cubic-bezier(.22,.61,.36,1)';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    nodes.forEach(function (n) { io.observe(n); });
    /* filet de sécurité : ce qui est déjà à l'écran apparaît au scroll */
    var sweep = function () {
      nodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < window.innerHeight * .95) {
          n.style.opacity = '1';
          n.style.transform = 'none';
          io.unobserve(n);
        }
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
  })();

  /* ---------- (2) Frise : axe vertical qui se remplit ---------- */
  (function frise() {
    var frise = document.querySelector('[data-frise]');
    if (!frise) return;
    var fill = frise.querySelector('[data-axis-fill]');
    var line = frise.querySelector('span[aria-hidden]');   // 1re span = ligne statique
    var axisLen = 0;

    /* centre vertical d'un point, relatif à la frise */
    function center(d) {
      var y = d.offsetHeight / 2, n = d;
      while (n && n !== frise) { y += n.offsetTop; n = n.offsetParent; }
      return y;
    }
    /* cale la ligne et le remplissage entre le 1er et le dernier point */
    function measure() {
      var dots = Array.prototype.slice.call(frise.querySelectorAll('li span[aria-hidden]'));
      if (dots.length < 2) return;
      var top = center(dots[0]);
      var bottom = frise.offsetHeight - center(dots[dots.length - 1]);
      if (line) { line.style.top = top + 'px'; line.style.bottom = bottom + 'px'; }
      if (fill) fill.style.top = top + 'px';
      axisLen = frise.offsetHeight - top - bottom;
    }
    function onScroll() {
      measure();
      var r = frise.getBoundingClientRect();
      var span = r.height + window.innerHeight * .4;
      var p = Math.min(1, Math.max(0, (window.innerHeight * .7 - r.top) / span));
      if (fill) fill.style.height = (p * (axisLen || r.height - 96)) + 'px';
    }

    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if ('ResizeObserver' in window) { new ResizeObserver(measure).observe(frise); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- (3) Carrousel « équipe » (2 photos) ---------- */
  (function carousel() {
    var track = document.querySelector('[data-aph-track]');
    if (!track) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-aph-dot]'));
    var prev = document.querySelector('[data-aph-prev]');
    var next = document.querySelector('[data-aph-next]');
    var i = 0, N = 2;

    function render() {
      track.style.transform = 'translateX(' + (i * -50) + '%)';
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (prev) prev.hidden = (i === 0);        // masquée au départ
      if (next) next.hidden = (i === N - 1);    // masquée en fin
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { i = k; render(); }); });
    if (prev) prev.addEventListener('click', function () { if (i > 0) { i -= 1; render(); } });
    if (next) next.addEventListener('click', function () { if (i < N - 1) { i += 1; render(); } });
    render();
  })();
})();
