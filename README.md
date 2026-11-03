# TECHNOVA 2027 • College Tech-Cultural Fest & Code Crack 3.0 Hackathon

A complete, production-grade static festival website built with vanilla HTML, CSS, and JavaScript. Designed specifically for offline file execution (`file://`) with zero build steps, zero external package dependencies, and zero backend services.

## Quick Start
1. Navigate to the project root directory.
2. Double-click `index.html` to open directly in any modern web browser (Chrome, Edge, Firefox, Safari).
3. No local server, node modules, or build steps required.

## Architecture & File Structure
```
technova-2027/
│
├── index.html         # Homepage: Hero, countdown timer, stats, featured events
├── events.html        # Events directory: 12 events, combinable filters, empty state
├── schedule.html      # Schedule timeline: Day tabs, parallel tracks side-by-side
├── contact.html       # Registration portal: Strict form validation & boarding pass
├── README.md          # Project documentation & run guide
│
├── css/
│   ├── variables.css  # Space theme design tokens (all colors, fonts, glows)
│   └── style.css      # Master responsive stylesheet with star-field background
│
└── js/
    ├── data.js        # 12 realistic events across 3 categories & 2 days
    ├── theme.js       # Central ACTIVE_THEME controller
    ├── layout.js      # Shared sticky navbar & footer auto-injection
    ├── events.js      # Events filtering & dynamic card rendering
    ├── schedule.js    # Overlap clustering & parallel tracks timeline
    └── form.js        # Strict client validation & instant ticket generator
```

## Space Theme & Variables
All colors and fonts are strictly defined as CSS custom properties in `css/variables.css` under the `:root` and `[data-theme="space"]` selectors:
- Deep Navy & Violet Backgrounds: `--color-bg-base`, `--color-bg-deep`, `--color-bg-surface`
- Neon Cyan Primary Accent: `--color-cyan-glow`, `--color-cyan-bright`, `--color-cyan-faint`
- Nebula Violet Secondary Accent: `--color-violet-core`, `--color-violet-light`, `--color-violet-glow`
- Discipline Badges:
  - Technical: Neon Cyan
  - Cultural: Nebula Violet / Fuchsia
  - Gaming: Cosmic Emerald

The active theme is declared globally in `js/theme.js`:
```js
const ACTIVE_THEME = 'space';
```

## Features Implemented
1. **Interactive Star-Field Background**: Pure CSS layered multi-speed drifting and pulsing stars without performance penalties.
2. **Sticky Navigation & Footer**: Dynamic insertion on every page with active state highlights and accessible mobile hamburger toggle.
3. **Cosmic Countdown Timer**: Real-time ticker counting down to 12 February 2027 09:00 AM (guaranteed non-negative).
4. **12 Realistic Events**: Includes "Sprint" (Technical, 12 Feb, 10:00, Lab 2), 2-3 parallel events in different venues, and the partial overlap (10:00-12:00 and 11:00-12:30).
5. **Combinable Event Filtering**: Filter by category (Technical, Cultural, Gaming, All) and Day (Day 1, Day 2, All) with live count and "Clear Filters" button.
6. **Parallel Tracks Schedule View**: Automatic interval overlap clustering grouping concurrent events side by side with the required reading guide notice.
7. **Strict Registration Validation**: Live blur and submit validation for name, email format, optional 10-digit phone, college, year, and event dropdown with inline error prompts.
8. **Digital Boarding Pass Confirmation**: Instant generation of unique reference ID (`TECH27-XXXXXX`) with event details, participant metadata, and printable layout.
9. **Fully Responsive**: Seamless presentation across 360px mobile, 768px tablet, and 1280px desktop displays.
