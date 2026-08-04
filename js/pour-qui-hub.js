/* ============================================================
   PAGE — POUR QUI ? · HUB
   Socle commun : atténué/flouté au repos s'il est sous la ligne de
   flottaison, puis s'éclaircit quand il entre dans le viewport.
   Dégradé propre : sans JS ou en reduced-motion, le socle reste net.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var socle = document.querySelector('[data-hub-socle]');
  if (!socle) return;

  // Pas d'effet possible → tout est net d'emblée.
  if (reduce || !('IntersectionObserver' in window)) {
    socle.classList.add('is-revealed');
    return;
  }

  // On n'arme le flou que si le socle démarre SOUS la ligne de flottaison
  // (sinon il serait flou alors qu'il est déjà visible au chargement).
  var vh = window.innerHeight || document.documentElement.clientHeight;
  if (socle.getBoundingClientRect().top > vh * 0.9) {
    socle.classList.add('is-armed');
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        socle.classList.add('is-revealed');
        io.unobserve(socle);
      }
    });
  }, { threshold: 0.18 });
  io.observe(socle);
})();
