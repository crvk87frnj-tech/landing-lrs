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
    const scope = track.closest(".axes") || document;                 // flèches désormais SOUS le carrousel
    const nextBtns = [...scope.querySelectorAll("[data-axes-next]")];
    const prevBtns = [...scope.querySelectorAll("[data-axes-prev]")];
    let idx = 0;
    requestAnimationFrame(() => track.classList.add("is-anim"));       // pas d'anim au 1er rendu
    const sync = () => {   // 1 seule flèche par page : « → » sauf en fin, « ← » sauf au début
      prevBtns.forEach((b) => (b.hidden = idx <= 0));
      nextBtns.forEach((b) => (b.hidden = idx >= slides.length - 1));
    };
    const go = (n) => {
      idx = Math.max(0, Math.min(slides.length - 1, n));               // clamp (pas de boucle)
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      slides.forEach((s, i2) => s.setAttribute("aria-hidden", i2 !== idx ? "true" : "false"));
      sync();
    };
    nextBtns.forEach((b) => b.addEventListener("click", () => go(idx + 1)));
    prevBtns.forEach((b) => b.addEventListener("click", () => go(idx - 1)));
    sync();
  });

  /* --- Banderole partenaires : défilement horizontal (flèche + fondu).
     La flèche n'apparaît que s'il y a du contenu à droite ; le fondu
     disparaît en fin de course. --- */
  (function partnersScroll() {
    const row = document.querySelector(".partners__logos");
    const next = document.querySelector(".partners__next");
    if (!row) return;
    const step = () => Math.max(160, Math.round(row.clientWidth * 0.75));
    const sync = () => {
      const max = row.scrollWidth - row.clientWidth - 1;
      const atEnd = row.scrollLeft >= max;
      const noScroll = row.scrollWidth <= row.clientWidth + 1;
      if (next) next.hidden = noScroll || atEnd;
      row.classList.toggle("is-end", noScroll || atEnd);
    };
    if (next) next.addEventListener("click", () => row.scrollBy({ left: step(), behavior: "smooth" }));
    row.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    sync();
  })();

  /* --- 4 plans : déroulé MOBILE (« Moteur » visible, les 3 autres masqués) ---
     Panneau ouvert par défaut (CSS) → JS le ferme en mobile (sans JS = tout
     visible). Inerte en desktop (le panneau est en display:contents). */
  (function () {
    const btn = document.querySelector("[data-plans-toggle]");
    const panel = document.querySelector("[data-plans-panel]");
    if (!btn || !panel) return;
    const mq = window.matchMedia("(max-width: 760px)");
    const wrap = document.querySelector(".plans4");
    const isOpen = () => !!wrap && wrap.classList.contains("is-plans-open");
    const setOpen = (open) => {
      if (wrap) wrap.classList.toggle("is-plans-open", open);
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "";
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Masquer les plans" : "Voir les 3 autres plans");
    };
    const sync = () => {
      if (mq.matches) {
        setOpen(isOpen());
      } else {
        if (wrap) wrap.classList.remove("is-plans-open");
        panel.style.maxHeight = "";
        btn.setAttribute("aria-expanded", "false");
      }
    };
    btn.setAttribute("aria-expanded", "false");
    sync();
    btn.addEventListener("click", () => {
      if (mq.matches) setOpen(!isOpen());
    });
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
  })();
})();
