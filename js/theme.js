/**
 * TECHNOVA 2027 - Dynamic Theme Controller
 * Central theme declaration, dynamic font loading, and content copy injection.
 * Switch ACTIVE_THEME to 'space', 'retro', or 'nature'.
 */

// Active theme selector: change this single variable to swap entire theme & copy
const ACTIVE_THEME = 'space';

// Theme Presets: contains fonts and theme-specific narrative copy
const THEME_PRESETS = {
  space: {
    name: 'space',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Orbitron:wght@600;800;900&display=swap',
    copy: {
      heroKicker: 'CODE CRACK 3.0 HACKATHON & ANNUAL FEST',
      heroTagline: 'Transcending boundaries across the tech cosmos, cultural stages, and competitive arenas.',
      heroCtaExplore: 'Explore All Events',
      heroCtaSchedule: 'View Schedule',
      countdownTitle: 'Mission Launch Countdown',
      countdownLive: 'Festival is live now!',
      countdownEnded: 'Thanks for joining TECHNOVA, see you next year',
      featuredPretitle: 'Selected Arenas',
      featuredTitle: 'Featured Highlights',
      featuredSubtitle: 'Headline challenges across algorithmic problem solving, hackathons, and robotics.',
      eventsPretitle: 'Explore Arenas',
      eventsTitle: 'Festival Events',
      eventsSubtitle: 'Premier tournaments, algorithmic coding battles, and stage performances.',
      schedulePretitle: 'Timeline & Tracks',
      scheduleTitle: 'Festival Schedule',
      scheduleSubtitle: 'Chronological itinerary across all festival tracks and simultaneous stages.',
      scheduleGuideHeading: 'How to read this schedule',
      scheduleGuideText: 'When events share a time slot, we group them under one heading and show them side by side. Each card keeps its own venue, category and exact timing, so nothing is hidden. On mobile they stack in the same order.',
      registerPretitle: 'Portal Registration',
      registerTitle: 'Event Registration',
      registerSubtitle: 'Secure your participation pass for Code Crack 3.0 and competitive festival tracks.',
      ticketPassHeader: 'TECHNOVA PASS',
      ticketPassPill: 'Boarding Pass Confirmed',
      emptyTitle: 'No Matching Events Found',
      emptySubtitle: 'No events match the selected category and day filters.',
      footerTagline: 'Code Crack 3.0 Hackathon & Annual College Tech-Cultural Fest.',
      footerNote: 'Deep Space Experience • Powered by Pure Vanilla Web Architecture'
    }
  },

  retro: {
    name: 'retro',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
    copy: {
      heroKicker: 'INSERT COIN • 8-BIT HACKATHON & ARCADE FEST',
      heroTagline: 'Level up your skills across digital circuits, retro synth stages, and tournament battlefields.',
      heroCtaExplore: 'Select Stage',
      heroCtaSchedule: 'View Quest Map',
      countdownTitle: 'Countdown to Player 1 Start',
      countdownLive: 'Festival is live now! Press Start!',
      countdownEnded: 'Game Over! Thanks for playing TECHNOVA, see you next year!',
      featuredPretitle: 'Boss Battles',
      featuredTitle: 'Arcade Highlights',
      featuredSubtitle: 'Top arcade tournaments, speedruns, and hardware hacking quests.',
      eventsPretitle: 'Stage Select',
      eventsTitle: 'Tournament Events',
      eventsSubtitle: 'Select your stage and gear up for high-score challenges.',
      schedulePretitle: 'Quest Itinerary',
      scheduleTitle: 'Tournament Schedule',
      scheduleSubtitle: 'Stage timeline across all arena maps and retro tracks.',
      scheduleGuideHeading: 'How to read this schedule',
      scheduleGuideText: 'When events share a time slot, we group them under one heading and show them side by side. Each card keeps its own venue, category and exact timing, so nothing is hidden. On mobile they stack in the same order.',
      registerPretitle: 'Player Sign-in',
      registerTitle: 'Player Registration',
      registerSubtitle: 'Claim your arcade token and register your team roster.',
      ticketPassHeader: 'ARCADE TOKEN PASS',
      ticketPassPill: 'Player 1 Ready',
      emptyTitle: 'Stage Empty',
      emptySubtitle: 'No challenges found for the current combination.',
      footerTagline: 'Retro Edition Hackathon & Creative Games Gathering.',
      footerNote: '8-Bit Arcade Experience • Powered by Pure Vanilla Web Architecture'
    }
  },

  nature: {
    name: 'nature',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap',
    copy: {
      heroKicker: 'SUSTAINABLE INNOVATION & TECH SUMMIT',
      heroTagline: 'Cultivating green engineering, organic artistry, and collaborative problem solving.',
      heroCtaExplore: 'Browse Sessions',
      heroCtaSchedule: 'Summit Schedule',
      countdownTitle: 'Countdown to Opening Keynote',
      countdownLive: 'The Summit is in full bloom! Active sessions live now.',
      countdownEnded: 'Harvest complete! Thank you for joining TECHNOVA, see you next year!',
      featuredPretitle: 'Core Tracks',
      featuredTitle: 'Summit Highlights',
      featuredSubtitle: 'Featured eco-tech solutions, open-source sprints, and creative workshops.',
      eventsPretitle: 'Track Catalog',
      eventsTitle: 'Summit Sessions',
      eventsSubtitle: 'Discover workshops, collaborative sprints, and campus gatherings.',
      schedulePretitle: 'Daily Program',
      scheduleTitle: 'Program Schedule',
      scheduleSubtitle: 'Harmonized event timeline across all campus pavilions.',
      scheduleGuideHeading: 'How to read this schedule',
      scheduleGuideText: 'When events share a time slot, we group them under one heading and show them side by side. Each card keeps its own venue, category and exact timing, so nothing is hidden. On mobile they stack in the same order.',
      registerPretitle: 'Delegate Pass',
      registerTitle: 'Delegate Registration',
      registerSubtitle: 'Register for open tracks, maker challenges, and evening sessions.',
      ticketPassHeader: 'DELEGATE PASS',
      ticketPassPill: 'Pass Confirmed',
      emptyTitle: 'No Sessions Available',
      emptySubtitle: 'No events match the selected category and day filters.',
      footerTagline: 'Sustainable Innovation Hackathon & Cultural Showcase.',
      footerNote: 'Eco-Harmonic Experience • Powered by Pure Vanilla Web Architecture'
    }
  }
};

/**
 * Get string copy for the currently active theme
 */
function getThemeCopy(key, fallback = '') {
  const current = THEME_PRESETS[ACTIVE_THEME] || THEME_PRESETS.space;
  return current.copy[key] || fallback;
}

/**
 * Apply theme attribute, load optional Google Fonts asynchronously,
 * and populate all [data-theme-copy="key"] DOM nodes.
 */
(function initializeThemeEngine() {
  if (typeof document === 'undefined') return;

  // 1. Set data-theme on <html> element
  document.documentElement.setAttribute('data-theme', ACTIVE_THEME);

  // 2. Load web font asynchronously for active theme (if online; does not block offline execution)
  const currentPreset = THEME_PRESETS[ACTIVE_THEME] || THEME_PRESETS.space;
  if (currentPreset && currentPreset.fontUrl) {
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = currentPreset.fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } catch (_) {
      // Offline fallback: system fonts are defined in CSS variables
    }
  }

  // 3. Inject narrative copy into DOM elements on DOMContentLoaded
  function populateThemeCopy() {
    const copyElements = document.querySelectorAll('[data-theme-copy]');
    copyElements.forEach(el => {
      const copyKey = el.getAttribute('data-theme-copy');
      const text = getThemeCopy(copyKey);
      if (text) {
        el.textContent = text;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateThemeCopy);
  } else {
    populateThemeCopy();
  }
})();
