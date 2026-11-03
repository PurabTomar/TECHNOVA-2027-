# TECHNOVA 2027 • Code Crack 3.0 Hackathon & Tech-Cultural Fest

Fully static website. Works by double-clicking `index.html`. Zero build step, zero npm, zero fetch, zero ES modules.

---

## How to Run (2 steps)

1. Open the `technova-2027/` folder in File Explorer.
2. Double-click `index.html`. Done.

For test output: open `schedule.html?test=1` in a browser and check the DevTools Console (`F12`). You will see 4 automated schedule overlap assertions all pass.

---

## How to Change the Theme (2 minutes)

Open `js/theme.js` and change **one line**:

```js
const ACTIVE_THEME = 'space'; // ← change to: 'retro' or 'nature'
```

Save and refresh. The entire site switches:
- All colors from `css/variables.css` (one block per theme, zero hardcoded values elsewhere)
- All narrative copy (hero kicker, tagline, countdown banners, footer note, section titles) from `THEME_PRESETS[ACTIVE_THEME].copy` in `js/theme.js`
- Web font loaded asynchronously by `js/theme.js` (offline safe — system fonts always used as fallback)

| Theme | Palette | Mood |
|-------|---------|------|
| `space` | Deep navy + neon cyan | Cosmic hackathon |
| `retro` | Dark amber + vermilion | CRT arcade fest |
| `nature` | Emerald + golden sunbeam | Eco summit |

---

## Folder Structure

```
technova-2027/
│
├── index.html         # Hero (2-col desktop), countdown, stats, featured cards
├── events.html        # 12 events, URL-synced combinable filters, empty state
├── schedule.html      # Day tabs, overlap clustering, parallel track cards
├── contact.html       # Form with strict validation, double-submit lock, boarding pass
├── README.md          # This file
│
├── css/
│   ├── variables.css  # All colors, fonts, radii for space / retro / nature themes
│   └── style.css      # Theme-neutral component CSS — zero hardcoded colors
│
└── js/
    ├── theme.js       # ACTIVE_THEME + font loader + data-theme-copy injection
    ├── data.js        # FEST_NAME, FEST_YEAR, FEST_DAYS, VENUE_NAME, CONTACT_EMAIL,
    │                  # CATEGORIES config, FESTIVAL_EVENTS (12), helper functions
    ├── card.js        # renderEventCard() — single source for all card markup
    ├── layout.js      # Shared navbar (skip-link, hamburger, Esc-close) + footer
    ├── home.js        # Derived stats, featured events, multi-state countdown
    ├── events.js      # Combinable filters, URL ?cat=&day= sync, popstate history
    ├── schedule.js    # Interval overlap clustering, parallel timeline rendering
    ├── form.js        # Blur+submit validation, localStorage, boarding pass card
    └── tests.js       # 4 console assertions for overlap logic (?test=1)
```

---

## Schedule Parallel-Track Reasoning (Plain English)

**Problem:** Multiple events can overlap in time at different venues.  
**Solution:** Group events into time-slot clusters, then display overlapping events side by side.

**The rule:** If a new event *starts before* the currently running cluster *ends*, it is part of the same parallel group. If it starts exactly when the previous ends (back-to-back), it is a new separate group.

**Examples verified by tests.js:**
| Case | Input | Result |
|------|-------|--------|
| Same start | Sprint 10:00–12:00 + Pixel Arena 10:00–12:00 | 1 cluster, 2 parallel cards |
| Partial overlap | Sprint 10:00–12:00 + RoboWars 11:00–12:30 | 1 cluster, span 10:00–12:30 |
| Back-to-back | Event A ends 11:00, Event B starts 11:00 | 2 separate clusters — NOT grouped |
| Filtered | Only Gaming events selected | Clustering applied only to filtered subset |

**What the user sees:**  
Events sharing a time slot are grouped under **one time heading** and displayed **side by side** as parallel cards. Each card keeps its own venue, category badge, and exact start–end time — nothing is hidden. On mobile, cards stack vertically in the same order. When filters are changed, the timeline regroups automatically using only the matching events.

---

## Rubric Checklist

### A. Core Functionality (30 pts)

- [x] Home: fest name (`TECHNOVA 2027`), dates (from `FEST_DAYS`), sticky navbar, `Register Now` primary CTA
- [x] Countdown: never negative, shows live state ("Festival is live now!"), shows ended state, interval cleared after fest
- [x] Events: 12 events, 3 categories, 2 dates; each card shows title, category (icon + text), date/time (AM/PM), venue
- [x] Schedule: day tabs, time-ordered, overlap-grouped parallel cards with "How to read" note
- [x] Form: required fields, email format, phone optional (10 digits), inline errors, confirmation card with reference ID
- [x] All nav links and Register buttons work on every page
- [x] Zero console errors (syntax-checked with Node.js, tests pass)

### B. Visual Design & Theme (25 pts)

- [x] One theme applied everywhere: navbar, hero, cards, filters, schedule, form, confirmation, footer, buttons
- [x] Two-column hero desktop (text left, inline SVG orbit art right), stacked on mobile
- [x] Gradient title (`-webkit-background-clip: text`)
- [x] One strong primary CTA (`btn-primary btn-lg`) + one ghost CTA on hero
- [x] Countdown: large monospace digits in glass tiles with accent border + glow
- [x] Event cards: glass surface + category color stripe at top + hover lift + glow border
- [x] All colors strictly from CSS variables, zero hardcoded hex in `style.css`
- [x] Category shown by icon (emoji in CATEGORIES config) + text — not color alone
- [x] WCAG AA contrast: accent primary (#00f3ff) on dark bg passes AA for large text; dark text on accent for buttons

### C. Responsive Usability (20 pts)

- [x] Hero two-column collapses to single column at ≤ 768px
- [x] No horizontal scroll at 360px, 768px, 1280px (`overflow-x: hidden` on body)
- [x] Hamburger: `aria-expanded`, closes on link click and Esc key
- [x] All touch targets ≥ 44px (`min-height: 44px` on every btn, filter-pill, mobile-toggle)
- [x] Filter chips wrap and remain tappable on mobile
- [x] Schedule parallel cards stack on mobile (`grid-template-columns: 1fr`)
- [x] Form fields full width on mobile (single-column grid at < 768px)
- [x] Input types: `type="email"`, `type="tel"` — keyboard-optimized

### D. Code Organization (15 pts)

- [x] `css/variables.css` — design tokens only; `css/style.css` — components only
- [x] One `renderEventCard()` in `card.js` used by Home, Events, Schedule
- [x] One `CATEGORIES` config in `data.js` — no repeated badge-class ternaries
- [x] One navbar/footer injection in `layout.js`
- [x] All fest metadata in `data.js` (FEST_NAME, FEST_YEAR, FEST_DAYS, VENUE_NAME, CONTACT_EMAIL)
- [x] Zero inline styles; zero inline event handlers
- [x] Logic functions separated from DOM code (validators in `FormValidators{}`, clustering in `clusterOverlappingEvents()`)
- [x] `prefers-reduced-motion` disables animations; only `transform` and `opacity` used for hover/transitions
- [x] README complete: run instructions, folder map, theme-change guide, rubric, schedule reasoning

### E. Filtering & Reasoning (10 pts)

- [x] Category × Day filters combine on both Events and Schedule pages
- [x] "All" options reset each dimension independently
- [x] `aria-live="polite"` on count badge: "Showing X of Y events"
- [x] Empty state with illustration and "Clear Filters" button
- [x] Filters reflected in URL (`?cat=Technical&day=2027-02-12`)
- [x] Browser Back/Forward restores filter state (`popstate` listener)
- [x] Visible "How to read this schedule" note on `schedule.html`
- [x] Schedule overlap logic: same-start groups, partial overlap groups, back-to-back does NOT group
- [x] Automated `tests.js` verifies all 4 overlap cases — runs on `schedule.html?test=1`

---

## Form Layout & SATI Branding Audit Pass

- **Form Layout**: Root cause fixed with global ox-sizing: border-box, width: min(100%, 880px) centered card, grid-template-columns: repeat(2, minmax(0, 1fr)) with min-width: 0 on children, and 48px equal-height form controls. Collapses to 1 column below 640px.
- **Labels & Typography**: Enforced body font (ar(--font-body)) on labels, inputs, and helpers (no slashed zero "1�"). Single-line labels with .label-badge-optional badge, format hint moved to helper text below input.
- **Branding**: Official Samrat Ashok Technological Institute (SATI), Vidisha vector emblem (ssets/sati-logo.svg) mounted on .college-logo-badge (round white badge for dark-theme contrast) in navbar brand, hero metadata, ticket confirmation pass, footer, and as SVG favicon.
- **Selects & Validation**: Custom inline SVG chevrons driven by theme CSS variables, .select-placeholder muted color handling, datalist for colleges with SATI Vidisha first, and accessible error/valid states (check icon, warning icon with text, clear focus rings).
- **Navbar**: Responsive collapse breakpoint set to 1099px to prevent link clipping; Register CTA dynamically hidden on contact.html.
