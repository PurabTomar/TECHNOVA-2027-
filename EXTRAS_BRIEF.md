# TECHNOVA 2027 - Extras & Upgrades Brief

**ROLE**: Senior Frontend Engineer  
**GOAL**: Add full discovery, event detail dialogs, clash detection, multi-event registration, schedule venue grids, and live festival tracking to the existing TECHNOVA fest website.

---

## Hard Constraints
- **Frontend Only**: Plain HTML, CSS, vanilla JS. No frameworks, no npm, no build step, no backend, no login, no payment, no live registration database, no external API.
- **`file://` Double-Click**: Must work via file:// double-click. NO ES modules, NO fetch of local files, classic `<script>` tags, one global namespace (`window.FEST`).
- **`file://` Gotchas**:
  - `navigator.clipboard` may be unavailable; use fallback (`select` + `document.execCommand('copy')`).
  - Canvas tainted on `file://` when drawing image files; PNG ticket pass export must draw **only text and vector shapes**, wrapped in `try/catch` with print fallback.
  - `<dialog>` and `Blob` downloads are supported.
- **Design & Architecture**:
  - All new UI driven by theme CSS variables in `variables.css` (tested in `space`, `retro`, and `nature`).
  - Single `renderEventCard()` component in `card.js`.
  - Single `CATEGORIES` configuration in `data.js`.
  - Single pure `filterEvents(events, criteria)` in `data.js` used across Events, Schedule, and My Plan.
  - Schedule block-grouping logic with automated assertions in `js/tests.js` (`?test=1`).
  - No inline styles or inline handlers (JS may set CSS custom properties only, e.g. `--row-start`).
  - All facts derived from `data.js`. No invented claims about the college.
  - Stored data uses `localStorage` wrapped in `try/catch`, clearly stating: *"Saved on this device only, there is no server."*
  - Navbar: max 5 links + CTA: `Home`, `Events`, `Schedule`, `My Plan`, `Register`. "My Registrations" linked from the Register page and footer.
  - Rubric target: Core 30, Visual/Theme 25, Responsive 20, Code Organization 15, Filtering & Reasoning 10.

---

## Ask-Yourself Rule (End of Every Phase)
1. Any hardcoded color/font outside theme variables?
2. Works at 360 / 768 / 1024 / 1280 / 1440px with no horizontal scroll?
3. Keyboard-only usable, focus managed, aria labels right?
4. Console errors, dead buttons, file:// OK?
5. Logic duplicated or mixed into DOM code?
6. New pure functions covered by tests.js?
7. What would a strict judge criticize?

---

## Phase Breakdown

### PHASE 1: Discovery & Filtering (Filtering 10, Core 30)
- Search box (`title`, `description`, `venue`, `category`), debounced (250ms), `/` key shortcut focuses it.
- Filters: `venue`, time of day (`morning` before 12:00, `afternoon` 12:00–17:00, `evening` after 17:00; constants in `TIME_OF_DAY`), `savedOnly`.
- Sort: `time` (default), `title` A–Z, `category`, `duration`.
- Single pure `filterEvents(events, criteria)` combining all filters with Category and Day.
- Active-filter pills with remove buttons, "Clear All", live result count (`aria-live="polite"`), friendly empty state with reset.
- State synced in URL parameters (`?q=&cat=&day=&venue=&tod=&sort=&saved=1`), browser back/forward supported.
- Extended test suite covering combos, search, time-of-day, empty results, sorting stability, and URL param parsing with invalid values ignored.

### PHASE 2: Event Details, Saving, My Plan with Clash Detection (Core, Reasoning)
- Event schema enriched with `teamMin`, `teamMax`, `rules` (3–4 lines), derived `duration`.
- Native `<dialog>` modal for event details: accessible focus trap, Esc to close, return focus, deep link `?open=<id>`. Includes description, date/time/duration, venue, team size, rules, and actions (Register, Bookmark, Add to Calendar `.ics`, Copy link).
- Bookmark button on every card (`aria-pressed`), reactive saved count badge in navbar, localStorage persistence.
- `plan.html` ("My Plan"): saved events rendered as a timeline using block-grouping logic.
  - Clash detection: `"Clash: Event A and Event B overlap HH:MM–HH:MM"`.
  - Travel-buffer warnings: consecutive back-to-back events in different venues with gap < `TRAVEL_BUFFER_MIN` (10 min).
  - "Remove one" quick action. Pure `findClashes()` and `findTightTransitions()`, fully tested.
- Export plan as single `.ics` file (valid VCALENDAR: CRLF line endings, escaped characters, floating local times, UID per event) and print-friendly view.

### PHASE 3: Schedule Upgrades (Reasoning 10, Visual 25)
- View toggle on `schedule.html`: "Timeline" (existing cluster view) and "Venue Grid" (columns = venues, rows = 30-min time increments, positioned via CSS grid `--row-start` / `--row-end`, sticky time column, horizontally scrollable container on mobile).
- Live mode: "Happening now" and "Up next" strip on Home and Schedule.
  - Ongoing events have pulsing `LIVE` tag; upcoming show `Starts in Xh Ym`.
  - Current-time indicator line in timeline when viewing current day.
  - Auto-refresh every minute.
  - Demo simulation support via `?now=2027-02-12T10:30` (ignoring invalid formats).
- Updated "How to read this schedule" note explaining venue grid, parallel tracks, and clash detection.
- Dedicated schedule print stylesheet.

### PHASE 4: Multi-Registration & Boarding Passes (Core 30, Responsive 20)
- Multi-event registration in a single form submission: grouped checkbox selection with inline clash warnings (`findClashes`). `?event=<id>` still pre-selects.
- Dynamic team member rows when `teamMax > 1` (limited to `teamMax`, each member validated).
- Form inputs: numeric-only phone mask (`inputmode="numeric"`, `maxlength="10"`), typo suggestion for emails (`suggestEmailDomain()`), consent checkbox, message character counter.
- Duplicate submission guard (same email + same event) linking to existing pass.
- Draft autosave in `localStorage` with "Draft restored / Clear draft" prompt; "Remember my details" opt-in.
- Confirmation: distinct boarding passes per event with unique reference IDs (`TECH27-XXXX`), Copy reference ID, Print/Save PDF, Download pass as PNG (canvas vector/text only, try/catch with print fallback), Add to Calendar `.ics`.
- `registrations.html` ("My Registrations"): load from localStorage, view pass, delete pass, clear all, search by reference ID or email, export CSV. Clear notice: *"Stored on this device only."*

### PHASE 5: Home, Polish & Resilience (Visual 25)
- Home: Now/Next strip, derived stats, FAQ accordion (`<details>`) describing site operation (clashes, storage, `?now` demo), and campus gallery section using authentic venue data.
- Toast notification system (`aria-live="polite"`), back-to-top button, share/copy-link utilities.
- `404.html` with theme navigation.
- Accessibility text-size adjuster (`A-` / `A+`) saved in localStorage.
- Resilient offline fallback if localStorage is blocked.

### PHASE 6: Quality, Audit & Code Organization (Code 15)
- Comprehensive test suite in `js/tests.js`: filters, grouping, clashes, travel buffer, ICS format, email suggestions, validators, live-state boundaries, reference ID uniqueness. `?test=1` console output + visual banner.
- `tools/audit.js` zero-dependency Node script checking for hardcoded hex colors, inline styles, inline handlers, `fetch()`, modules, and dead files.
- Clean JSDoc, updated README with feature documentation, ?now / ?test usage, and rubric checklist.
