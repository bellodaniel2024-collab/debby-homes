/* ==========================================================================
   DEBBY HOMES — animations.js
   All motion logic: particles, custom cursor, hero word split, parallax,
   magnetic buttons, 3D card tilt, typewriter, page transitions, etc.
   Runs after DOMContentLoaded. Respects prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  /* Reduced motion gate — if true, skip heavy animations */
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    initCustomCursor();
    initParticles();
    initHeroTextAnimation();
    initEnhancedReveal();
    initParallax();
    initMagneticButtons();
    initCardTilt();
    initLocCardTilt();
    initStatShimmer();
    initPageTransition();
    initWaveDividers();
    initCTAOrbs();
    initScrollProgress();
    initImageLazyReveal();
    initNavbarAnimations();
    initSectionEntrance();
  });

  /* ======================================================================
     CUSTOM CURSOR
     ====================================================================== */
  function initCustomCursor() {
    if (REDUCED) return;
    // Cursor elements are injected by index.html; bail if not present
    const dot  = document.getElementById("dh-cursor");
    const ring = document.getElementById("dh-cursor-ring");
    if (!dot || !ring) return;

    let mx = -100, my = -100;  // start off-screen
    let rx = -100, ry = -100;  // ring lags behind

    // Instant dot position
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    // RAF loop — ring lerps toward dot
    (function loop() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      dot.style.left  = mx + "px";
      dot.style.top   = my + "px";
      ring.style.left = rx + "px";
      ring.style.top  = ry + "px";
      requestAnimationFrame(loop);
    })();

    // Hover state on interactive elements
    const hoverTargets = "a, button, input, select, textarea, label, .property-card, .loc-card, .blog-card, .testi-card, .pill-tabs .nav-link";
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    // Click state
    document.addEventListener("mousedown", () => document.body.classList.add("cursor-click"));
    document.addEventListener("mouseup",   () => document.body.classList.remove("cursor-click"));

    // Hide when leaving window
    document.addEventListener("mouseleave", () => {
      dot.style.opacity  = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity  = "1";
      ring.style.opacity = "1";
    });
  }

  /* ======================================================================
     PARTICLES CANVAS (hero)
     ====================================================================== */
  function initParticles() {
    if (REDUCED) return;
    const canvas = document.getElementById("dh-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const GOLD   = "rgba(198,161,91,";
    const WHITE  = "rgba(255,255,255,";
    const COUNT  = 55;
    let W, H;
    let particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function randomParticle() {
      const palette = Math.random() > .4 ? GOLD : WHITE;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + .4,
        alpha: Math.random() * .45 + .05,
        speed: Math.random() * .35 + .1,
        drift: (Math.random() - .5) * .25,
        twinkleSpeed: Math.random() * .012 + .004,
        twinkleDir: Math.random() > .5 ? 1 : -1,
        color: palette,
        shape: Math.random() > .82 ? "diamond" : "circle",
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(randomParticle());

    function drawDiamond(ctx, x, y, r) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    let raf;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        // Twinkle
        p.alpha += p.twinkleSpeed * p.twinkleDir;
        if (p.alpha > .55 || p.alpha < .03) p.twinkleDir *= -1;

        // Drift upward
        p.y -= p.speed;
        p.x += p.drift;

        // Wrap
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color + "1)";

        if (p.shape === "diamond") {
          drawDiamond(ctx, p.x, p.y, p.r * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();

    // Pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else frame();
    });
  }

  /* ======================================================================
     HERO TEXT WORD-BY-WORD ENTRANCE
     ====================================================================== */
  function initHeroTextAnimation() {
    if (REDUCED) return;
    const h1 = document.querySelector(".hero-content h1");
    if (!h1) return;

    // Split h1 into word spans, preserving <em> tags
    const rawHTML = h1.innerHTML;
    // Parse: words outside <em> get span, words inside <em> get span inside em
    const wrapped = rawHTML.replace(
      /(<em>)(.*?)(<\/em>)|([^\s<>]+)/g,
      (match, openEm, emContent, closeEm, word) => {
        if (openEm) {
          // Split content inside <em>
          const emWords = emContent.trim().split(/\s+/).map((w, i, arr) => {
            const space = i < arr.length - 1 ? " " : "";
            return `<span class="hero-title-word" style="animation-delay:${calcDelay(w, emContent, openEm, rawHTML)}s">${w}</span>${space}`;
          }).join("");
          return `${openEm}${emWords}${closeEm}`;
        }
        if (word) {
          const idx = wordIndex(rawHTML, match);
          return `<span class="hero-title-word" style="animation-delay:${(idx * .12 + .7).toFixed(2)}s">${word}</span>`;
        }
        return match;
      }
    );
    h1.innerHTML = wrapped;

    // Simpler sequential approach — re-do after above may have issues, use a direct split
    // Reset and do clean sequential split preserving em
    splitHeroTitle(h1);

    // Animate lead and actions with staggered delays after words
    const wordCount = h1.querySelectorAll(".hero-title-word").length;
    const baseDelay = .7 + wordCount * .11;

    const lead = document.querySelector(".hero-lead-anim");
    const actions = document.querySelector(".hero-actions-anim");
    if (lead)    lead.style.animationDelay    = baseDelay.toFixed(2) + "s";
    if (actions) actions.style.animationDelay = (baseDelay + .15).toFixed(2) + "s";
  }

  function splitHeroTitle(h1) {
    // Walk child nodes and wrap text words in spans
    const nodes = Array.from(h1.childNodes);
    h1.innerHTML = "";
    let wordIndex = 0;

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach(chunk => {
          if (/\s+/.test(chunk)) {
            h1.appendChild(document.createTextNode(chunk));
          } else if (chunk) {
            const span = document.createElement("span");
            span.className = "hero-title-word";
            span.style.animationDelay = (wordIndex * .12 + .7).toFixed(2) + "s";
            span.textContent = chunk;
            h1.appendChild(span);
            wordIndex++;
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "EM") {
        const em = document.createElement("em");
        const words = node.textContent.split(/(\s+)/);
        words.forEach(chunk => {
          if (/\s+/.test(chunk)) {
            em.appendChild(document.createTextNode(chunk));
          } else if (chunk) {
            const span = document.createElement("span");
            span.className = "hero-title-word";
            span.style.animationDelay = (wordIndex * .12 + .7).toFixed(2) + "s";
            span.textContent = chunk;
            em.appendChild(span);
            wordIndex++;
          }
        });
        h1.appendChild(em);
      } else {
        h1.appendChild(node.cloneNode(true));
      }
    });
  }

  // Helpers that are no longer needed but kept to avoid ReferenceError
  function wordIndex() { return 0; }
  function calcDelay() { return .7; }

  /* ======================================================================
     ENHANCED SCROLL REVEAL (directional + stagger)
     ====================================================================== */
  function initEnhancedReveal() {
    // Add directional classes automatically based on position in grid
    document.querySelectorAll(".row .reveal").forEach((el, i) => {
      const siblings = el.closest(".row")?.querySelectorAll(".reveal") || [];
      const total = siblings.length;
      if (total >= 3 && !el.classList.contains("reveal-left") && !el.classList.contains("reveal-right") && !el.classList.contains("reveal-scale")) {
        // Already handled by existing .reveal — add a stagger delay
        el.style.transitionDelay = (Array.from(siblings).indexOf(el) * .12) + "s";
      }
    });

    // Mark stagger containers
    document.querySelectorAll(".pill-tabs, .hero-actions, .footer-links").forEach(el => {
      el.classList.add("stagger-children");
    });

    // Set up IntersectionObserver for directional variants
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal-left, .reveal-right, .reveal-scale, .stagger-children").forEach(el => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal-left, .reveal-right, .reveal-scale, .stagger-children").forEach(el => io.observe(el));
  }

  /* ======================================================================
     PARALLAX — hero media + why section image
     ====================================================================== */
  function initParallax() {
    if (REDUCED) return;

    const heroSlides = document.querySelectorAll(".hero-slide");
    const whyImg     = document.querySelector(".why-media img");

    function onScroll() {
      const sy = window.scrollY;

      // Hero slides — subtle parallax on background-position
      heroSlides.forEach(slide => {
        slide.style.backgroundPositionY = `calc(50% + ${sy * .25}px)`;
      });

      // Why section image
      if (whyImg) {
        const section = whyImg.closest("section");
        if (section) {
          const rect = section.getBoundingClientRect();
          const progress = -rect.top / window.innerHeight;
          whyImg.style.transform = `scale(1.12) translateY(${progress * 30}px)`;
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ======================================================================
     MAGNETIC BUTTONS
     ====================================================================== */
  function initMagneticButtons() {
    if (REDUCED) return;
    document.querySelectorAll(".btn-gold, .btn-navy, .btn-outline-navy").forEach(btn => {
      btn.classList.add("btn-magnetic");

      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * .28;
        const dy   = (e.clientY - cy) * .28;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ======================================================================
     3D TILT — property cards
     ====================================================================== */
  function initCardTilt() {
    if (REDUCED) return;
    document.querySelectorAll(".property-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - .5;
        const y = (e.clientY - rect.top)  / rect.height - .5;
        card.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    // Re-attach for dynamically rendered cards
    const grids = document.querySelectorAll("#featuredGrid, #apartmentsGrid, #shortletsGrid, #saleGrid, #listingGrid");
    grids.forEach(grid => {
      const observer = new MutationObserver(() => {
        grid.querySelectorAll(".property-card:not([data-tilt])").forEach(card => {
          card.setAttribute("data-tilt", "1");
          attachCardTilt(card);
        });
      });
      if (grid) observer.observe(grid, { childList: true });
    });
  }

  function attachCardTilt(card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - .5;
      const y = (e.clientY - rect.top)  / rect.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  }

  /* ======================================================================
     3D TILT — location cards
     ====================================================================== */
  function initLocCardTilt() {
    if (REDUCED) return;
    document.querySelectorAll(".loc-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - .5;
        const y = (e.clientY - rect.top)  / rect.height - .5;
        card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale(1.03)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ======================================================================
     STAT COUNTER SHIMMER
     Adds .counted class after the counter animation finishes
     ====================================================================== */
  function initStatShimmer() {
    if (REDUCED) return;
    document.querySelectorAll("[data-counter]").forEach(el => {
      // The counter animation runs ~1.6s; add shimmer once it's done
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("counted"), 1800);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .6 });
      io.observe(el);
    });
  }

  /* ======================================================================
     PAGE TRANSITION ENTRANCE
     ====================================================================== */
  function initPageTransition() {
    const main = document.querySelector("main, .hero, .page-banner");
    if (main) main.classList.add("page-enter");
  }

  /* ======================================================================
     WAVE SVG DIVIDERS — inject between key sections
     ====================================================================== */
  function initWaveDividers() {
    // Add a wave between stats-band and the section below it
    const statsBand = document.querySelector(".stats-band");
    if (!statsBand) return;

    statsBand.classList.add("wave-divider");
    statsBand.style.position = "relative";

    const bottomWave = document.createElement("div");
    bottomWave.className = "wave-divider-bottom";
    bottomWave.innerHTML = `
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--ivory)"/>
      </svg>`;
    statsBand.appendChild(bottomWave);

    const topWave = document.createElement("div");
    topWave.className = "wave-divider-top";
    topWave.innerHTML = `
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--ivory-2)"/>
      </svg>`;
    statsBand.appendChild(topWave);
  }

  /* ======================================================================
     CTA BANNER ORBS — inject markup
     ====================================================================== */
  function initCTAOrbs() {
    const cta = document.querySelector(".cta-banner");
    if (!cta) return;
    if (!cta.querySelector(".orb")) {
      cta.insertAdjacentHTML("afterbegin", `
        <div class="orb orb-1" aria-hidden="true"></div>
        <div class="orb orb-2" aria-hidden="true"></div>
      `);
    }
  }

  /* ======================================================================
     SCROLL PROGRESS BAR (thin gold line at top of page)
     ====================================================================== */
  function initScrollProgress() {
    if (REDUCED) return;
    const bar = document.createElement("div");
    bar.id = "dh-scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-light));
      z-index: 10001;
      pointer-events: none;
      transition: width .1s linear;
    `;
    document.body.appendChild(bar);

    window.addEventListener("scroll", () => {
      const scrolled  = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = maxScroll > 0 ? ((scrolled / maxScroll) * 100).toFixed(1) + "%" : "0%";
    }, { passive: true });
  }

  /* ======================================================================
     IMAGE LAZY REVEAL — fade images in as they load
     ====================================================================== */
  function initImageLazyReveal() {
    if (REDUCED) return;
    document.querySelectorAll("img[loading='lazy']").forEach(img => {
      img.style.opacity = "0";
      img.style.transition = "opacity .6s ease";
      if (img.complete) {
        img.style.opacity = "1";
      } else {
        img.addEventListener("load", () => {
          img.style.opacity = "1";
        }, { once: true });
      }
    });
  }

  /* ======================================================================
     NAVBAR LINK HOVER — re-attach for cursor hover tracking
     ====================================================================== */
  function initNavbarAnimations() {
    // Logo text scramble on hover (subtle, single character cycle)
    if (REDUCED) return;
    const brand = document.querySelector(".navbar-brand");
    if (!brand) return;

    const originalText = brand.textContent.trim(); // e.g. "DebbyHomes"
    // We just add a subtle glow class on hover instead of scramble
    brand.addEventListener("mouseenter", () => brand.style.textShadow = "0 0 30px rgba(198,161,91,.45)");
    brand.addEventListener("mouseleave", () => brand.style.textShadow = "");
  }

  /* ======================================================================
     SECTION ENTRANCE HELPER
     Adds stagger delays to cards in a reveal grid
     ====================================================================== */
  function initSectionEntrance() {
    // Stagger property cards in featured section
    document.querySelectorAll(".tab-pane .row, #featuredGrid").forEach(row => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".property-card").forEach((card, i) => {
              card.style.transitionDelay = (i * .08) + "s";
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .05 });
      if (row) io.observe(row);
    });

    // Stagger location cards
    const locRow = document.querySelector(".section .row:has(.loc-card)");
    if (locRow) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".col-lg-3").forEach((col, i) => {
              col.style.transition = `opacity .6s ${i * .12}s ease, transform .6s ${i * .12}s cubic-bezier(.16,1,.3,1)`;
              col.style.opacity = "1";
              col.style.transform = "translateY(0)";
            });
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .1 });
      io.observe(locRow);

      // Set initial state
      locRow.querySelectorAll(".col-lg-3").forEach(col => {
        col.style.opacity = "0";
        col.style.transform = "translateY(32px)";
      });
    }

    // Stagger blog cards
    document.querySelectorAll(".section .row:has(.blog-card)").forEach(row => {
      row.querySelectorAll(".col-lg-4").forEach((col, i) => {
        col.style.opacity = "0";
        col.style.transform = "translateY(32px)";
        col.style.transition = `opacity .65s ${i * .13}s ease, transform .65s ${i * .13}s cubic-bezier(.16,1,.3,1)`;
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".col-lg-4").forEach(col => {
              col.style.opacity = "1";
              col.style.transform = "translateY(0)";
            });
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .1 });
      io.observe(row);
    });

    // Stagger testimonial cards
    const testiRow = document.querySelector(".section .row:has(.testi-card)");
    if (testiRow) {
      testiRow.querySelectorAll(".col-lg-4").forEach((col, i) => {
        col.style.opacity = "0";
        col.style.transform = `translateY(28px) scale(.97)`;
        col.style.transition = `opacity .65s ${i * .15}s ease, transform .65s ${i * .15}s cubic-bezier(.16,1,.3,1)`;
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".col-lg-4").forEach(col => {
              col.style.opacity = "1";
              col.style.transform = "translateY(0) scale(1)";
            });
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .1 });
      io.observe(testiRow);
    }

    // Why section — slide left image, slide right text
    const whySection = document.querySelector(".section.bg-ivory-2 .row");
    if (whySection) {
      const [imgCol, txtCol] = whySection.querySelectorAll(":scope > .col-lg-6");
      if (imgCol && txtCol) {
        if (!REDUCED) {
          imgCol.classList.add("reveal-left");
          txtCol.classList.add("reveal-right");
          // Remove default .reveal class to avoid conflict
          imgCol.classList.remove("reveal");
          txtCol.classList.remove("reveal");
        }
      }
    }
  }

})();
