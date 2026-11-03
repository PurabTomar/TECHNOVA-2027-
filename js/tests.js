/**
 * TECHNOVA 2027 - Automated Test Suite
 * Tests schedule interval overlap clustering, back-to-back boundaries, and filtering.
 * Automatically runs and outputs PASS/FAIL to the browser console when ?test=1 is present in the URL.
 */

function runScheduleTests() {
  console.log('%c[TECHNOVA Test Suite] Running Schedule & Overlap Clustering Tests...', 'color: #00f3ff; font-weight: bold;');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`%c[PASS] ${testName}`, 'color: #00ff88;');
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failed++;
    }
  }

  // Case 1: Same start time (Simultaneous events)
  const caseSameStart = [
    { id: 'ev1', title: 'Sprint', start: '10:00', end: '12:00' },
    { id: 'ev2', title: 'Pixel Arena', start: '10:00', end: '12:00' }
  ];
  const resSame = clusterOverlappingEvents(caseSameStart);
  assert(
    '1. Same start time (10:00-12:00 & 10:00-12:00) groups into 1 cluster',
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
    '2. Partial overlap (10:00-12:00 & 11:00-12:30) groups into span 10:00-12:30',
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
    '3. Back-to-back events (10:00-11:00 & 11:00-12:00) must NOT group',
    resB2B.length === 2 && resB2B[0].events.length === 1 && resB2B[1].events.length === 1,
    `Expected 2 independent clusters, got ${resB2B.length}`
  );

  // Case 4: Filtered results
  const gamingEvents = FESTIVAL_EVENTS.filter(e => e.category === 'Gaming' && e.date === '2027-02-12');
  const resGaming = clusterOverlappingEvents(gamingEvents);
  const allGaming = resGaming.every(c => c.events.every(e => e.category === 'Gaming'));
  assert(
    '4. Filtered results cluster only events matching active criteria',
    allGaming && resGaming.length > 0,
    'Filtered results contain non-gaming events or failed to cluster'
  );

  console.log(`%c[TECHNOVA Test Suite Completed] ${passed} passed, ${failed} failed.`, `color: ${failed === 0 ? '#00ff88' : '#ff3366'}; font-weight: bold; font-size: 1.1em;`);
}

// Auto-trigger if URL has ?test=1
if (typeof window !== 'undefined' && window.location.search.includes('test=1')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runScheduleTests, 100);
  });
}
