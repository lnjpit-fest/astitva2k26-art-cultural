/* ============================================================
   ZEPHYR '26 — interactions (vanilla JS, no dependencies)
   Mobile-first. Everything here is optional: the pages still
   work if JS is off (links are real links).
   ============================================================ */

/* ------------------------------------------------------------
   ✏️  EDIT THIS BLOCK
   ------------------------------------------------------------ */
const CONFIG = {
  // countdown target (local time)
  festStart: "2026-09-04T09:00:00",
  festEnd:   "2026-09-08T22:00:00",

  /* Google Form links.
     "default" is used for every button that has data-form.
     Add an entry below to send one category to its own form —
     the key must match the data-form value in the HTML.        */
  forms: {
    default: "https://docs.google.com/forms/d/e/YOUR-FORM-ID/viewform",
    // sports:   "https://docs.google.com/forms/d/e/SPORTS-FORM-ID/viewform",
    // debate:   "https://docs.google.com/forms/d/e/DEBATE-FORM-ID/viewform",
    // esports:  "https://docs.google.com/forms/d/e/ESPORTS-FORM-ID/viewform",
  }
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCountdown();
  initReveal();
  initCounters();
  initFilters();
  initSchedule();
  initGallery();
  initFormLinks();
  initProgress();
  initActionBar();
  initCopy();
});

/* ---------- small toast (used by copy buttons) ---------- */
let toastTimer;
function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<i></i><span></span>';
    document.body.appendChild(t);
  }
  t.querySelector("span").textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ============================================================
   1. Header + hamburger drawer
   ============================================================ */
function initNav() {
  const header = $(".header");
  const burger = $(".burger");
  const drawer = $(".drawer");
  if (!header) return;

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // mark the current page in nav + drawer
  const here = location.pathname.split("/").pop() || "index.html";
  $$(".nav__link, .drawer__links a").forEach(a => {
    const href = (a.getAttribute("href") || "").split("#")[0];
    if (href && href === here) a.classList.add("active");
  });

  if (!burger || !drawer) return;
  const open  = () => {
    drawer.classList.add("open");
    burger.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };
  const close = () => {
    drawer.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  burger.addEventListener("click", () =>
    drawer.classList.contains("open") ? close() : open());
  $(".drawer__backdrop")?.addEventListener("click", close);
  $(".drawer__close")?.addEventListener("click", close);
  drawer.addEventListener("click", e => { if (e.target.closest("a")) close(); });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.classList.contains("open")) close();
  });
}

/* ============================================================
   2. Countdown
   ============================================================ */
function initCountdown() {
  const cd = $(".cd");
  if (!cd) return;
  const units = $$("[data-count]", cd);
  const target = new Date(CONFIG.festStart).getTime();
  const end = new Date(CONFIG.festEnd).getTime();

  const pad = n => String(n).padStart(2, "0");

  const render = () => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      const live = now < end;
      cd.classList.add("cd--done");
      cd.innerHTML = `<div class="cd__unit"><span class="cd__num">${
        live ? "🎉 Live now" : "See you next year"}</span><span class="cd__lbl">${
        live ? "The fest is on" : "Thanks for the memories"}</span></div>`;
      return true;
    }

    const vals = {
      days:  Math.floor(diff / 864e5),
      hours: Math.floor(diff / 36e5) % 24,
      mins:  Math.floor(diff / 6e4) % 60,
      secs:  Math.floor(diff / 1e3) % 60,
    };

    units.forEach(u => {
      const numEl = u.querySelector(".cd__num");
      const val = pad(vals[u.dataset.count]);
      if (numEl.textContent !== val) {
        numEl.textContent = val;
        if (!reduceMotion) {
          numEl.classList.remove("tick");
          void numEl.offsetWidth;
          numEl.classList.add("tick");
        }
      }
    });
    return false;
  };

  if (!render()) {
    const id = setInterval(() => { if (render()) clearInterval(id); }, 1000);
  }
}

/* ============================================================
   3. Reveal on scroll (text + images)
   ============================================================ */
function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in"));
    return;
  }

  // stagger siblings inside the same container
  const seen = new Map();
  items.forEach(el => {
    const p = el.parentElement;
    const n = seen.get(p) || 0;
    seen.set(p, n + 1);
    el.style.transitionDelay = Math.min(n, 6) * 0.07 + "s";
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

  items.forEach(i => io.observe(i));
}

/* ============================================================
   4. Stat counters
   ============================================================ */
function initCounters() {
  const nums = $$("[data-count-to]");
  if (!nums.length) return;
  const run = el => {
    const to = +el.dataset.countTo;
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nums.forEach(n => n.textContent = (+n.dataset.countTo).toLocaleString("en-IN"));
    return;
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
}

/* ============================================================
   5. Event filters
   ============================================================ */
function initFilters() {
  const bar = $(".filters");
  if (!bar) return;
  const cards = $$(".ecard");
  const empty = $(".empty");

  bar.addEventListener("click", e => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", bar).forEach(b => b.classList.toggle("active", b === btn));

    const cat = btn.dataset.filter;
    const before = new Map();
    cards.forEach(c => { if (!c.classList.contains("hide")) before.set(c, c.getBoundingClientRect()); });

    let shown = 0;
    cards.forEach(c => {
      const match = cat === "all" || c.dataset.cat === cat;
      c.classList.toggle("hide", !match);
      if (match) shown++;
    });
    if (empty) empty.hidden = shown !== 0;

    if (reduceMotion) return;

    cards.forEach((c, i) => {
      if (c.classList.contains("hide")) return;
      const last = c.getBoundingClientRect();
      const f = before.get(c);
      if (f) {
        const dx = f.left - last.left, dy = f.top - last.top;
        if (dx || dy) {
          c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }],
                    { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" });
        }
      } else {
        c.classList.remove("enter");
        void c.offsetWidth;
        c.style.animationDelay = (i % 6) * 0.05 + "s";
        c.classList.add("enter");
      }
    });
  });
}

/* ============================================================
   6. Schedule tabs + timeline progress
   ============================================================ */
function initSchedule() {
  const tabs = $(".days");
  if (!tabs) return;
  const btns = $$(".day", tabs);
  const pill = $(".days__pill");
  const panels = $$(".day-panel");
  const tl = $(".timeline");
  const fill = $(".timeline__fill");

  const movePill = btn => {
    if (!pill || !btn) return;
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
  };

  const select = i => {
    btns.forEach((b, j) => {
      b.classList.toggle("active", i === j);
      b.setAttribute("aria-selected", i === j);
    });
    panels.forEach((p, j) => p.classList.toggle("active", i === j));
    movePill(btns[i]);
    updateFill();
  };

  function updateFill() {
    if (!tl || !fill) return;
    const r = tl.getBoundingClientRect();
    const start = r.top + window.scrollY;
    const total = r.height;
    const p = (window.scrollY + window.innerHeight * 0.6 - start) / total;
    fill.style.height = Math.max(0, Math.min(1, p)) * total + "px";
  }

  tabs.addEventListener("click", e => {
    const b = e.target.closest(".day");
    if (b) select(btns.indexOf(b));
  });

  const active = Math.max(0, btns.findIndex(b => b.classList.contains("active")));
  select(active);
  // fonts can shift widths — reposition once they're ready
  if (document.fonts?.ready) document.fonts.ready.then(() => movePill(btns[active]));

  window.addEventListener("scroll", updateFill, { passive: true });
  window.addEventListener("resize", () => {
    movePill(tabs.querySelector(".day.active"));
    updateFill();
  });
}

/* ============================================================
   7. Gallery: lightbox + "show all"
   ============================================================ */
function initGallery() {
  const grid = $(".gallery__grid");
  if (!grid) return;

  // reveal the rest of the photos
  const moreBtn = $(".gallery__more button");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      const hidden = $$(".gitem.is-hidden", grid);
      hidden.forEach((el, i) => {
        el.classList.remove("is-hidden");
        el.classList.add("reveal");
        el.style.transitionDelay = Math.min(i, 8) * 0.05 + "s";
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
      });
      moreBtn.closest(".gallery__more").style.display = "none";
    });
  }

  // lightbox
  const box = $(".lightbox");
  if (!box) return;
  const imgEl = $(".lightbox__img", box);
  const capEl = $(".lightbox__cap", box);
  const cntEl = $(".lightbox__count", box);
  let list = [], idx = 0;

  const current = () => $$(".gitem:not(.is-hidden)", grid);

  const show = i => {
    list = current();
    idx = (i + list.length) % list.length;
    const item = list[idx];
    const img = item.querySelector("img");
    imgEl.src = img.getAttribute("src");
    imgEl.alt = img.getAttribute("alt") || "";
    capEl.textContent = item.dataset.cap || "";
    cntEl.textContent = `${idx + 1} / ${list.length}`;
  };

  const open = i => { show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; };
  const close = () => { box.classList.remove("open"); document.body.style.overflow = ""; };

  grid.addEventListener("click", e => {
    const item = e.target.closest(".gitem");
    if (!item) return;
    open(current().indexOf(item));
  });

  $(".lightbox__close", box)?.addEventListener("click", close);
  $(".lightbox__btn--prev", box)?.addEventListener("click", () => show(idx - 1));
  $(".lightbox__btn--next", box)?.addEventListener("click", () => show(idx + 1));
  box.addEventListener("click", e => { if (e.target === box) close(); });
  window.addEventListener("keydown", e => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  // swipe on mobile
  let x0 = null;
  box.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) show(dx < 0 ? idx + 1 : idx - 1);
    x0 = null;
  });
}

/* ============================================================
   8. Google Form links (single place to edit — CONFIG.forms)
   ============================================================ */
function initFormLinks() {
  const links = $$("[data-form]");
  if (!links.length) return;
  links.forEach(a => {
    const key = a.dataset.form;
    const url = CONFIG.forms[key] || CONFIG.forms.default;
    if (url && !/YOUR-FORM-ID/.test(url)) a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
}

/* ============================================================
   9. Scroll progress bar
   ============================================================ */
function initProgress() {
  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);
  let raf = null;
  const update = () => {
    raf = null;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
  };
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ============================================================
   10. Mobile action bar — hides when the footer is visible
   ============================================================ */
function initActionBar() {
  const bar = $(".actionbar");
  const footer = $(".footer");
  if (!bar || !footer || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(es => {
    es.forEach(e => bar.classList.toggle("hide", e.isIntersecting));
  }, { rootMargin: "0px 0px -10% 0px" }).observe(footer);
}

/* ============================================================
   11. Tap-to-copy (contact details)
   ============================================================ */
function initCopy() {
  $$("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        toast("Copied: " + text);
      } catch {
        toast("Copy failed — select it manually");
      }
    });
  });
}
