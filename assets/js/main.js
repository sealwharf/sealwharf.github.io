/*
 * Sealwharf UI interactions: mobile navigation and copy-to-clipboard.
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
