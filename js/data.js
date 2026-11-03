/**
 * TECHNOVA 2027 - Single Source of Truth & Dataset
 * Defines core festival constants, category configurations, event records,
 * and pure data filtering, formatting, and persistence functions.
 * Compatible with double-click file:// execution and Node.js test runners.
 */

// Global Festival Namespace
const FEST_NAMESPACE = (typeof window !== 'undefined') ? (window.FEST = window.FEST || {}) : (typeof global !== 'undefined' ? (global.FEST = global.FEST || {}) : {});

// Core Festival Metadata (Single Source of Truth)
const FEST_NAME = "TECHNOVA";
const FEST_YEAR = "2027";
const FEST_DAYS = ["2027-02-12", "2027-02-13"];
const VENUE_NAME = "Samrat Ashok Technological Institute (SATI), Vidisha";
const COLLEGE_LOGO = "assets/sati-logo.svg";
const CONTACT_EMAIL = "fest@example.edu";

// Travel Buffer Constant: minimum time needed to transition between different venues without rushing
const TRAVEL_BUFFER_MIN = 10;

// Campus Venue Reference Metadata (Authentic Venue Infrastructure)
const CAMPUS_IMAGES = [
  {
    id: "main-complex",
    title: "SATI Academic Complex",
    venue: "Main Innovation Lab",
    description: "Central engineering complex hosting Code Crack 3.0 Hackathon and system tracks."
  },
  {
    id: "computing-center",
    title: "Computing & IT Complex",
    venue: "Lab 2 & Cyber Security Lab 4",
    description: "High-speed networked computing labs hosting algorithmic sprints and CTF gauntlets."
  },
  {
    id: "auditorium-arena",
    title: "SATI Central Auditorium & Amphitheatre",
    venue: "Central Stage Auditorium & Open Air Amphitheatre",
    description: "Main campus auditoriums for battle of the bands, street dance, and EDM finale."
  }
];

// Category Configuration: single mapping for labels, badge classes, and icons
const CATEGORIES = {
  Technical: {
    id: "Technical",
    label: "Technical",
    badgeClass: "badge-cat-tech",
    icon: "⚡"
  },
  Cultural: {
    id: "Cultural",
    label: "Cultural",
    badgeClass: "badge-cat-cultural",
    icon: "🎭"
  },
  Gaming: {
    id: "Gaming",
    label: "Gaming",
    badgeClass: "badge-cat-gaming",
    icon: "🎮"
  }
};

// Time of Day Ranges (Constants: Morning before 12:00, Afternoon 12:00-17:00, Evening after 17:00)
const TIME_OF_DAY = {
  morning: { id: "morning", label: "Morning (< 12:00)", maxMinutes: 720 },
  afternoon: { id: "afternoon", label: "Afternoon (12:00 – 17:00)", minMinutes: 720, maxMinutes: 1020 },
  evening: { id: "evening", label: "Evening (> 17:00)", minMinutes: 1020 }
};

// 12 Realistic Festival Events with team sizes and rules
const FESTIVAL_EVENTS = [
  {
    id: "sprint",
    title: "Sprint",
    category: "Technical",
    date: "2027-02-12",
    start: "10:00",
    end: "12:00",
    venue: "Lab 2",
    description: "High-octane algorithmic problem-solving sprint. Racers decode complex graph traversals and memory optimizations against a running timer.",
    featured: true,
    teamMin: 1,
    teamMax: 2,
    rules: [
      "Individual or duo participation permitted.",
      "Standard algorithms & data structures evaluated on test-case pass rate, execution time, and memory limits.",
      "Plagiarism detection active; external LLM usage during sprint strictly prohibited."
    ]
  },
  {
    id: "pixel-arena",
    title: "Pixel Arena: Valorant Showdown",
    category: "Gaming",
    date: "2027-02-12",
    start: "10:00",
    end: "12:00",
    venue: "E-Sports Dome A",
    description: "Tactical 5v5 competitive FPS battle on dedicated tournament rigs with spectator shoutcasting, live HUD telemetry, and elimination brackets.",
    featured: false,
    teamMin: 5,
    teamMax: 5,
    rules: [
      "Standard 5v5 competitive tournament map pool with coin-toss map ban phase.",
      "Players may bring their own peripherals (mice, keyboards, headsets) or use venue rigs.",
      "Double elimination tournament bracket with official tournament referee monitoring."
    ]
  },
  {
    id: "robowars",
    title: "RoboWars: Mecha Havoc",
    category: "Technical",
    date: "2027-02-12",
    start: "11:00",
    end: "12:30",
    venue: "Central Courtyard",
    description: "Heavyweight battle bots clash inside a bulletproof transparent arena. Featuring high-RPM kinetic spinners and pneumatic flippers.",
    featured: true,
    teamMin: 2,
    teamMax: 4,
    rules: [
      "Combat bots must pass safety technical inspection and weigh under the 30kg class limit.",
      "Active weapon kill-switches and radio fail-safe cutoffs must be demonstrated prior to entry.",
      "Three-minute combat rounds inside bulletproof polycarbonate enclosure scored on aggression and damage."
    ]
  },
  {
    id: "code-crack",
    title: "Code Crack 3.0 Hackathon",
    category: "Technical",
    date: "2027-02-12",
    start: "14:00",
    end: "16:30",
    venue: "Main Innovation Lab",
    description: "The flagship engineering sprint. Build autonomous AI workflows, zero-knowledge proofs, or resilient decentralized systems within intensive tracks.",
    featured: true,
    teamMin: 2,
    teamMax: 4,
    rules: [
      "Fresh repositories only; pre-built code is strictly disqualified.",
      "Teams must submit Git commit logs and an architecture pitch deck before the cutoff bell.",
      "Live 5-minute prototype demonstration before industry judging panel."
    ]
  },
  {
    id: "beat-drop",
    title: "Beat Drop: Battle of the Bands",
    category: "Cultural",
    date: "2027-02-12",
    start: "14:00",
    end: "16:30",
    venue: "Open Air Amphitheatre",
    description: "College rock, indie fusion, and synthwave bands go head-to-head on the acoustic main stage equipped with arena line arrays.",
    featured: false,
    teamMin: 3,
    teamMax: 8,
    rules: [
      "15-minute stage window including instrument line setup and level check.",
      "Original compositions or creative covers permitted across rock, indie, and fusion.",
      "Standard drum kit, bass amp, and arena PA line arrays provided by the fest committee."
    ]
  },
  {
    id: "cosmic-fifa",
    title: "FC 27 Super Cup",
    category: "Gaming",
    date: "2027-02-12",
    start: "14:00",
    end: "16:30",
    venue: "Gaming Lounge B",
    description: "Ultra-competitive 1v1 virtual football tournament played on low-latency PlayStation 5 Pro consoles with international tournament rules.",
    featured: false,
    teamMin: 1,
    teamMax: 1,
    rules: [
      "1v1 single player tactical knockout bracket.",
      "6-minute halves with tactical defending settings on PS5 Pro consoles.",
      "Standard club and national rosters only; custom modified formations prohibited."
    ]
  },
  {
    id: "prompt-wars",
    title: "PromptMatrix: Generative AI Duel",
    category: "Technical",
    date: "2027-02-13",
    start: "10:00",
    end: "12:30",
    venue: "Tech Seminar Hall 1",
    description: "Contestants engineer complex multi-turn LLM pipelines, construct autonomous agent swarms, and crack synthetic hallucination challenges live.",
    featured: true,
    teamMin: 1,
    teamMax: 2,
    rules: [
      "Live prompt engineering against mystery benchmark test suites.",
      "Solutions judged on precision, token cost efficiency, and hallucination reduction.",
      "Internet-restricted testing sandboxes provided on campus workstations."
    ]
  },
  {
    id: "cosmic-rhythm",
    title: "Cosmic Rhythm: Street Dance Battle",
    category: "Cultural",
    date: "2027-02-13",
    start: "10:00",
    end: "12:30",
    venue: "Central Stage Auditorium",
    description: "All-style dance combat featuring locking, popping, waacking, and breakdancing with live beat improvisation and audience decibel judging.",
    featured: false,
    teamMin: 1,
    teamMax: 3,
    rules: [
      "All-style street dance combat (popping, locking, breaking, waacking).",
      "Round 1: 60-second freestyle cypher; Finals: 1v1 face-off with DJ improvisation.",
      "Scored on musicality, technical precision, crowd decibels, and stage presence."
    ]
  },
  {
    id: "rocket-league",
    title: "AeroStrike: Rocket League Open",
    category: "Gaming",
    date: "2027-02-13",
    start: "10:00",
    end: "12:30",
    venue: "E-Sports Dome B",
    description: "High-flying supersonic vehicular soccer tournament with 3v3 team rosters, aerial trick shots, and championship trophy contention.",
    featured: false,
    teamMin: 3,
    teamMax: 3,
    rules: [
      "3v3 competitive cross-platform tournament.",
      "Best of 3 series in qualifiers; Best of 5 in semi-finals and finals.",
      "Server region locked to lowest ping campus dedicated network."
    ]
  },
  {
    id: "space-fashion",
    title: "Nebula Runway: Sci-Fi Cosplay & Wearables",
    category: "Cultural",
    date: "2027-02-13",
    start: "14:00",
    end: "16:00",
    venue: "Grand Auditorium",
    description: "Avant-garde wearable tech, cyberpunk animatronics, and futuristic runway aesthetics evaluated by top industrial designers.",
    featured: false,
    teamMin: 1,
    teamMax: 4,
    rules: [
      "Wearable electronics, animatronics, or custom sci-fi cosplay garments.",
      "3-minute runway walk with lighting and presentation audio cues.",
      "Judged on craftsmanship, structural stability, circuit integration, and visual fidelity."
    ]
  },
  {
    id: "cybershield",
    title: "CyberShield: Capture The Flag",
    category: "Technical",
    date: "2027-02-13",
    start: "14:00",
    end: "17:00",
    venue: "Cyber Security Lab 4",
    description: "Intense ethical hacking gauntlet. Teams solve binary exploitation, web vulnerabilities, digital forensics, and side-channel cryptography.",
    featured: false,
    teamMin: 2,
    teamMax: 4,
    rules: [
      "Jeopardy-style CTF covering binary exploitation, web security, and cryptography.",
      "Attacking organizers' infrastructure or flag sharing leads to immediate DQ.",
      "Flags follow the standard format: TECHNOVA{...}."
    ]
  },
  {
    id: "neon-vogue",
    title: "Starlight DJ Night & EDM Fest",
    category: "Cultural",
    date: "2027-02-13",
    start: "18:00",
    end: "21:30",
    venue: "Festival Grounds Arena",
    description: "The grand festival finale: an electronic musical showcase featuring guest headline DJs, synchronized laser mapping, and immersive soundscapes.",
    featured: false,
    teamMin: 1,
    teamMax: 1,
    rules: [
      "Festival closing musical night; all registered festival badge holders admitted.",
      "Entry passes verified at Festival Grounds security gates.",
      "College campus safety, noise limits, and ID badge guidelines apply at all times."
    ]
  }
];

/* ==========================================================================
   Pure Time, Duration & Data Calculation Functions
   ========================================================================== */

/**
 * Convert "HH:MM" 24h string to minutes from midnight
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {number} Minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Convert minutes from midnight back to "HH:MM" 24h string
 * @param {number} minutes - Minutes from midnight
 * @returns {string} Time formatted as "HH:MM"
 */
function minutesToTimeStr(minutes) {
  const safeMin = Math.max(0, Math.floor(minutes || 0));
  const h = Math.floor(safeMin / 60) % 24;
  const m = safeMin % 60;
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Derive event duration in minutes from its start and end times
 * @param {Object} event - Event object with start and end strings
 * @returns {number} Duration in minutes
 */
function getEventDurationMinutes(event) {
  if (!event || !event.start || !event.end) return 0;
  return Math.max(0, timeToMinutes(event.end) - timeToMinutes(event.start));
}

/**
 * Format duration in minutes to human-readable string (e.g., "2h 30m" or "45m")
 * @param {number} minutes - Duration in minutes
 * @returns {string} Human formatted duration
 */
function formatDuration(minutes) {
  const mTotal = Math.max(0, Math.floor(minutes || 0));
  const h = Math.floor(mTotal / 60);
  const m = mTotal % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Determine Time of Day category for a given start time string
 * Morning: before 12:00
 * Afternoon: 12:00 to 17:00
 * Evening: after 17:00
 * @param {string} timeStr - Start time in "HH:MM" format
 * @returns {string} 'morning', 'afternoon', or 'evening'
 */
function getTimeOfDay(timeStr) {
  if (!timeStr) return '';
  const min = timeToMinutes(timeStr);
  if (min < TIME_OF_DAY.morning.maxMinutes) return 'morning';
  if (min < TIME_OF_DAY.afternoon.maxMinutes) return 'afternoon';
  return 'evening';
}

// Attach derived duration to all events on load
FESTIVAL_EVENTS.forEach(ev => {
  ev.duration = getEventDurationMinutes(ev);
  ev.durationFormatted = formatDuration(ev.duration);
});

/* ==========================================================================
   Shared Formatting Helpers
   ========================================================================== */

/**
 * Format 24h time ("10:00") into 12h AM/PM ("10:00 AM")
 */
function formatTime12h(time24) {
  if (!time24) return '';
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Format ISO date string into human readable fest day
 */
function formatDateLabel(dateStr) {
  if (dateStr === '2027-02-12') return 'Day 1 • Friday, 12 Feb 2027';
  if (dateStr === '2027-02-13') return 'Day 2 • Saturday, 13 Feb 2027';
  return dateStr;
}

/**
 * Get category metadata safely from CATEGORIES config
 */
function getCategoryMeta(categoryName) {
  return CATEGORIES[categoryName] || {
    id: categoryName,
    label: categoryName,
    badgeClass: 'badge-default',
    icon: '✦'
  };
}

/**
 * Derive vital festival statistics purely from data (no invented facts)
 */
function getDerivedFestivalStats() {
  const venuesSet = new Set(FESTIVAL_EVENTS.map(e => e.venue));
  return {
    totalEvents: FESTIVAL_EVENTS.length,
    totalDays: FEST_DAYS.length,
    totalCategories: Object.keys(CATEGORIES).length,
    totalVenues: venuesSet.size
  };
}

/* ==========================================================================
   Saved Events / Bookmark Storage Helper (LocalStorage with Safe Fallback)
   ========================================================================== */

/**
 * Retrieve saved event IDs from localStorage
 * @returns {Array<string>} Array of saved event IDs
 */
function getSavedEventIds() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('technova_saved_events');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (_) {}
  return [];
}

/**
 * Store saved event IDs in localStorage
 * @param {Array<string>} ids - Array of saved event IDs
 * @returns {boolean} Success status
 */
function setSavedEventIds(ids) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('technova_saved_events', JSON.stringify(ids || []));
      // Dispatch custom event for cross-component reactive updates
      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('fest:saved-changed', { detail: { savedIds: ids } }));
      }
      return true;
    }
  } catch (_) {}
  return false;
}

/**
 * Toggle bookmark status for an event ID
 * @param {string} eventId - ID of the event to bookmark/unbookmark
 * @returns {boolean} New saved state (true if now saved, false if removed)
 */
function toggleSavedEventId(eventId) {
  if (!eventId) return false;
  const current = getSavedEventIds();
  const index = current.indexOf(eventId);
  let isNowSaved = false;
  if (index >= 0) {
    current.splice(index, 1);
    isNowSaved = false;
  } else {
    current.push(eventId);
    isNowSaved = true;
  }
  setSavedEventIds(current);
  return isNowSaved;
}

/**
 * Check if a given event ID is bookmarked
 * @param {string} eventId - ID of the event
 * @returns {boolean} True if bookmarked
 */
function isEventSaved(eventId) {
  if (!eventId) return false;
  return getSavedEventIds().includes(eventId);
}

/* ==========================================================================
   Pure Filter & Sorting Engine (Single Shared Logic)
   Used across Events, Schedule, and My Plan
   ========================================================================== */

/**
 * Pure function to filter and sort festival events based on combinable criteria.
 * Does not mutate original events array.
 *
 * @param {Array} events - List of festival event objects.
 * @param {Object} criteria - Filtering and sorting criteria.
 *   - q / search: string query matching title, description, venue, or category.
 *   - cat / category: string ('All' or matching category key).
 *   - day: string ('All' or ISO date string).
 *   - venue: string ('All' or exact venue name).
 *   - tod / timeOfDay: string ('All', 'morning', 'afternoon', 'evening').
 *   - saved / savedOnly: boolean (filter to only bookmarked events).
 *   - savedIds: Array or Set of saved event IDs (optional override for testing).
 *   - sort: string ('time', 'title', 'category', 'duration').
 * @returns {Array} Filtered and sorted events array.
 */
function filterEvents(events, criteria = {}) {
  if (!Array.isArray(events)) return [];

  const q = (criteria.q || criteria.search || '').trim().toLowerCase();

  const rawCat = (criteria.cat || criteria.category || 'All').trim();
  const cat = (rawCat.toLowerCase() === 'all' || rawCat === '') ? 'All' : rawCat;

  const rawDay = (criteria.day || 'All').trim();
  const day = (rawDay.toLowerCase() === 'all' || rawDay === '') ? 'All' : rawDay;

  const rawVenue = (criteria.venue || 'All').trim();
  const venue = (rawVenue.toLowerCase() === 'all' || rawVenue === '') ? 'All' : rawVenue;

  const rawTod = (criteria.tod || criteria.timeOfDay || 'All').trim().toLowerCase();
  const tod = (rawTod === 'all' || rawTod === '') ? 'All' : rawTod;

  const savedOnly = Boolean(criteria.saved || criteria.savedOnly);

  // Allow custom savedIds array/set or read from storage
  let savedIdsList = [];
  if (criteria.savedIds) {
    savedIdsList = Array.isArray(criteria.savedIds) ? criteria.savedIds : Array.from(criteria.savedIds);
  } else if (typeof getSavedEventIds === 'function') {
    savedIdsList = getSavedEventIds();
  }

  const sortBy = (criteria.sort || 'time').trim().toLowerCase();

  const filtered = events.filter(event => {
    // 1. Text search query (title, description, venue, category)
    if (q) {
      const titleMatch = (event.title || '').toLowerCase().includes(q);
      const descMatch = (event.description || '').toLowerCase().includes(q);
      const venueMatch = (event.venue || '').toLowerCase().includes(q);
      const catMatch = (event.category || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !venueMatch && !catMatch) {
        return false;
      }
    }

    // 2. Category filter
    if (cat !== 'All' && event.category.toLowerCase() !== cat.toLowerCase()) {
      return false;
    }

    // 3. Day filter
    if (day !== 'All' && event.date !== day) {
      return false;
    }

    // 4. Venue filter
    if (venue !== 'All' && event.venue.toLowerCase() !== venue.toLowerCase()) {
      return false;
    }

    // 5. Time of day filter
    if (tod !== 'All') {
      const eventTod = getTimeOfDay(event.start);
      if (eventTod.toLowerCase() !== tod.toLowerCase()) {
        return false;
      }
    }

    // 6. Saved only filter
    if (savedOnly) {
      if (!savedIdsList.includes(event.id)) {
        return false;
      }
    }

    return true;
  });

  // Sort results deterministically (stable sort with tie-breakers)
  return filtered.sort((a, b) => {
    if (sortBy === 'title') {
      const cmp = (a.title || '').localeCompare(b.title || '');
      if (cmp !== 0) return cmp;
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    }

    if (sortBy === 'category') {
      const cmp = (a.category || '').localeCompare(b.category || '');
      if (cmp !== 0) return cmp;
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    }

    if (sortBy === 'duration') {
      const durA = getEventDurationMinutes(a);
      const durB = getEventDurationMinutes(b);
      const diff = durA - durB;
      if (diff !== 0) return diff;
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    }

    // Default sort: 'time' (date ascending -> start time ascending -> title alphabetical)
    const dateCmp = (a.date || '').localeCompare(b.date || '');
    if (dateCmp !== 0) return dateCmp;
    const timeDiff = timeToMinutes(a.start) - timeToMinutes(b.start);
    if (timeDiff !== 0) return timeDiff;
    return (a.title || '').localeCompare(b.title || '');
  });
}

/* ==========================================================================
   Pure URL Parameter Helpers (State Synchronization)
   ========================================================================== */

/**
 * Parse URL search string into a clean, sanitized filter criteria object.
 * Safely ignores invalid values and falls back to defaults.
 * @param {string} searchString - e.g. "?q=hack&cat=Technical&day=2027-02-12&saved=1"
 * @returns {Object} Sanitized criteria object
 */
function parseFilterParams(searchString) {
  const USP = typeof URLSearchParams !== 'undefined' ? URLSearchParams : (typeof global !== 'undefined' ? global.URLSearchParams : null);
  const params = USP ? new USP(searchString || '') : { get: () => null };
  const criteria = {
    q: (params.get('q') || '').trim(),
    cat: 'All',
    day: 'All',
    venue: 'All',
    tod: 'All',
    sort: 'time',
    savedOnly: params.get('saved') === '1' || params.get('saved') === 'true'
  };

  // Validate category
  const rawCat = params.get('cat');
  if (rawCat) {
    const validCats = Object.keys(CATEGORIES);
    const matched = validCats.find(c => c.toLowerCase() === rawCat.toLowerCase());
    if (matched) criteria.cat = matched;
  }

  // Validate day
  const rawDay = params.get('day');
  if (rawDay && FEST_DAYS.includes(rawDay)) {
    criteria.day = rawDay;
  }

  // Validate venue
  const rawVenue = params.get('venue');
  if (rawVenue) {
    const validVenues = [...new Set(FESTIVAL_EVENTS.map(e => e.venue))];
    const matched = validVenues.find(v => v.toLowerCase() === rawVenue.toLowerCase());
    if (matched) criteria.venue = matched;
  }

  // Validate time of day
  const rawTod = params.get('tod');
  if (rawTod && ['morning', 'afternoon', 'evening'].includes(rawTod.toLowerCase())) {
    criteria.tod = rawTod.toLowerCase();
  }

  // Validate sort
  const rawSort = params.get('sort');
  if (rawSort && ['time', 'title', 'category', 'duration'].includes(rawSort.toLowerCase())) {
    criteria.sort = rawSort.toLowerCase();
  }

  return criteria;
}

/**
 * Serialize a criteria object into URLSearchParams string, omitting defaults to keep URLs clean.
 * @param {Object} criteria - Current active criteria
 * @returns {URLSearchParams} URLSearchParams object
 */
function serializeFilterParams(criteria) {
  const params = new URLSearchParams();
  if (criteria.q && criteria.q.trim()) params.set('q', criteria.q.trim());
  if (criteria.cat && criteria.cat !== 'All') params.set('cat', criteria.cat);
  if (criteria.day && criteria.day !== 'All') params.set('day', criteria.day);
  if (criteria.venue && criteria.venue !== 'All') params.set('venue', criteria.venue);
  if (criteria.tod && criteria.tod !== 'All') params.set('tod', criteria.tod);
  if (criteria.sort && criteria.sort !== 'time') params.set('sort', criteria.sort);
  if (criteria.savedOnly) params.set('saved', '1');
  return params;
}

/* ==========================================================================
   Export to Global Namespace (window.FEST / global.FEST)
   ========================================================================== */

FEST_NAMESPACE.FEST_NAME = FEST_NAME;
FEST_NAMESPACE.FEST_YEAR = FEST_YEAR;
FEST_NAMESPACE.FEST_DAYS = FEST_DAYS;
FEST_NAMESPACE.VENUE_NAME = VENUE_NAME;
FEST_NAMESPACE.COLLEGE_LOGO = COLLEGE_LOGO;
FEST_NAMESPACE.CONTACT_EMAIL = CONTACT_EMAIL;
FEST_NAMESPACE.TRAVEL_BUFFER_MIN = TRAVEL_BUFFER_MIN;
FEST_NAMESPACE.CAMPUS_IMAGES = CAMPUS_IMAGES;
FEST_NAMESPACE.CATEGORIES = CATEGORIES;
FEST_NAMESPACE.TIME_OF_DAY = TIME_OF_DAY;
FEST_NAMESPACE.FESTIVAL_EVENTS = FESTIVAL_EVENTS;

FEST_NAMESPACE.timeToMinutes = timeToMinutes;
FEST_NAMESPACE.minutesToTimeStr = minutesToTimeStr;
FEST_NAMESPACE.getEventDurationMinutes = getEventDurationMinutes;
FEST_NAMESPACE.formatDuration = formatDuration;
FEST_NAMESPACE.getTimeOfDay = getTimeOfDay;

FEST_NAMESPACE.formatTime12h = formatTime12h;
FEST_NAMESPACE.formatDateLabel = formatDateLabel;
FEST_NAMESPACE.getCategoryMeta = getCategoryMeta;
FEST_NAMESPACE.getDerivedFestivalStats = getDerivedFestivalStats;

FEST_NAMESPACE.getSavedEventIds = getSavedEventIds;
FEST_NAMESPACE.setSavedEventIds = setSavedEventIds;
FEST_NAMESPACE.toggleSavedEventId = toggleSavedEventId;
FEST_NAMESPACE.isEventSaved = isEventSaved;

FEST_NAMESPACE.filterEvents = filterEvents;
FEST_NAMESPACE.parseFilterParams = parseFilterParams;
FEST_NAMESPACE.serializeFilterParams = serializeFilterParams;
