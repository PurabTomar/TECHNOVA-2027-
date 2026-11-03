/**
 * TECHNOVA 2027 - Homepage Controller
 * Manages the live countdown timer, derived festival statistics,
 * and featured highlights rendering via the shared card component.
 */

(function initializeHomePage() {
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('festCountdownWrapper')) return;

    populateHeroDates();
    renderDerivedStats();
    renderFeaturedEvents();
    setupFestivalCountdown();
  });

  /**
   * Populate hero dates from FEST_DAYS (single source of truth)
   */
  function populateHeroDates() {
    const el = document.getElementById('heroDatesLabel');
    if (!el || typeof FEST_DAYS === 'undefined' || typeof VENUE_NAME === 'undefined') return;
    const d1 = new Date(FEST_DAYS[0] + 'T00:00:00');
    const d2 = new Date(FEST_DAYS[FEST_DAYS.length - 1] + 'T00:00:00');
    const monthName = d1.toLocaleString('en-US', { month: 'long' });
    const year = d1.getFullYear();
    el.textContent = `${d1.getDate()} – ${d2.getDate()} ${monthName} ${year} • ${VENUE_NAME}`;
  }

  /**
   * Render metrics derived strictly from the dataset
   */
  function renderDerivedStats() {
    const statsContainer = document.getElementById('festDerivedStats');
    if (!statsContainer || typeof getDerivedFestivalStats !== 'function') return;

    const stats = getDerivedFestivalStats();
    statsContainer.innerHTML = `
      <div class="stat-item">
        <span class="stat-num">${stats.totalEvents}</span>
        <span class="stat-title">Flagship Events</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">${stats.totalDays}</span>
        <span class="stat-title">Festival Days</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">${stats.totalCategories}</span>
        <span class="stat-title">Competitive Tracks</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">${stats.totalVenues}</span>
        <span class="stat-title">Distinct Venues</span>
      </div>
    `;
  }

  /**
   * Populate hero dates from FEST_DAYS (single source of truth)
   */
  function populateHeroDates() {
    const el = document.getElementById('heroDatesLabel');
    if (!el || typeof FEST_DAYS === 'undefined' || typeof VENUE_NAME === 'undefined') return;
    const d1 = new Date(FEST_DAYS[0] + 'T00:00:00');
    const d2 = new Date(FEST_DAYS[FEST_DAYS.length - 1] + 'T00:00:00');
    const monthName = d1.toLocaleString('en-US', { month: 'long' });
    const year = d1.getFullYear();
    el.textContent = `${d1.getDate()} – ${d2.getDate()} ${monthName} ${year} • ${VENUE_NAME}`;
  }

  /**
   * Render featured event highlights using the shared renderEventCard function
   */
  function renderFeaturedEvents() {
    const container = document.getElementById('featuredEventsGrid');
    if (!container || typeof FESTIVAL_EVENTS === 'undefined' || typeof renderEventCard !== 'function') return;

    const featuredList = FESTIVAL_EVENTS.filter(e => e.featured).slice(0, 4);
    container.innerHTML = featuredList.map(event => renderEventCard(event, { variant: 'featured' })).join('');
  }

  /**
   * Populate hero dates from FEST_DAYS (single source of truth)
   */
  function populateHeroDates() {
    const el = document.getElementById('heroDatesLabel');
    if (!el || typeof FEST_DAYS === 'undefined' || typeof VENUE_NAME === 'undefined') return;
    const d1 = new Date(FEST_DAYS[0] + 'T00:00:00');
    const d2 = new Date(FEST_DAYS[FEST_DAYS.length - 1] + 'T00:00:00');
    const monthName = d1.toLocaleString('en-US', { month: 'long' });
    const year = d1.getFullYear();
    el.textContent = `${d1.getDate()} – ${d2.getDate()} ${monthName} ${year} • ${VENUE_NAME}`;
  }

  /**
   * Calculate earliest and latest festival boundaries from FEST_DAYS and FESTIVAL_EVENTS
   */
  function getFestivalTimeBounds() {
    const day1Events = FESTIVAL_EVENTS.filter(e => e.date === FEST_DAYS[0]);
    let earliestStart = '09:00';
    if (day1Events.length > 0) {
      const sorted = [...day1Events].sort((a, b) => a.start.localeCompare(b.start));
      earliestStart = sorted[0].start;
    }

    const lastDay = FEST_DAYS[FEST_DAYS.length - 1];
    const lastDayEvents = FESTIVAL_EVENTS.filter(e => e.date === lastDay);
    let latestEnd = '21:00';
    if (lastDayEvents.length > 0) {
      const sorted = [...lastDayEvents].sort((a, b) => b.end.localeCompare(a.end));
      latestEnd = sorted[0].end;
    }

    const festStartTime = new Date(`${FEST_DAYS[0]}T${earliestStart}:00`).getTime();
    const festEndTime = new Date(`${lastDay}T${latestEnd}:00`).getTime();

    return { festStartTime, festEndTime };
  }

  /**
   * Populate hero dates from FEST_DAYS (single source of truth)
   */
  function populateHeroDates() {
    const el = document.getElementById('heroDatesLabel');
    if (!el || typeof FEST_DAYS === 'undefined' || typeof VENUE_NAME === 'undefined') return;
    const d1 = new Date(FEST_DAYS[0] + 'T00:00:00');
    const d2 = new Date(FEST_DAYS[FEST_DAYS.length - 1] + 'T00:00:00');
    const monthName = d1.toLocaleString('en-US', { month: 'long' });
    const year = d1.getFullYear();
    el.textContent = `${d1.getDate()} – ${d2.getDate()} ${monthName} ${year} • ${VENUE_NAME}`;
  }

  /**
   * Live Countdown Timer with Before, During, and After states
   */
  function setupFestivalCountdown() {
    const countdownWrapper = document.getElementById('festCountdownWrapper');
    const clockGrid = document.getElementById('festCountdown');
    const countdownTitle = document.getElementById('countdownLabel');
    if (!countdownWrapper || !clockGrid) return;

    const { festStartTime, festEndTime } = getFestivalTimeBounds();
    let timerInterval = null;

    function updateTick() {
      const now = Date.now();

      // State 1: Post-Festival
      if (now > festEndTime) {
        if (timerInterval) clearInterval(timerInterval);
        const endedText = getThemeCopy('countdownEnded', `Thanks for joining ${FEST_NAME}, see you next year`);
        countdownWrapper.innerHTML = `
          <div class="countdown-status-banner ended-banner" role="status">
            <span class="status-indicator-icon" aria-hidden="true">🎉</span>
            <p class="status-banner-text">${endedText}</p>
          </div>
        `;
        return;
      }

      // State 2: Active / During Festival
      if (now >= festStartTime && now <= festEndTime) {
        const liveText = getThemeCopy('countdownLive', 'Festival is live now!');
        countdownWrapper.innerHTML = `
          <div class="countdown-status-banner live-banner" role="status">
            <span class="status-pulse-dot" aria-hidden="true"></span>
            <p class="status-banner-text">${liveText}</p>
          </div>
        `;
        return;
      }

      // State 3: Pre-Festival (Countdown Ticking)
      const diff = Math.max(0, festStartTime - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = n => n.toString().padStart(2, '0');

      const elDays = document.getElementById('countDays');
      const elHours = document.getElementById('countHours');
      const elMinutes = document.getElementById('countMinutes');
      const elSeconds = document.getElementById('countSeconds');

      if (elDays) elDays.textContent = pad(days);
      if (elHours) elHours.textContent = pad(hours);
      if (elMinutes) elMinutes.textContent = pad(minutes);
      if (elSeconds) elSeconds.textContent = pad(seconds);
    }

    updateTick();
    timerInterval = setInterval(updateTick, 1000);
  }
})();
