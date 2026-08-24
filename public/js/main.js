(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // --- Паралакс: скрол + курсор ---
  const scenes = [];
  if (!reduce) {
    document.querySelectorAll("[data-parallax]").forEach((scene) => {
      const layers = Array.from(scene.querySelectorAll("[data-speed]")).map((el) => ({
        el,
        speed: Number(el.dataset.speed || 0),
      }));
      if (layers.length) scenes.push({ scene, layers, mx: 0, my: 0, sx: 0, sy: 0 });
    });
  }

  if (scenes.length) {
    // Паралакс від курсора — лише для точних вказівників (миша/трекпад)
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener(
        "pointermove",
        (e) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          scenes.forEach((s) => {
            const r = s.scene.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            s.mx = nx;
            s.my = ny;
          });
        },
        { passive: true }
      );
    }

    function applyParallax() {
      scenes.forEach((s) => {
        const rect = s.scene.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
        // Плавна інтерполяція зсуву миші для м'якого руху
        s.sx += (s.mx - s.sx) * 0.06;
        s.sy += (s.my - s.sy) * 0.06;
        const shift = rect.top;
        s.layers.forEach((l) => {
          const depth = Math.abs(l.speed);
          const y = -shift * l.speed + s.sy * depth * 42;
          const x = s.sx * depth * 64;
          l.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        });
      });
      requestAnimationFrame(applyParallax);
    }
    requestAnimationFrame(applyParallax);
  }

  const canvas = document.querySelector("[data-bubbles]");
  if (canvas && canvas.getContext && !reduce) {
    const ctx = canvas.getContext("2d");
    const bubbles = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 4,
      v: 0.15 + Math.random() * 0.4,
    }));
    function size() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    }
    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(180, 230, 240, 0.28)";
      bubbles.forEach((b) => {
        b.y -= b.v / 140;
        if (b.y < -0.05) b.y = 1.05;
        ctx.beginPath();
        ctx.arc(b.x * w, b.y * h, b.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    size();
    window.addEventListener("resize", size);
    draw();
  }

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const key = btn.dataset.filter;
      document.querySelectorAll("#species-list [data-habitat]").forEach((card) => {
        card.hidden = key !== "all" && card.dataset.habitat !== key;
      });
    });
  });

  document.querySelectorAll("[data-gallery]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-gallery]").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const key = btn.dataset.gallery;
      document.querySelectorAll("#gallery [data-cat]").forEach((item) => {
        item.hidden = key !== "all" && item.dataset.cat !== key;
      });
    });
  });

  const box = document.getElementById("lightbox");
  if (box) {
    const img = box.querySelector("img");
    const cap = box.querySelector(".lightbox-caption, .lightbox-caption");
    document.querySelectorAll("[data-lightbox]").forEach((btn) => {
      btn.addEventListener("click", () => {
        img.src = btn.dataset.lightbox;
        img.alt = btn.dataset.caption || "";
        cap.textContent = btn.dataset.caption || "";
        box.hidden = false;
      });
    });
    box.querySelector("[data-close]").addEventListener("click", () => {
      box.hidden = true;
      img.src = "";
    });
    box.addEventListener("click", (e) => {
      if (e.target === box) {
        box.hidden = true;
        img.src = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        box.hidden = true;
        img.src = "";
      }
    });
  }

  const form = document.querySelector("[data-validate]");
  if (form) {
    form.addEventListener("submit", (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    });
  }
})();
