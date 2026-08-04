/* ============================================================
   PAGE — À PROPOS · fiche technique « Le OuiCycle en détail »
   Réécriture vanilla des effets du template Claude Design (DCLogic) :
   (1) points chauds (hover/focus/clic + auto-tour au scroll)
   (2) compteurs (count-up ease-out)
   (3) blueprint SVG (traits qui se dessinent + cotes qui apparaissent)
   (4) accordéons de configuration
   Sans dépendance. Respecte prefers-reduced-motion (le markup ship
   l'état « arrivé » → une page sans JS / reduced-motion reste correcte).
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Déclenche fn une seule fois quand el entre dans le viewport. */
  function once(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
  }

  /* ---------- (1) Points chauds sur la photo ---------- */
  (function spots() {
    var spots = Array.prototype.slice.call(document.querySelectorAll('[data-spot]'));
    if (!spots.length) return;

    function paint(active) {
      spots.forEach(function (s) {
        var on = s === active;
        var c = s.querySelector('[data-spot-card]');
        var d = s.querySelector('[data-spot-dot]');
        var r = s.querySelector('[data-spot-ring]');
        if (c) { c.style.opacity = on ? '1' : '0'; c.style.transform = on ? 'translateY(0)' : 'translateY(8px)'; }
        if (d) d.style.transform = on ? 'scale(1.18)' : 'scale(1)';
        if (r) r.style.animationPlayState = on ? 'paused' : 'running';
      });
    }
    var closeAll = function () { paint(null); };

    spots.forEach(function (spot) {
      var dot = spot.querySelector('[data-spot-dot]');
      var card = spot.querySelector('[data-spot-card]');
      if (!dot || !card) return;
      spot.addEventListener('mouseenter', function () { paint(spot); });
      spot.addEventListener('mouseleave', closeAll);
      dot.addEventListener('focus', function () { paint(spot); });
      dot.addEventListener('blur', closeAll);
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        card.style.opacity === '1' ? closeAll() : paint(spot);
      });
    });

    /* Auto-tour : au premier passage à l'écran, on ouvre chaque point
       l'un après l'autre, puis on referme. */
    if (!reduce) {
      var fig = spots[0].closest('figure') || spots[0].parentElement;
      once(fig, function () {
        var i = 0;
        var step = function () {
          if (i >= spots.length) { closeAll(); return; }
          paint(spots[i]); i += 1;
          setTimeout(step, 900);
        };
        setTimeout(step, 500);
      });
    }
  })();

  /* ---------- (2) Compteur animé — UNIQUEMENT « 40 km », plus lent ----------
     Les 3 autres cases restent statiques (valeurs du template). */
  (function counts() {
    if (reduce) return;
    var node = document.querySelector('[data-count][data-to="40"]');
    if (!node) return;
    var dec = parseInt(node.getAttribute('data-dec') || '0', 10);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    once(node, function () {
      node.textContent = fmt(0);
      var dur = 2600, t0 = Date.now();   // vitesse réduite
      var id = setInterval(function () {
        var p = Math.min(1, (Date.now() - t0) / dur);
        node.textContent = fmt(40 * (1 - Math.pow(1 - p, 3)));
        if (p >= 1) { clearInterval(id); node.textContent = fmt(40); }
      }, 24);
    });
  })();

  /* ---------- (3) Blueprint SVG ----------
     Effet « dessin » retiré (demande Vincent) : le schéma est STATIQUE
     (état du template = traits + cotes déjà visibles). Le rendu « crayon
     à papier » (grain) est fourni par le filtre SVG #fd-pencil. */

  /* ---------- (4) Accordéons de configuration ---------- */
  (function config() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-config-panel]'));
    if (!panels.length) return;
    panels.forEach(function (panel) {
      panel.style.gridTemplateRows = '0fr';
      var btn = panel.previousElementSibling && panel.previousElementSibling.querySelector('[data-config-toggle]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-config-toggle]');
      if (!btn) return;
      var panel = btn.parentElement && btn.parentElement.nextElementSibling;
      if (!panel || !panel.hasAttribute('data-config-panel')) return;
      var open = panel.style.gridTemplateRows !== '1fr';
      panel.style.gridTemplateRows = open ? '1fr' : '0fr';
      btn.setAttribute('aria-expanded', String(open));
      var chev = btn.querySelector('[data-config-chevron]');
      if (chev) chev.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    document.addEventListener('mouseover', function (e) {
      var btn = e.target.closest && e.target.closest('[data-config-toggle]');
      if (btn) { btn.style.transform = 'translateY(-2px)'; btn.style.backgroundColor = '#F5A800'; }
    });
    document.addEventListener('mouseout', function (e) {
      var btn = e.target.closest && e.target.closest('[data-config-toggle]');
      if (btn) { btn.style.transform = 'translateY(0)'; btn.style.backgroundColor = '#FFC300'; }
    });
  })();

  /* ---------- (5) « Ce qui fait avancer » — UNE flèche déroule les 4 postes ----------
     Une rangée solidaire (les 4 hauts alignés) : un seul panneau se déplie,
     les 4 colonnes de puces apparaissent ensemble, l'alignement est préservé. */
  (function perf() {
    var btn = document.querySelector('[data-perf-toggle]');
    var panel = document.querySelector('[data-perf-panel]');
    if (!btn || !panel) return;
    var chev = btn.querySelector('[data-perf-chevron]');
    if (reduce) panel.style.transition = 'none';
    /* état initial : replié (le markup ship l'état déplié → OK sans JS) */
    panel.style.gridTemplateRows = '0fr';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = panel.style.gridTemplateRows !== '1fr';
      panel.style.gridTemplateRows = open ? '1fr' : '0fr';
      btn.setAttribute('aria-expanded', String(open));
      if (chev) chev.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    btn.addEventListener('mouseenter', function () { btn.style.transform = 'translateY(-2px)'; btn.style.backgroundColor = '#F5A800'; });
    btn.addEventListener('mouseleave', function () { btn.style.transform = 'translateY(0)'; btn.style.backgroundColor = '#FFC300'; });
  })();
})();
