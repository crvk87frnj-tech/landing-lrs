/* ============================================================
   Les Roues Solidaires — interactions
   Modulaire : chaque comportement est indépendant et se branche
   seulement si sa cible existe dans le DOM.
   ============================================================ */
(function () {
  "use strict";

  /* --- Header : surface plus dense + ombre au scroll --- */
  const header = document.getElementById("site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Compteur animé (data-count-to) : ex. 350 → 400 à l'entrée
     dans le viewport. Easing ease-out. Désactivé si prefers-reduced-motion. --- */
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setFinal = (el) => { el.textContent = el.dataset.countTo + (el.dataset.suffix || ""); };

    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(setFinal);
    } else {
      const animate = (el) => {
        const from = parseInt(el.dataset.countFrom, 10) || 0;
        const to = parseInt(el.dataset.countTo, 10);
        const suffix = el.dataset.suffix || "";
        const dur = 2000, t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);           // cubic-out
          el.textContent = Math.round(from + (to - from) * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !en.target._counted) {
            en.target._counted = true;
            animate(en.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => io.observe(el));
    }
  }

  /* --- Mot qui tourne (data-rotor) : cycle toutes les 2s.
     Figé sur le mot initial si prefers-reduced-motion. --- */
  const rotor = document.querySelector("[data-rotor]");
  if (rotor) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const words = ["Structure", "EHPAD", "Commune", "Quartier", "CCAS"];
      let i = 0;
      setInterval(() => {
        i = (i + 1) % words.length;
        rotor.style.opacity = "0";
        rotor.style.transform = "translateY(-4px)";
        setTimeout(() => {
          rotor.textContent = words[i];
          rotor.style.opacity = "1";
          rotor.style.transform = "translateY(0)";
        }, 180);
      }, 2000);
    }
  }

  /* --- Carrousel « 2 axes » : swipe horizontal + fondu graduel --- */
  document.querySelectorAll("[data-axes-track]").forEach((track) => {
    const slides = [...track.querySelectorAll("[data-axes-slide]")];
    if (slides.length < 2) return;
    let idx = 0;
    requestAnimationFrame(() => track.classList.add("is-anim"));   // pas d'anim au 1er rendu
    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      slides.forEach((s, i2) => s.setAttribute("aria-hidden", i2 !== idx ? "true" : "false"));
    };
    track.querySelectorAll("[data-axes-next]").forEach((b) => b.addEventListener("click", () => go(idx + 1)));
    track.querySelectorAll("[data-axes-prev]").forEach((b) => b.addEventListener("click", () => go(idx - 1)));
  });
})();
