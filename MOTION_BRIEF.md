ROLE: senior frontend engineer and motion designer. Add a complete, polished animation system to the existing TECHNOVA fest website. Re-read this brief at the start of each phase.

HARD CONSTRAINTS
- Plain HTML, CSS, vanilla JS. No libraries, no npm, no build step, no backend. Must work via file:// double-click: NO ES modules, NO fetch of local files, classic <script> tags, one global namespace (window.FEST).
- Animate ONLY transform and opacity (plus filter: blur/brightness on small elements, sparingly). NEVER animate width, height, top, left, margin, padding or box-shadow. For glows animate the opacity of a pseudo-element. For accordions use the grid-template-rows 0fr to 1fr technique. For animated gradient borders rotate a pseudo-element with transform.
- Everything must be theme-driven: durations, easings and personality come from CSS variables and the preset in theme.js. No hardcoded colors.
- Existing features, tests, URL params, theme switching and accessibility must keep working. Do not add libraries.
- Work only on pages and components that already exist. For UI not built yet, do not create it; just follow the motion API so it can be animated later.

MOTION SYSTEM (build first)
1. css/motion.css (all keyframes and animation utility classes live here only). First search style.css and every other css file for existing @keyframes/animation/transition rules, merge them into motion.css and delete duplicates and conflicts.
2. Tokens in :root: --dur-instant 100ms, --dur-fast 180ms, --dur-med 320ms, --dur-slow 600ms, --dur-ambient 8s to 40s, --ease-out, --ease-in-out, --ease-spring (cubic-bezier with slight overshoot), --stagger-step 60ms. Each theme overrides personality: Space = smooth and floaty (long eases), Retro = snappy and stepped (steps() for pixel feel, slight flicker), Nature = soft and organic (slow sway, gentle ease).
3. js/motion.js, one file, one responsibility. Exposes window.FEST.motion with:
   - level: "full" | "lite" | "off". Default is "off" if prefers-reduced-motion is set; "lite" if (navigator.hardwareConcurrency <= 4 or navigator.connection.saveData or width < 768); otherwise "full". User can override with a small "Motion: Full / Lite / Off" control (in the footer or accessibility menu), saved in localStorage (try/catch). Set data-motion="full|lite|off" on <html>. All CSS keys off this attribute and the prefers-reduced-motion media query.
   - Declarative API through attributes: data-anim="fade-up | fade-down | fade-left | fade-right | zoom-in | blur-in | rise | flip-in", data-anim-delay="120", data-anim-stagger on a parent (children animate one after another), data-anim-once. Reveal uses ONE shared IntersectionObserver.
   - Helpers: countUp(el, to, duration), splitText(el) (wraps words/letters in spans; keeps the readable text in aria-label and marks spans aria-hidden), flip(container, updateFn) for animating list re-ordering/filtering, ripple(el), tilt(el), magnetic(el), pause infinite animations when the element is offscreen or the tab is hidden (IntersectionObserver + visibilitychange).
   - Pure helper functions (stagger delay calculation, easing, motion-level decision) are separated from DOM code and unit tested in js/tests.js.
4. Progressive enhancement: a tiny inline-free head script (js/motion-boot.js, loaded first) adds class js-motion to <html> BEFORE first paint. The hidden starting state of [data-anim] exists ONLY under html.js-motion[data-motion="full"|"lite"]. Safety net: if reveal has not run within 2 seconds, show everything. With JavaScript disabled or motion off, all content must be fully visible and static.
5. In "lite" mode: keep reveal fades, hover and press feedback, and tab/dialog transitions only; disable parallax, tilt, magnetic, cursor glow, particles and long ambient loops. In "off" mode nothing animates, but non-motion feedback (color changes, focus rings, underline) stays.
6. Hover-only effects (tilt, magnetic, cursor glow, lift) are enabled only under (hover: hover) and (pointer: fine). Touch devices get press (active) feedback instead.
7. Use will-change sparingly and only while animating. No animation may cause layout shift. Total infinite animations running at once must stay small (about 6 or fewer visible).

ANIMATION CATALOG (apply everywhere it fits; keep each UI animation at most 600ms, ambient ones slow)
GLOBAL
- Page enter: content fades and rises slightly. Page leave on internal link click: quick fade-out (about 150ms) then navigate; skip it for modifier clicks, target=_blank, hash links and when motion is off. Do not rely on cross-document View Transitions (they fail on file://); use this simple fallback.
- Scroll progress bar at the top of the page (transform: scaleX through a rAF-throttled scroll listener).
- Navbar: slides down on load, gets a blurred glass background and shrinks slightly after scrolling, hides on scroll down and returns on scroll up (never while the mobile menu is open), active link underline slides between links, hamburger morphs into an X, the mobile menu slides in with staggered links, the logo has a gentle hover rotate or glow.
- Buttons: press scale (0.97), primary CTA has a slow shine sweep, ripple on click, subtle magnetic pull on desktop, arrow icon nudges on hover.
- Links: animated underline growing from left. Icons: small hover pop.
- Back-to-top button fades and scales in after scrolling, toasts slide in and out with a progress timer bar, native <dialog>/modals scale-fade in with the backdrop fading, and the same in reverse on close (animate close before calling close()).
- Footer reveals with a stagger; section dividers draw themselves (stroke-dashoffset on SVG or scaleX).
- Smooth anchor scrolling (disabled when motion is off).
HOME
- Hero: entrance sequence (kicker, then title word-by-word or letter-by-letter via splitText, then tagline, then CTAs, then art), theme art floats or orbits continuously (Space: rotating orbit rings with satellites and twinkling stars plus an occasional shooting star; Retro: scanline roll, blinking cursor, mild glitch on heading hover; Nature: floating leaves and gentle sway). Subtle parallax of hero layers with scroll (transform only, rAF-throttled, full mode only). Photo background has a very slow zoom (Ken Burns, transform scale).
- Countdown: each digit slides or flips when its value changes (only the changed digit animates), seconds tile gets a soft pulse, the "live" state has a pulsing indicator, and the ended state is calm. Keep role="timer" with no aria-live per tick.
- Stats: count-up when scrolled into view (once), tiles pop in with stagger.
- Marquee strip of event names (pure CSS, pause on hover and focus-within, hidden when motion is off).
- Featured and event cards: staggered reveal, hover lift, optional 3D tilt following the cursor and a cursor-following glow (--mx/--my) on desktop, animated gradient border on hover, category icon wiggle on hover, press feedback on touch.
- Campus photo section: image clip or zoom reveal, caption slides in, slow hover zoom inside its frame.
- FAQ accordions (if present): smooth open/close using grid-template-rows, chevron rotates.
EVENTS and FILTERS
- Filter chips: press animation, active chip has a sliding highlight, search box expands slightly on focus, "/" shortcut flashes the box.
- When filters change, animate the list with flip(): cards that stay glide to their new position, new ones fade-scale in, removed ones fade out; the result count number ticks, active-filter pills pop in and shrink out, the empty state illustration floats gently.
- Save/bookmark button: pop plus small burst animation, saved badge in the navbar bounces when the count changes (if those features exist).
SCHEDULE
- Day tabs: sliding indicator, content cross-fades and slides in the direction of the tab change.
- Timeline: the vertical line draws itself while scrolling (scaleY), time nodes pop in with stagger, parallel-event brackets draw in, parallel cards fan in from the center, a "LIVE" tag pulses, the "current time" line moves smoothly and a "Starts in..." label ticks softly (if the live features exist). Venue grid view (if present): cards scale in by column then row, view toggle cross-fades.
FORM
- Focus ring animates in, labels get a small color transition, error message slides down and the field does a tiny shake (6px, 2 or 3 cycles), valid state draws a check mark (SVG stroke-dashoffset), character counter eases color as it nears the limit, submit button shows a spinner and a disabled state during submission.
- Success: a celebration burst (30 to 60 CSS or tiny canvas particles in theme colors, 1.5s, then removed, text and shapes only, no images), then the boarding pass slides in like a printed ticket (translateY from a slot), the barcode has a one-time scan line, and the reference ID types in. Reset form animates back smoothly.
- Registrations list and plan list (if present): rows slide in, delete animates out (collapse by transform and opacity then remove).
AMBIENT (theme personality, subtle, paused offscreen)
- Space: twinkling star layers drifting at different speeds, rare shooting star, soft nebula glow breathing (opacity).
- Retro: faint CRT flicker, moving scanline, blinking cursor, steps() based pixel animations.
- Nature: drifting leaves and light rays, gentle sway on dividers and icons.

PHASES (do ONE at a time, then STOP and report)
Phase 1: Motion system (motion.css, motion.js, motion-boot.js, tokens per theme, level logic and toggle, reveal API, reduced-motion handling, tests for pure functions). Consolidate and remove old duplicated animation CSS.
Phase 2: Global chrome (page enter and leave, navbar, scroll progress, buttons, links, toasts, dialog, back-to-top, footer).
Phase 3: Home (hero sequence, art, countdown digits, stats, marquee, campus section, FAQ).
Phase 4: Cards, filters with flip(), schedule and timeline animations, tabs.
Phase 5: Form, validation feedback, success burst, boarding pass, lists.
Phase 6: Theme ambient layers for all three themes, final performance and accessibility audit.

ASK-YOURSELF RULE (end of every phase, silently, then fix)
1. Does any @keyframes or transition touch width/height/top/left/margin/padding/box-shadow? Remove it. 2. With motion set to off and with JavaScript disabled, is every piece of content visible and usable? 3. Does prefers-reduced-motion skip all movement? 4. Are hover-only effects gated to (hover: hover) and (pointer: fine)? 5. Any layout shift, horizontal scroll or jank at 360, 768, 1280 and 1920px? 6. Are all colors and timings from theme variables, and do retro and nature still look intentional? 7. Is there any duplicated animation code or hardcoded delay in JS that should be a token? 8. Any console errors, offline, via file://? 9. What would a strict judge call too much, and is the animation still subtle and purposeful?

ALSO
- Extend tools/audit.js (if it exists; otherwise create it as plain Node with zero dependencies) to fail on: animating forbidden properties inside @keyframes or transition lists, @keyframes defined outside motion.css, inline style animation attributes, type="module", fetch(.
- Update README.md: the motion system, data-anim attributes, motion levels and the toggle, how themes change motion personality, and the reduced-motion policy.
- Performance target: smooth on a throttled CPU (4x slowdown), JS under about 15KB total for motion, no new network requests.

HOW TO WORK
After each phase STOP and report: what was built, exact manual test steps, one-line self-check result, and a git commit message. Wait for "next". If something cannot be done within the constraints, say so instead of faking it.