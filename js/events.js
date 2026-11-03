/**
 * TECHNOVA 2027 - Events Page Controller
 * Handles combinable Category and Day filtering with URL state synchronization (?cat=&day=),
 * popstate history traversal, accessible aria-live counter, and shared event card rendering.
 */

const eventFilterState = {
  category: 'All',
  day: 'All'
};

/* ==========================================================================
   Filter Logic Functions
   ========================================================================== */

/**
 * Filter festival events based on current category and day filters.
 */
function getFilteredEvents(events, filters) {
  return events.filter(event => {
    const matchesCategory = filters.category === 'All' || event.category.toLowerCase() === filters.category.toLowerCase();
    const matchesDay = filters.day === 'All' || event.date === filters.day;
    return matchesCategory && matchesDay;
  });
}

/* ==========================================================================
   URL Synchronization & History State
   ========================================================================== */

function syncFiltersToUrl() {
  const url = new URL(window.location);
  if (eventFilterState.category !== 'All') {
    url.searchParams.set('cat', eventFilterState.category);
  } else {
    url.searchParams.delete('cat');
  }

  if (eventFilterState.day !== 'All') {
    url.searchParams.set('day', eventFilterState.day);
  } else {
    url.searchParams.delete('day');
  }

  window.history.pushState({ ...eventFilterState }, '', url.toString());
}

function syncFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const dayParam = params.get('day');

  if (catParam) {
    const validCats = Object.keys(CATEGORIES);
    const matched = validCats.find(c => c.toLowerCase() === catParam.toLowerCase());
    eventFilterState.category = matched || 'All';
  } else {
    eventFilterState.category = 'All';
  }

  if (dayParam && FEST_DAYS.includes(dayParam)) {
    eventFilterState.day = dayParam;
  } else {
    eventFilterState.day = 'All';
  }

  // Update UI button states
  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter-cat') === eventFilterState.category);
  });

  document.querySelectorAll('[data-filter-day]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter-day') === eventFilterState.day);
  });
}

/* ==========================================================================
   DOM & UI Rendering
   ========================================================================== */

function renderEventsList() {
  const container = document.getElementById('eventsGrid');
  const countDisplay = document.getElementById('eventCountDisplay');
  if (!container) return;

  const filtered = getFilteredEvents(FESTIVAL_EVENTS, eventFilterState);
  const totalCount = FESTIVAL_EVENTS.length;
  const filteredCount = filtered.length;

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filteredCount} of ${totalCount} events`;
  }

  if (filteredCount === 0) {
    const emptyTitle = typeof getThemeCopy === 'function' ? getThemeCopy('emptyTitle', 'No Matching Events Found') : 'No Matching Events Found';
    const emptySubtitle = typeof getThemeCopy === 'function' ? getThemeCopy('emptySubtitle', 'No events match the selected category and day filters.') : 'No events match the selected category and day filters.';

    container.innerHTML = `
      <div class="empty-state-box" role="status">
        <div class="empty-icon" aria-hidden="true">🔍</div>
        <h3 class="empty-title">${emptyTitle}</h3>
        <p class="empty-desc">${emptySubtitle}</p>
        <button type="button" class="btn btn-primary" id="resetFiltersEmptyBtn">
          Clear Filters
        </button>
      </div>
    `;

    const resetBtn = document.getElementById('resetFiltersEmptyBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetAllFilters();
        syncFiltersToUrl();
      });
    }
    return;
  }

  container.innerHTML = filtered.map(event => renderEventCard(event, { variant: 'grid' })).join('');
}

function resetAllFilters() {
  eventFilterState.category = 'All';
  eventFilterState.day = 'All';

  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter-cat') === 'All');
  });

  document.querySelectorAll('[data-filter-day]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter-day') === 'All');
  });

  renderEventsList();
}

function setupEventFilterListeners() {
  // Category buttons
  const catButtons = document.querySelectorAll('[data-filter-cat]');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      eventFilterState.category = btn.getAttribute('data-filter-cat');
      syncFiltersToUrl();
      renderEventsList();
    });
  });

  // Day buttons
  const dayButtons = document.querySelectorAll('[data-filter-day]');
  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dayButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      eventFilterState.day = btn.getAttribute('data-filter-day');
      syncFiltersToUrl();
      renderEventsList();
    });
  });

  // Reset toolbar button
  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetAllFilters();
      syncFiltersToUrl();
    });
  }

  // Popstate listener for back/forward browser buttons
  window.addEventListener('popstate', () => {
    syncFiltersFromUrl();
    renderEventsList();
  });
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('eventsGrid')) {
      syncFiltersFromUrl();
      setupEventFilterListeners();
      renderEventsList();
    }
  });
}
