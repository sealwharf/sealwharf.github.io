/*
 * Sealwharf animated illustrations. The texts live in index.html with
 * data-i18n keys, so the language switch keeps working while they play;
 * this file only shows, hides and times the pieces.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("m-js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Rosette seals, drawn once from data-rosette="cx,cy,outer,inner,points".
  document.querySelectorAll("[data-rosette]").forEach((shape) => {
    const [cx, cy, outer, inner, count] = shape.getAttribute("data-rosette").split(",").map(Number);
    const points = [];
    for (let i = 0; i < count * 2; i += 1) {
      const angle = (i * Math.PI) / count - Math.PI / 2;
      const radius = i % 2 ? inner : outer;
      points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }
    shape.setAttribute("points", points.join(" "));
  });

  // Reveal on scroll.
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".m-reveal").forEach((el) => revealer.observe(el));

  // Repeat a sequence only while its element is on screen.
  const loopWhileVisible = (el, sequence) => {
    let visible = false;
    let running = false;
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible || running) return;
        running = true;
        (async () => {
          while (visible) await sequence();
          running = false;
        })();
      },
      { threshold: 0.3 },
    ).observe(el);
  };

  // ---------- Hero chat ----------
  const chat = document.getElementById("m-chat");
  const status = document.getElementById("m-status");
  if (chat && status) {
    const steps = [...chat.querySelectorAll("[data-step]")];
    const show = (el) => el.classList.add("is-shown");
    const hide = (el) => el.classList.remove("is-shown");
    const typing = (on) => status.classList.toggle("is-typing", on);

    if (reduced) {
      steps.filter((el) => el.dataset.step !== "typing").forEach(show);
    } else {
      const [send, dots1, got, dots2, done] = steps;
      loopWhileVisible(chat, async () => {
        steps.forEach(hide);
        chat.classList.remove("is-fading");
        await wait(700);
        show(send);
        await wait(900);
        typing(true);
        show(dots1);
        await wait(1200);
        hide(dots1);
        typing(false);
        show(got);
        await wait(1100);
        typing(true);
        show(dots2);
        await wait(1700);
        hide(dots2);
        typing(false);
        show(done);
        await wait(4800);
        chat.classList.add("is-fading");
        await wait(600);
      });
    }
  }

  // ---------- Owner approval ----------
  const approve = document.getElementById("m-approve");
  if (approve) {
    new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        approve.classList.add("is-playing");
        observer.disconnect();
      },
      { threshold: 0.35 },
    ).observe(approve);
  }

  // ---------- Document being signed ----------
  const paper = document.getElementById("m-paper");
  if (paper && !reduced) {
    const phases = ["is-scanning", "is-found", "is-signing", "is-stamped"];
    loopWhileVisible(paper, async () => {
      paper.classList.remove(...phases);
      await wait(500);
      paper.classList.add("is-scanning");
      await wait(1500);
      paper.classList.add("is-found");
      await wait(700);
      paper.classList.add("is-signing");
      await wait(1500);
      paper.classList.add("is-stamped");
      await wait(4200);
    });
  } else if (paper) {
    paper.classList.add("is-found", "is-signing", "is-stamped");
  }
})();
