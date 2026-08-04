/* ============================================================
   HEADER — menu mobile (hamburger). Partagé par toutes les pages.
   Accessible : aria-expanded, Échap, clic dehors, fermeture au clic
   sur un lien, réinitialisation au retour desktop. Sans dépendance.
   ============================================================ */
(function () {
  'use strict';
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Fermer au clic sur un lien du menu
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  // Échap referme et redonne le focus au bouton
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false); toggle.focus();
    }
  });

  // Clic en dehors du header referme
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  // Retour en desktop : on réinitialise l'état
  var mq = window.matchMedia('(min-width: 901px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (ev) {
    if (ev.matches) setOpen(false);
  });
})();
