/* ============================================================
   PAGE — CONTACT · formulaire dynamique en 2 étapes
   Étape 1 (établissement) → Étape 2 (vous) → envoi.
   Validation native + case « type de structure » (au moins un choix).
   Envoi compatible Netlify Forms (POST /), confirmation inline.
   Vanilla, sans dépendance.
   ============================================================ */
(function () {
  'use strict';
  var form = document.querySelector('[data-rdv-form]');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.ct-step'));
  var label = form.querySelector('[data-step-label]');
  var bar = form.querySelector('[data-step-bar]');
  var success = document.querySelector('[data-rdv-success]');
  var checkError = form.querySelector('[data-check-error]');
  var typeChecks = Array.prototype.slice.call(form.querySelectorAll('input[name="type"]'));

  function showStep(n) {
    steps.forEach(function (s) { s.hidden = (parseInt(s.getAttribute('data-step'), 10) !== n); });
    if (label) label.textContent = 'Étape ' + n + ' sur 2';
    if (bar) bar.style.width = (n === 1 ? 50 : 100) + '%';
    var first = steps[n - 1].querySelector('input:not([type="hidden"]),select,textarea');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    form.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function validStep(stepEl) {
    // champs requis natifs
    var reqs = Array.prototype.slice.call(stepEl.querySelectorAll('[required]'));
    for (var i = 0; i < reqs.length; i++) {
      if (!reqs[i].checkValidity()) { reqs[i].reportValidity(); return false; }
    }
    // groupe « type de structure » : au moins une case
    var groupInStep = stepEl.contains(typeChecks[0]);
    if (groupInStep && typeChecks.length) {
      var any = typeChecks.some(function (c) { return c.checked; });
      if (!any) {
        if (checkError) checkError.hidden = false;
        typeChecks[0].focus();
        return false;
      }
      if (checkError) checkError.hidden = true;
    }
    return true;
  }

  // efface l'erreur « type » dès qu'une case est cochée
  typeChecks.forEach(function (c) {
    c.addEventListener('change', function () {
      if (checkError && typeChecks.some(function (x) { return x.checked; })) checkError.hidden = true;
    });
  });

  var nextBtn = form.querySelector('[data-next]');
  if (nextBtn) nextBtn.addEventListener('click', function () { if (validStep(steps[0])) showStep(2); });
  var prevBtn = form.querySelector('[data-prev]');
  if (prevBtn) prevBtn.addEventListener('click', function () { showStep(1); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validStep(steps[1])) return;

    // honeypot caché : un bot l'a rempli → on ignore silencieusement
    var hp = form.querySelector('[name="bot-field"]');
    if (hp && hp.value.trim() !== '') return;

    var data = new URLSearchParams(new FormData(form)).toString();

    // confirmation immédiate (optimiste)
    form.hidden = true;
    if (success) { success.hidden = false; success.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

    // enregistrement Netlify Forms en arrière-plan (sans bloquer l'UI ; no-op en local)
    if (window.fetch) {
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      }).catch(function () {});
    }
  });
})();
