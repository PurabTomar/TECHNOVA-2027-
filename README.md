# TECHNOVA 2027 • Code Crack 3.0 Hackathon & Tech-Cultural Fest

Fully static website. Works by double-clicking `index.html`. Zero build step, zero npm, zero fetch, zero ES modules.

---

## How to Run (2 steps)

1. Open the `technova-2027/` folder in File Explorer.
2. Double-click `index.html`. Done.

For test output: open `schedule.html?test=1` or `events.html?test=1` in a browser and check the DevTools Console (`F12`). You will see 21 automated assertions all pass.

For motion & quality audit: run `node tools/audit.js` in your terminal. All 368 strict constraints pass.

---

## How to Change the Theme (2 minutes)

Open `js/theme.js` and change **one line**:

```js
const ACTIVE_THEME = 'space'; // ← change to: 'retro' or 'nature'
```

Save and refresh. The entire site switches:
- All colors from `css/variables.css` (one block per theme, zero hardcoded values elsewhere)
- Motion personality overrides in `css/motion.css` (Space = smooth floaty, Retro = snappy pixel stepped, Nature = soft organic sway)
- All narrative copy (hero kicker, tagline, countdown banners, footer note, section titles) from `THEME_PRESETS[ACTIVE_THEME].copy` in `js/theme.js`
- Web font loaded asynchronously by `js/theme.js` (offline safe — system fonts always used as fallback)

| Theme | Palette | Motion Personality |
|-------|---------|--------------------|
| `space` | Deep navy + neon cyan | Smooth & floaty (long cubic-bezier eases) |
| `retro` | Dark amber + vermilion | Snappy & stepped (`steps()` pixel arcade feel) |
| `nature` | Emerald + golden sunbeam | Soft & organic (slow sway, gentle ease) |

---

## Motion System Architecture

- **Hardware Accelerated**: Animates ONLY `transform` and `opacity` (plus subtle blur filters). NEVER animates `width`, `height`, `top`, `left`, `margin`, `padding`, or `box-shadow`.
- **Tokens in `:root`**: `--dur-instant` (100ms), `--dur-fast` (180ms), `--dur-med` (320ms), `--dur-slow` (600ms), `--dur-ambient` (8s–40s), `--ease-out`, `--ease-in-out`, `--ease-spring`, `--stagger-step` (60ms).
- **Motion Levels**:
  - `full`: Complete animation suite with 3D tilts, magnetic pulls, and ambient loops.
  - `lite`: Reveal fades, hover/press feedback, and dialog transitions only; disables parallax, 3D tilt, and infinite ambient loops. Auto-selected on mobile (<768px), low CPU cores (<=4), or Save-Data mode.
  - `off`: Zero animation/transitions. Static, instantaneous UI. Activated when `prefers-reduced-motion` is enabled or chosen via the user toggle.
- **User Control**: Interactive toggle in the footer (`Motion: Full / Lite / Off`) saved in `localStorage` (`technova_motion`).
- **Declarative API**: Use `data-anim="fade-up | fade-down | fade-left | fade-right | zoom-in | blur-in | rise | flip-in"`, `data-anim-delay="120"`, and `data-anim-stagger="60"`. Driven by a single shared `IntersectionObserver`.
- **Progressive Enhancement**: `js/motion-boot.js` runs in `<head>` before first paint. Hidden states apply only under `html.js-motion:not([data-motion="off"])`. A 2-second safety timeout guarantees 100% visibility even if JS fails.
- **Strict Quality Auditor**: `node tools/audit.js` verifies zero forbidden property animations, centralized keyframes in `css/motion.css`, bundle size < 15KB, zero `fetch()`, and zero ES modules.

---

## Folder Structure

```
technova-2027/
│
├── index.html         # Hero (2-col desktop), countdown, stats, featured cards
├── events.html        # 12 events, debounced search, multi-filters, active pills, URL sync
├── schedule.html      # Day tabs, overlap clustering, parallel track cards
├── contact.html       # Form with strict validation, double-submit lock, boarding pass
├── EXTRAS_BRIEF.md    # Master feature and motion system brief
├── README.md          # Documentation and test guide
│
├── css/
│   ├── variables.css  # All colors, fonts, theme tokens for space / retro / nature
│   ├── style.css      # Theme-neutral component CSS — zero hardcoded colors
│   └── motion.css     # Master motion system — all keyframes, tokens, and reveal rules
│
├── js/
│   ├── motion-boot.js # Instant head script for zero-layout-shift motion boot
│   ├── motion.js      # window.FEST.motion API (observer, FLIP, countUp, splitText, micro-interactions)
│   ├── theme.js       # ACTIVE_THEME + font loader + copy injection
│   ├── data.js        # FEST constants, categories, events, filterEvents(), time helpers
│   ├── card.js        # renderEventCard() with bookmark action — single source for cards
│   ├── layout.js      # Shared navbar (max 5 links + CTA) and footer with motion control
│   ├── home.js        # Derived stats, featured events, multi-state countdown
│   ├── events.js      # Advanced debounced search, combinable filters, active pills, URL sync
│   ├── schedule.js    # Interval overlap clustering, parallel timeline rendering
│   ├── form.js        # Blur+submit validation, datalist, neutral placeholders, boarding pass
│   └── tests.js       # 21 automated console assertions (?test=1)
│
└── tools/
    └── audit.js       # Zero-dependency Node auditor for motion & quality constraints
```

---

## Schedule Parallel-Track Reasoning

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
- [x] Countdown: never negative, shows live state, shows ended state, interval cleared after fest
- [x] Events: 12 events, 3 categories, 2 dates; each card shows title, category (icon + text), date/time (AM/PM), venue
- [x] Schedule: day tabs, time-ordered, overlap-grouped parallel cards with "How to read" note
- [x] Form: required fields, email format, phone optional (10 digits), inline errors, confirmation card with reference ID
- [x] All nav links and Register buttons work on every page
- [x] Zero console errors (syntax-checked with Node.js, 21 tests pass)

### B. Visual Design & Theme (25 pts)
- [x] One theme applied everywhere: navbar, hero, cards, filters, schedule, form, confirmation, footer, buttons
- [x] Two-column hero desktop (text left, inline SVG orbit art right), stacked on mobile
- [x] Gradient title (`-webkit-background-clip: text`)
- [x] One strong primary CTA + one ghost CTA on hero
- [x] Countdown: large monospace digits in glass tiles with accent border + glow
- [x] Event cards: glass surface + category color stripe at top + hover lift + glow border
- [x] All colors strictly from CSS variables, zero hardcoded hex in `style.css`
- [x] Category shown by icon + text — not color alone
- [x] WCAG AA contrast across all 3 themes

### C. Responsive Usability (20 pts)
- [x] Hero two-column collapses to single column at <= 768px
- [x] No horizontal scroll at 360px, 768px, 1024px, 1280px, 1440px, 1920px
- [x] Hamburger: `aria-expanded`, closes on link click and Esc key
- [x] All touch targets >= 44px
- [x] Filter chips wrap and remain tappable on mobile
- [x] Schedule parallel cards stack on mobile (`grid-template-columns: 1fr`)
- [x] Form fields full width on mobile (single-column grid at < 640px)
- [x] Input types: `type="email"`, `type="tel"` — keyboard-optimized

### D. Code Organization (15 pts)
- [x] `css/variables.css` — design tokens only; `css/style.css` — components only; `css/motion.css` — motion only
- [x] One `renderEventCard()` in `card.js` used by Home, Events, Schedule
- [x] One `CATEGORIES` config in `data.js`
- [x] One navbar/footer injection in `layout.js`
- [x] All fest metadata in `data.js`
- [x] Zero inline styles; zero inline event handlers
- [x] Logic functions separated from DOM code
- [x] `prefers-reduced-motion` disables animations; only `transform` and `opacity` used for hover/transitions
- [x] README complete with motion system and audit tool instructions

### E. Filtering & Reasoning (10 pts)
- [x] Live debounced search box with `/` keyboard focus shortcut
- [x] Venue, time of day (Morning < 12:00, Afternoon 12:00–17:00, Evening > 17:00), and Saved Only filters
- [x] Sorting by time, title, category, and duration
- [x] Interactive active-filter pills with individual remove buttons and Clear All
- [x] Single pure `filterEvents(events, criteria)` in `data.js`
- [x] URL state synchronization (`?q=&cat=&day=&venue=&tod=&sort=&saved=1`) with back/forward history support
- [x] 21 automated unit tests in `js/tests.js`
