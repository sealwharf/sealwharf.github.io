/*
 * Sealwharf UI interactions: mobile navigation, smooth in-page scrolling,
 * the current-section marker in the menu and copy-to-clipboard.
 */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");

  const setMenu = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  if (header && toggle) {
    toggle.addEventListener("click", () => setMenu(!header.classList.contains("nav-open")));
    header.querySelector(".main-nav")?.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  // Smooth, unhurried scrolling for in-page links; "#top" goes to the very top.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = () => (header ? header.offsetHeight : 0) + 12;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let scrollAnimation = 0;

  const scrollToY = (targetY) => {
    const startY = window.scrollY;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const endY = Math.max(0, Math.min(targetY, maxY));
    const distance = endY - startY;
    cancelAnimationFrame(scrollAnimation);
    if (reduceMotion || Math.abs(distance) < 2) {
      window.scrollTo(0, endY);
      return;
    }
    const duration = Math.min(1500, Math.max(700, Math.abs(distance) * 0.45));
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, startY + distance * ease(progress));
      if (progress < 1) scrollAnimation = requestAnimationFrame(step);
    };
    scrollAnimation = requestAnimationFrame(step);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const hash = link.getAttribute("href");
    const target = hash === "#top" ? null : document.querySelector(hash);
    if (hash !== "#top" && !target) return;
    event.preventDefault();
    const y = target ? target.getBoundingClientRect().top + window.scrollY - headerOffset() : 0;
    scrollToY(y);
    history.pushState(null, "", hash === "#top" ? window.location.pathname + window.location.search : hash);
    if (target && link.classList.contains("skip-link")) target.focus({ preventScroll: true });
  });

  // Highlight the menu entry of the section on screen.
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;

  const markCurrent = () => {
    ticking = false;
    const line = window.innerHeight * 0.35;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    if (atBottom && sections.length) current = sections[sections.length - 1];
    navLinks.forEach((a) => {
      const active = current && a.getAttribute("href") === `#${current.id}`;
      a.classList.toggle("is-active", Boolean(active));
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(markCurrent);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", markCurrent);
  markCurrent();

  const label = (key, fallback) => window.SealwharfI18n?.text(key) ?? fallback;

  const showCopied = (btn) => {
    const original = btn.textContent;
    btn.textContent = label("start.copied", "Copied");
    btn.classList.add("is-done");
    setTimeout(() => {
      btn.textContent = label("start.copy", original);
      btn.classList.remove("is-done");
    }, 1800);
  };

  document.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-copy-target]");
    if (!btn) return;
    const target = document.querySelector(btn.getAttribute("data-copy-target"));
    if (!target || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      showCopied(btn);
    } catch {
      // Clipboard access was refused; the code stays selectable by hand.
    }
  });
})();
