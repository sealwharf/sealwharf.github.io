/*
 * Sealwharf i18n: swaps the text of every [data-i18n] element. English is
 * read from the page itself on load, so it never needs a second copy.
 *
 * Initial language: a ?lang= parameter in the address, then a previous
 * explicit choice (localStorage), then the browser language when it is PT
 * or ES, then English.
 */
(() => {
  "use strict";

  const SUPPORTED = ["en", "pt", "es"];
  const HTML_LANG = { en: "en", pt: "pt-BR", es: "es" };
  const STORAGE_KEY = "sealwharf.lang";
  const T = window.SEALWHARF_TRANSLATIONS || {};
  const english = {};

  const readStored = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const store = (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private windows may block storage; the choice then lasts one visit.
    }
  };

  const detectLanguage = () => {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.includes(param)) return param;
    const saved = readStored();
    if (SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : "en";
  };

  const readValue = (el) => {
    const attr = el.getAttribute("data-i18n-attr");
    return attr ? el.getAttribute(attr) : el.textContent.trim().replace(/\s+/g, " ");
  };

  const writeValue = (el, value) => {
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) el.setAttribute(attr, value);
    else el.textContent = value;
  };

  const captureEnglish = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!(key in english)) english[key] = readValue(el);
    });
  };

  const translate = (key, lang) => {
    const dict = T[lang] || {};
    return dict[key] ?? english[key];
  };

  const applyLanguage = (requested) => {
    const lang = SUPPORTED.includes(requested) ? requested : "en";
    document.documentElement.setAttribute("lang", HTML_LANG[lang]);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = translate(el.getAttribute("data-i18n"), lang);
      if (value != null) writeValue(el, value);
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    store(lang);
  };

  const text = (key) => {
    const lang = readStored() || "en";
    return translate(key, lang);
  };

  captureEnglish();
  english["start.copied"] = "Copied";
  applyLanguage(detectLanguage());

  document.querySelector(".lang-switch")?.addEventListener("click", (event) => {
    const btn = event.target.closest(".lang-btn");
    if (btn) applyLanguage(btn.getAttribute("data-lang"));
  });

  window.SealwharfI18n = { apply: applyLanguage, text };
})();
