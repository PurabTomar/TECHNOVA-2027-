/**
 * TECHNOVA 2027 - Single Source of Truth & Dataset
 * Defines core festival constants, category configurations, and event records.
 */

// Core Festival Metadata (Single Source of Truth)
const FEST_NAME = "TECHNOVA";
const FEST_YEAR = "2027";
const FEST_DAYS = ["2027-02-12", "2027-02-13"];
const VENUE_NAME = "Samrat Ashok Technological Institute (SATI), Vidisha";
const COLLEGE_LOGO = "assets/sati-logo.svg";
const CONTACT_EMAIL = "fest@example.edu";

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

// 12 Realistic Festival Events
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
    featured: true
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
    featured: false
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
    featured: true
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
    featured: true
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
    featured: false
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
    featured: false
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
    featured: true
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
    featured: false
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
    featured: false
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
    featured: false
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
    featured: false
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
    featured: false
  }
];

/* ==========================================================================
   Shared Formatting & Derivation Helpers
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
