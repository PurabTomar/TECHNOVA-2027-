/**
 * TECHNOVA 2027 - Automated Test Suite
 * Covers Schedule Overlap Clustering, Multi-criteria Combinable Filtering,
 * Sorting Stability, and Resilient URL Parameter Parsing.
 * Automatically runs and outputs PASS/FAIL to the browser console when ?test=1 is present in the URL.
 * Also executable directly in headless Node.js.
 */

function runFestivalTestSuite() {
  const isNode = typeof window === 'undefined';
  const logStyleTitle = isNode ? '' : 'color: #00f3ff; font-weight: bold; font-size: 1.1em;';
  const logStylePass = isNode ? '' : 'color: #00ff88;';
  const logStyleFail = isNode ? '' : 'color: #ff3366; font-weight: bold;';

  console.log(isNode ? '[TECHNOVA Test Suite] Starting Automated Verification...' : '%c[TECHNOVA Test Suite] Starting Automated Verification...', logStyleTitle);

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(isNode ? `[PASS] ${testName}` : `%c[PASS] ${testName}`, logStylePass);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failed++;
    }
  }

  /* --------------------------------------------------------------------------
     1. Schedule Interval Overlap Clustering
     -------------------------------------------------------------------------- */
  // Case 1: Same start time (Simultaneous events)
  const caseSameStart = [
    { id: 'ev1', title: 'Sprint', start: '10:00', end: '12:00' },
    { id: 'ev2', title: 'Pixel Arena', start: '10:00', end: '12:00' }
  ];
  const resSame = clusterOverlappingEvents(caseSameStart);
  assert(
    'Schedule 1. Same start time (10:00-12:00 & 10:00-12:00) groups into 1 cluster',
    resSame.length === 1 && resSame[0].events.length === 2 && resSame[0].isParallel === true,
    `Expected 1 cluster with 2 parallel events, got ${resSame.length}`
  );

  // Case 2: Partial overlap (10:00-12:00 with 11:00-12:30)
  const casePartial = [
    { id: 'ev1', title: 'Sprint', start: '10:00', end: '12:00' },
    { id: 'ev3', title: 'RoboWars', start: '11:00', end: '12:30' }
  ];
  const resPartial = clusterOverlappingEvents(casePartial);
  assert(
    'Schedule 2. Partial overlap (10:00-12:00 & 11:00-12:30) groups into span 10:00-12:30',
    resPartial.length === 1 && resPartial[0].startMinutes === 600 && resPartial[0].endMinutes === 750,
    `Expected span 600-750, got ${resPartial[0]?.startMinutes}-${resPartial[0]?.endMinutes}`
  );

  // Case 3: Back-to-back events (10:00-11:00 and 11:00-12:00 must NOT group)
  const caseBackToBack = [
    { id: 'evA', title: 'Morning Keynote', start: '10:00', end: '11:00' },
    { id: 'evB', title: 'Hands-on Workshop', start: '11:00', end: '12:00' }
  ];
  const resB2B = clusterOverlappingEvents(caseBackToBack);
  assert(
    'Schedule 3. Back-to-back events (10:00-11:00 & 11:00-12:00) must NOT group',
    resB2B.length === 2 && resB2B[0].events.length === 1 && resB2B[1].events.length === 1,
    `Expected 2 independent clusters, got ${resB2B.length}`
  );

  /* --------------------------------------------------------------------------
     2. Multi-Criteria Combinable Filtering
     -------------------------------------------------------------------------- */
  // Case 4: Category + Day combo
  const techDay1 = filterEvents(FESTIVAL_EVENTS, { cat: 'Technical', day: '2027-02-12' });
  assert(
    'Filter 1. Category "Technical" + Day "2027-02-12" matches expected events',
    techDay1.length === 3 && techDay1.every(e => e.category === 'Technical' && e.date === '2027-02-12'),
    `Expected 3 events, got ${techDay1.length}`
  );

  // Case 5: Full-text search (title, description, venue, category)
  const searchValorant = filterEvents(FESTIVAL_EVENTS, { q: 'valorant' });
  assert(
    'Filter 2. Search "valorant" matches "Pixel Arena: Valorant Showdown"',
    searchValorant.length === 1 && searchValorant[0].id === 'pixel-arena',
    `Expected pixel-arena, got ${searchValorant[0]?.id}`
  );

  const searchCourtyard = filterEvents(FESTIVAL_EVENTS, { q: 'courtyard' });
  assert(
    'Filter 3. Search "courtyard" matches RoboWars venue',
    searchCourtyard.length === 1 && searchCourtyard[0].id === 'robowars',
    `Expected robowars, got ${searchCourtyard[0]?.id}`
  );

  // Case 6: Time of day ranges
  const morningEvents = filterEvents(FESTIVAL_EVENTS, { tod: 'morning' });
  const allMorning = morningEvents.every(e => timeToMinutes(e.start) < 720);
  assert(
    'Filter 4. Time of Day "morning" returns only events starting before 12:00',
    morningEvents.length > 0 && allMorning,
    `Found event starting at or after 12:00: ${morningEvents.find(e => timeToMinutes(e.start) >= 720)?.start}`
  );

  const afternoonEvents = filterEvents(FESTIVAL_EVENTS, { tod: 'afternoon' });
  const allAfternoon = afternoonEvents.every(e => timeToMinutes(e.start) >= 720 && timeToMinutes(e.start) < 1020);
  assert(
    'Filter 5. Time of Day "afternoon" returns events starting 12:00 - 17:00',
    afternoonEvents.length > 0 && allAfternoon,
    `Found event outside afternoon window: ${afternoonEvents.find(e => timeToMinutes(e.start) < 720 || timeToMinutes(e.start) >= 1020)?.start}`
  );

  const eveningEvents = filterEvents(FESTIVAL_EVENTS, { tod: 'evening' });
  const allEvening = eveningEvents.every(e => timeToMinutes(e.start) >= 1020);
  assert(
    'Filter 6. Time of Day "evening" returns events starting at or after 17:00',
    eveningEvents.length === 1 && eveningEvents[0].id === 'neon-vogue' && allEvening,
    `Expected neon-vogue, got ${eveningEvents.map(e => e.id).join(', ')}`
  );

  // Case 7: Saved only filter
  const savedMock = ['sprint', 'robowars'];
  const savedFiltered = filterEvents(FESTIVAL_EVENTS, { savedOnly: true, savedIds: savedMock });
  assert(
    'Filter 7. "Saved Only" matches only bookmarked event IDs',
    savedFiltered.length === 2 && savedFiltered.every(e => savedMock.includes(e.id)),
    `Expected 2 saved events, got ${savedFiltered.length}`
  );

  // Case 8: Empty results state
  const impossibleFilter = filterEvents(FESTIVAL_EVENTS, { cat: 'Gaming', venue: 'Lab 2' });
  assert(
    'Filter 8. Impossible combination returns empty array without throwing',
    Array.isArray(impossibleFilter) && impossibleFilter.length === 0,
    `Expected 0 results, got ${impossibleFilter.length}`
  );

  /* --------------------------------------------------------------------------
     3. Sorting Stability
     -------------------------------------------------------------------------- */
  // Case 9: Sort by Title A-Z
  const sortedTitle = filterEvents(FESTIVAL_EVENTS, { sort: 'title' });
  const isAlphabetical = sortedTitle.every((ev, i) => i === 0 || sortedTitle[i - 1].title.localeCompare(ev.title) <= 0);
  assert(
    'Sorting 1. Sort by "title" orders events alphabetically A to Z',
    isAlphabetical && sortedTitle[0].title.startsWith('AeroStrike'),
    `First title is: ${sortedTitle[0]?.title}`
  );

  // Case 10: Sort by Duration
  const sortedDuration = filterEvents(FESTIVAL_EVENTS, { sort: 'duration' });
  const isDurationAsc = sortedDuration.every((ev, i) => i === 0 || sortedDuration[i - 1].duration <= ev.duration);
  assert(
    'Sorting 2. Sort by "duration" orders events from shortest to longest duration',
    isDurationAsc && sortedDuration[0].duration <= sortedDuration[sortedDuration.length - 1].duration,
    `Durations: ${sortedDuration.map(e => e.duration).join(', ')}`
  );

  /* --------------------------------------------------------------------------
     4. URL Parameter Parsing & Resilience
     -------------------------------------------------------------------------- */
  // Case 11: Valid URL parameters
  const validUrl = '?q=sprint&cat=Technical&day=2027-02-12&venue=Lab%202&tod=morning&sort=duration&saved=1';
  const parsedValid = parseFilterParams(validUrl);
  assert(
    'URL 1. Valid search params parsed accurately into criteria object',
    parsedValid.q === 'sprint' &&
    parsedValid.cat === 'Technical' &&
    parsedValid.day === '2027-02-12' &&
    parsedValid.venue === 'Lab 2' &&
    parsedValid.tod === 'morning' &&
    parsedValid.sort === 'duration' &&
    parsedValid.savedOnly === true,
    `Parsed criteria: ${JSON.stringify(parsedValid)}`
  );

  // Case 12: Invalid URL parameters safely ignored
  const invalidUrl = '?cat=NonExistent&day=1999-01-01&venue=Mars&tod=midnight&sort=broken&saved=xyz';
  const parsedInvalid = parseFilterParams(invalidUrl);
  assert(
    'URL 2. Invalid parameter values safely ignored and fall back to defaults',
    parsedInvalid.cat === 'All' &&
    parsedInvalid.day === 'All' &&
    parsedInvalid.venue === 'All' &&
    parsedInvalid.tod === 'All' &&
    parsedInvalid.sort === 'time' &&
    parsedInvalid.savedOnly === false,
    `Parsed fallback: ${JSON.stringify(parsedInvalid)}`
  );

  console.log(
    isNode
      ? `[TECHNOVA Test Suite Completed] ${passed} passed, ${failed} failed.`
      : `%c[TECHNOVA Test Suite Completed] ${passed} passed, ${failed} failed.`,
    `color: ${failed === 0 ? '#00ff88' : '#ff3366'}; font-weight: bold; font-size: 1.1em;`
  );

  return { passed, failed };
}

// Global alias for compatibility
const runScheduleTests = runFestivalTestSuite;

// Auto-trigger if URL has ?test=1
if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string' && window.location.search.includes('test=1')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runFestivalTestSuite, 100);
  });
}
