# ASTITVA '26 — LNJPIT Chhapra · College Fest Website

Mobile-first, static, zero dependencies. No build step, no backend — upload the folder and it's live.
**Fest: 04–08 September 2026** · Loknayak Jai Prakash Institute of Technology, Chhapra, Bihar.

## Files

```
fest-site/
├── index.html             Home: hero + countdown · about · register-by-category · gallery
├── events.html            ⏳ COMING SOON (full 21-event list kept, hidden)
├── schedule.html          ⏳ COMING SOON (full 3-day timeline kept, hidden)
├── register.html          8 live category buttons + 20 "to be updated soon" + Contact Us
├── coordinators.html      10 cards (1 dummy photo + 9 placeholders)
├── organising-team.html   10 cards (1 dummy photo + 9 placeholders)
├── about-us.html          About the fest, the college, and contact + map
├── 404.html               Styled "page not found"
├── assets/
│   ├── css/style.css      Design system (mobile base → wider at 600/900/1200px)
│   ├── js/main.js         All interactions + the Google Form + countdown config
│   └── img/
│       ├── festlogo.png   your logo
│       ├── hero.jpg  about.jpg
│       ├── team/dummy-avatar.jpg   placeholder avatar
│       └── gallery/       10 photos (add as many as you want)
└── README.md
```

## Run locally

```bash
cd fest-site
python3 -m http.server 3000
# open http://localhost:3000
```

## Deploy (GitHub Pages / Netlify / Vercel / cPanel)

Upload the **contents** of this folder — `index.html` must sit at the top level,
next to `assets/`. If your upload has this folder *inside* another folder, the host
shows 404. A ready-made zip is provided: **`astitva26-deploy.zip`** (extract it, upload
the loose files).

---

## 1. ⏳ Turn Events and Schedule back on

Both pages currently show a **Coming Soon** block. Nothing was deleted — the real
content is still in the file, wrapped in one hidden container.

In `events.html` and `schedule.html` look for:

```html
<!-- 🔒  HIDDEN FOR NOW — "COMING SOON" IS SHOWING INSTEAD
     TO RESTORE: delete the attribute  hidden  from the line below -->
<div class="keep-for-later" hidden>
   ... all the old content ...
</div>
```

**To restore:** delete just the word `hidden` (and delete the Coming Soon
`<section class="section" id="coming-soon">` above it). That's it.

## 2. Connect the Google Forms

Open `assets/js/main.js` → `CONFIG` at the very top:

```js
forms: {
  default: "https://docs.google.com/forms/d/e/YOUR-FORM-ID/viewform",
  // sports: "https://docs.google.com/forms/d/e/SPORTS/viewform",
}
```

Keys in use: `cultural`, `sports`, `debate`, `esports`, `technical`, `literary`, `art`, `general`.
Every Register button opens in a new tab.

**The 20 "to be updated soon" buttons** on `register.html` are `<div>`s, not links. When a
form is ready, change one to:

```html
<a class="regbtn reveal" href="YOUR-FORM-LINK" data-form="cultural"> ... </a>
```

(just swap `<div class="regbtn regbtn--soon" aria-disabled="true">` → `<a class="regbtn" href="...">`
and the closing `</div>` → `</a>`, then drop the `<span class="tag-soon">` line).

## 3. Fill in Coordinators & Organising Team

Each page has 10 cards. The first card is a real `<article class="pcard">` with the dummy
photo — replace the image, name, role and the two contact lines. The other 9 are
`pcard__img--soon` placeholders. To convert one, copy the first card and edit:

```html
<article class="pcard reveal">
  <div class="pcard__img"><img src="assets/img/team/NAME.jpg" alt="Name" loading="lazy" /></div>
  <div class="pcard__body">
    <strong>Name</strong>
    <span class="pcard__role">Role</span>
    <a class="pcard__contact" href="tel:+91XXXXXXXXXX">📞 +91 XXXXX XXXXX</a>
    <a class="pcard__contact" href="mailto:id@lnjpit.ac.in">✉️ id@lnjpit.ac.in</a>
  </div>
</article>
```

Drop photos in `assets/img/team/`. Cards go 1 → 2 → 3 → 4 per row as the screen widens.

## 4. Dates & countdown

`assets/js/main.js` → `CONFIG.festStart` / `festEnd` (currently `2026-09-04` → `2026-09-08`).
The countdown switches to "Live now" automatically once the start time passes.

## 5. Other edits

| What | Where |
|---|---|
| College name / email / phone / PIN | Footers, `register.html` contact block, `about-us.html` |
| Map | The `<iframe src="https://maps.google.com/maps?q=...">` on `register.html` and `about-us.html` (already set to LNJPIT Chhapra) |
| Social links | Footer of every page (`href="#"`) |
| Logo | `assets/img/festlogo.png` — size lives in `style.css` under `.brand__logo` (46px phone / 56px desktop) |
| Colours | `assets/css/style.css` → `:root` |
| Gallery photos | `assets/img/gallery/` + copy a `<figure class="gitem reveal">` block in `index.html` (add `is-hidden` to keep it behind "View all photos") |
| Menu | Header + drawer markup, identical on every page (7 items; the horizontal bar shows from 1200px, hamburger below that) |

**Placeholders to replace before going live:** phone `+91 12345 67890`, email
`astitva@lnjpit.ac.in`, Instagram handle, PIN `841301`, the four hero stats
(10 events · 5 days · 5000 footfall · ₹50,000), and every name on the team pages.

---

## Mobile-first notes

- Base CSS is written for a phone; `min-width` breakpoints at **600 / 900 / 1200px** add wider layouts.
- Seven menu items don't fit a phone or a small laptop, so the **hamburger stays until 1200px**;
  above that the full bar appears on one row.
- Sticky bottom bar (phones only) keeps *Get Registered* one thumb away; it slides away at the footer.
- All tap targets ≥ 44px, content reveals on scroll, `prefers-reduced-motion` turns animations off.

## Tested

Headless Chrome on **390 × 844** (phone), **768** (tablet), **1280** and **1440** (desktop):
no console or runtime errors, no horizontal overflow, 7-item menu opens and closes, Coming
Soon blocks show with old content preserved, 8 + 20 registration buttons, 10 cards per team
page, map set to LNJPIT Chhapra, countdown live at 5 days.
