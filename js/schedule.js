/**
 * TECHNOVA 2027 - Festival Schedule Engine
 * Handles day tabs, combinable category filtering, time-interval overlap clustering,
 * URL state synchronization (?cat=&day=), popstate navigation, and shared card rendering.
 */

const scheduleFilterState = {
  day: '2027-02-12', // Default to Day 1
  category: 'All'
};

/* ==========================================================================
   Logic Functions (Time Parsing, Sorting & Overlap Clustering)
   ========================================================================== */

/**
 * Convert "HH:MM" 24h string to minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Convert minutes from midnight back to "HH:MM" string
 */
function minutesToTimeStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Group events into time clusters based on overlapping intervals.
 * Note: Back-to-back events (evStart === groupEndMin) strictly do NOT overlap.
 */
function clusterOverlappingEvents(events) {
  if (!events || events.length === 0) return [];

  // Sort by start time ascending, then by end time
  const sorted = [...events].sort((a, b) => {
    const diff = timeToMinutes(a.start) - timeToMinutes(b.start);
    if (diff !== 0) return diff;
    return timeToMinutes(a.end) - timeToMinutes(b.end);
  });

  const clusters = [];
  let currentGroup = [sorted[0]];
  let groupStartMin = timeToMinutes(sorted[0].start);
  let groupEndMin = timeToMinutes(sorted[0].end);

  for (let i = 1; i < sorted.length; i++) {
    const ev = sorted[i];
    const evStart = timeToMinutes(ev.start);
    const evEnd = timeToMinutes(ev.end);

    // Strict inequality: event starts before the current running cluster ends
    if (evStart < groupEndMin) {
      currentGroup.push(ev);
      groupEndMin = Math.max(groupEndMin, evEnd);
      groupStartMin = Math.min(groupStartMin, evStart);
    } else {
      clusters.push({
        startMinutes: groupStartMin,
        endMinutes: groupEndMin,
        startFormatted: formatTime12h(minutesToTimeStr(groupStartMin)),
        endFormatted: formatTime12h(minutesToTimeStr(groupEndMin)),
        isParallel: currentGroup.length > 1,
        events: currentGroup
      });

      currentGroup = [ev];
      groupStartMin = evStart;
      groupEndMin = evEnd;
    }
  }

  // Final cluster
  if (currentGroup.length > 0) {
    clusters.push({
      startMinutes: groupStartMin,
      endMinutes: groupEndMin,
      startFormatted: formatTime12h(minutesToTimeStr(groupStartMin)),
      endFormatted: formatTime12h(minutesToTimeStr(groupEndMin)),
      isParallel: currentGroup.length > 1,
      events: currentGroup
    });
  }

  return clusters;
}

/**
 * Filter events for schedule based on active day and category
 */
function getFilteredScheduleEvents() {
  return FESTIVAL_EVENTS.filter(event => {
    const matchDay = scheduleFilterState.day === 'All' || event.date === scheduleFilterState.day;
    const matchCat = scheduleFilterState.category === 'All' || event.category.toLowerCase() === scheduleFilterState.category.toLowerCase();
    return matchDay && matchCat;
  });
}

/* ==========================================================================
   URL State & History Synchronization
   ========================================================================== */

function syncScheduleFiltersToUrl() {
  const url = new URL(window.location);

  if (scheduleFilterState.day !== '2027-02-12') {
    url.searchParams.set('day', scheduleFilterState.day);
  } else {
    url.searchParams.delete('day');
  }

  if (scheduleFilterState.category !== 'All') {
    url.searchParams.set('cat', scheduleFilterState.category);
  } else {
    url.searchParams.delete('cat');
  }

  window.history.pushState({ ...scheduleFilterState }, '', url.toString());
}

function syncScheduleFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const dayParam = params.get('day');

  if (catParam) {
    const validCats = Object.keys(CATEGORIES);
    const matched = validCats.find(c => c.toLowerCase() === catParam.toLowerCase());
    scheduleFilterState.category = matched || 'All';
  } else {
    scheduleFilterState.category = 'All';
  }

  if (dayParam) {
    if (dayParam === 'All' || FEST_DAYS.includes(dayParam)) {
      scheduleFilterState.day = dayParam;
    } else {
      scheduleFilterState.day = '2027-02-12';
    }
  } else {
    scheduleFilterState.day = '2027-02-12';
  }

  // Update UI tabs
  document.querySelectorAll('[data-sched-day]').forEach(btn => {
    const isActive = btn.getAttribute('data-sched-day') === scheduleFilterState.day;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Update UI category pills
  document.querySelectorAll('[data-sched-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sched-cat') === scheduleFilterState.category);
  });
}

/* ==========================================================================
   DOM Rendering
   ========================================================================== */

/**
 * Render a complete time block with header and shared event cards
 */
function createScheduleTimeBlockMarkup(cluster) {
  const parallelNotice = cluster.isParallel 
    ? `<span class="parallel-indicator-pill"><span class="status-pulse-dot" aria-hidden="true"></span> ${cluster.events.length} Parallel Tracks</span>` 
    : '';

  const cardsHtml = cluster.events
    .map(ev => renderEventCard(ev, { variant: 'schedule', isParallel: cluster.isParallel }))
    .join('');

  return `
    <section class="schedule-time-slot" aria-labelledby="slot-heading-${cluster.startMinutes}">
      <div class="time-slot-header">
        <div class="time-slot-heading-group">
          <div class="time-marker-dot" aria-hidden="true"></div>
          <h3 id="slot-heading-${cluster.startMinutes}" class="time-slot-title">
            ${cluster.startFormatted} – ${cluster.endFormatted}
          </h3>
        </div>
        ${parallelNotice}
      </div>

      <div class="schedule-cards-grid ${cluster.isParallel ? 'parallel-grid' : 'single-grid'}">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Render full schedule timeline or empty state
 */
function renderSchedule() {
  const container = document.getElementById('scheduleTimeline');
  const countDisplay = document.getElementById('scheduleCountDisplay');
  if (!container) return;

  const filtered = getFilteredScheduleEvents();
  const totalInScope = FESTIVAL_EVENTS.filter(e => scheduleFilterState.day === 'All' || e.date === scheduleFilterState.day).length;

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${totalInScope} events`;
  }

  if (filtered.length === 0) {
    const emptyTitle = typeof getThemeCopy === 'function' ? getThemeCopy('emptyTitle', 'No Matching Events') : 'No Matching Events';
    const emptySubtitle = typeof getThemeCopy === 'function' ? getThemeCopy('emptySubtitle', 'No events match the selected day and category filter.') : 'No events match the selected day and category filter.';

    container.innerHTML = `
      <div class="empty-state-box" role="status">
        <div class="empty-icon" aria-hidden="true">📅</div>
        <h3 class="empty-title">${emptyTitle}</h3>
        <p class="empty-desc">${emptySubtitle}</p>
        <button type="button" class="btn btn-primary" id="resetScheduleEmptyBtn">
          Clear Filters
        </button>
      </div>
    `;

    const resetBtn = document.getElementById('resetScheduleEmptyBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetScheduleFilters();
        syncScheduleFiltersToUrl();
      });
    }
    return;
  }

  if (scheduleFilterState.day === 'All') {
    let html = '';
    FEST_DAYS.forEach((festDate, idx) => {
      const dayEvents = filtered.filter(e => e.date === festDate);
      if (dayEvents.length > 0) {
        html += `
          <div class="day-divider-banner">
            <h2 class="day-divider-title">${formatDateLabel(festDate)}</h2>
          </div>
        `;
        const clusters = clusterOverlappingEvents(dayEvents);
        html += clusters.map(createScheduleTimeBlockMarkup).join('');
      }
    });
    container.innerHTML = html;
  } else {
    const clusters = clusterOverlappingEvents(filtered);
    container.innerHTML = clusters.map(createScheduleTimeBlockMarkup).join('');
  }
}

function resetScheduleFilters() {
  scheduleFilterState.category = 'All';
  document.querySelectorAll('[data-sched-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sched-cat') === 'All');
  });
  renderSchedule();
}

function setupScheduleListeners() {
  // Day tabs
  const dayTabs = document.querySelectorAll('[data-sched-day]');
  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      scheduleFilterState.day = tab.getAttribute('data-sched-day');
      syncScheduleFiltersToUrl();
      renderSchedule();
    });
  });

  // Category filter pills
  const catPills = document.querySelectorAll('[data-sched-cat]');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      scheduleFilterState.category = pill.getAttribute('data-sched-cat');
      syncScheduleFiltersToUrl();
      renderSchedule();
    });
  });

  // Clear filters in toolbar
  const clearBtn = document.getElementById('clearScheduleFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetScheduleFilters();
      syncScheduleFiltersToUrl();
    });
  }

  // Popstate navigation listener
  window.addEventListener('popstate', () => {
    syncScheduleFiltersFromUrl();
    renderSchedule();
  });
}

// Initialize on DOM load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('scheduleTimeline')) {
      syncScheduleFiltersFromUrl();
      setupScheduleListeners();
      renderSchedule();
    }
  });
}
