/**
 * TECHNOVA 2027 - Events Page Controller
 * Handles full combinable search, category, day, venue, time-of-day, saved-only,
 * and sorting with debounced input, "/" shortcut, active filter pills, URL state sync,
 * popstate traversal, and bookmarking. Zero inline styles or handlers.
 */

(function initializeEventsController() {
  // Active Filter & Sort State
  const filterState = {
    q: '',
    cat: 'All',
    day: 'All',
    venue: 'All',
    tod: 'All',
    sort: 'time',
    savedOnly: false
  };

  let searchDebounceTimer = null;

  /* ==========================================================================
     URL State Synchronization
     ========================================================================== */

  function syncFiltersToUrl(replaceHistory = false) {
    if (typeof serializeFilterParams !== 'function') return;
    const params = serializeFilterParams(filterState);
    const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;

    if (replaceHistory) {
      window.history.replaceState({ ...filterState }, '', newSearch);
    } else {
      window.history.pushState({ ...filterState }, '', newSearch);
    }
  }

  function syncFiltersFromUrl() {
    if (typeof parseFilterParams !== 'function') return;
    const parsed = parseFilterParams(window.location.search);
    filterState.q = parsed.q || '';
    filterState.cat = parsed.cat || 'All';
    filterState.day = parsed.day || 'All';
    filterState.venue = parsed.venue || 'All';
    filterState.tod = parsed.tod || 'All';
    filterState.sort = parsed.sort || 'time';
    filterState.savedOnly = Boolean(parsed.savedOnly);

    updateControlElementsFromState();
  }

  function updateControlElementsFromState() {
    // Search input
    const searchInput = document.getElementById('eventSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
      searchInput.value = filterState.q;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('d-none', !filterState.q);
      }
    }

    // Category pills
    document.querySelectorAll('[data-filter-cat]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter-cat').toLowerCase() === filterState.cat.toLowerCase());
    });

    // Day pills
    document.querySelectorAll('[data-filter-day]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter-day') === filterState.day);
    });

    // Venue select
    const venueSelect = document.getElementById('venueFilterSelect');
    if (venueSelect) venueSelect.value = filterState.venue;

    // Time of Day select
    const todSelect = document.getElementById('todFilterSelect');
    if (todSelect) todSelect.value = filterState.tod;

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = filterState.sort;

    // Saved toggle button
    const savedBtn = document.getElementById('savedFilterBtn');
    if (savedBtn) {
      savedBtn.classList.toggle('active', filterState.savedOnly);
      savedBtn.setAttribute('aria-pressed', filterState.savedOnly ? 'true' : 'false');
    }

    updateSavedCountBadges();
  }

  function updateSavedCountBadges() {
    const savedIds = (typeof getSavedEventIds === 'function') ? getSavedEventIds() : [];
    const count = savedIds.length;
    const badge = document.getElementById('savedCountBadge');
    if (badge) badge.textContent = count;
  }

  /* ==========================================================================
     Active Filter Pills Rendering
     ========================================================================== */

  function renderActiveFilterPills() {
    const bar = document.getElementById('activePillsRow');
    const list = document.getElementById('activePillsList');
    if (!bar || !list) return;

    const pills = [];

    // Search query pill
    if (filterState.q) {
      pills.push({
        id: 'q',
        label: `Search: "${filterState.q}"`,
        onRemove: () => {
          filterState.q = '';
          const searchInput = document.getElementById('eventSearchInput');
          if (searchInput) searchInput.value = '';
          const clearSearchBtn = document.getElementById('clearSearchBtn');
          if (clearSearchBtn) clearSearchBtn.classList.add('d-none');
        }
      });
    }

    // Category pill
    if (filterState.cat !== 'All') {
      pills.push({
        id: 'cat',
        label: `Category: ${filterState.cat}`,
        onRemove: () => { filterState.cat = 'All'; }
      });
    }

    // Day pill
    if (filterState.day !== 'All') {
      const dayLabel = filterState.day === '2027-02-12' ? 'Day 1 (12 Feb)' : 'Day 2 (13 Feb)';
      pills.push({
        id: 'day',
        label: `Day: ${dayLabel}`,
        onRemove: () => { filterState.day = 'All'; }
      });
    }

    // Venue pill
    if (filterState.venue !== 'All') {
      pills.push({
        id: 'venue',
        label: `Venue: ${filterState.venue}`,
        onRemove: () => { filterState.venue = 'All'; }
      });
    }

    // Time of day pill
    if (filterState.tod !== 'All') {
      const todLabels = { morning: 'Morning (< 12:00)', afternoon: 'Afternoon (12:00 – 17:00)', evening: 'Evening (> 17:00)' };
      pills.push({
        id: 'tod',
        label: `Time: ${todLabels[filterState.tod] || filterState.tod}`,
        onRemove: () => { filterState.tod = 'All'; }
      });
    }

    // Saved only pill
    if (filterState.savedOnly) {
      pills.push({
        id: 'saved',
        label: 'Bookmarks: Saved Only',
        onRemove: () => { filterState.savedOnly = false; }
      });
    }

    // Sort pill (only if non-default)
    if (filterState.sort !== 'time') {
      const sortLabels = { title: 'Title A–Z', category: 'Category', duration: 'Duration' };
      pills.push({
        id: 'sort',
        label: `Sort: ${sortLabels[filterState.sort] || filterState.sort}`,
        onRemove: () => { filterState.sort = 'time'; }
      });
    }

    if (pills.length === 0) {
      bar.classList.add('d-none');
      list.innerHTML = '';
      return;
    }

    bar.classList.remove('d-none');
    list.innerHTML = pills.map((p, idx) => `
      <span class="active-filter-pill">
        <span>${p.label}</span>
        <button type="button" class="btn-remove-pill" data-pill-index="${idx}" aria-label="Remove filter: ${p.label}">
          <span aria-hidden="true">✕</span>
        </button>
      </span>
    `).join('');

    // Attach click listeners to pill remove buttons
    list.querySelectorAll('.btn-remove-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-pill-index'), 10);
        if (pills[idx]) {
          pills[idx].onRemove();
          updateControlElementsFromState();
          syncFiltersToUrl();
          renderEventsList();
        }
      });
    });
  }

  /* ==========================================================================
     DOM & UI Rendering
     ========================================================================== */

  function renderEventsList() {
    const container = document.getElementById('eventsGrid');
    const countDisplay = document.getElementById('eventCountDisplay');
    if (!container || typeof filterEvents !== 'function' || typeof FESTIVAL_EVENTS === 'undefined') return;

    const filtered = filterEvents(FESTIVAL_EVENTS, filterState);
    const totalCount = FESTIVAL_EVENTS.length;
    const filteredCount = filtered.length;

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filteredCount} of ${totalCount} events`;
    }

    renderActiveFilterPills();

    if (filteredCount === 0) {
      const emptyTitle = typeof getThemeCopy === 'function' ? getThemeCopy('emptyTitle', 'No Matching Events Found') : 'No Matching Events Found';
      container.innerHTML = `
        <div class="empty-state-box" role="status">
          <div class="empty-icon" aria-hidden="true">🔍</div>
          <h3 class="empty-title">${emptyTitle}</h3>
          <p class="empty-desc">No festival arenas match your current combination of filters. Try broadening your criteria or reset all filters.</p>
          <button type="button" class="btn btn-primary" id="resetFiltersEmptyBtn">
            <span>↺ Clear All Filters</span>
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('resetFiltersEmptyBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => resetAllFilters());
      }
      return;
    }

    container.innerHTML = filtered.map(event => renderEventCard(event, { variant: 'grid' })).join('');
  }

  function resetAllFilters() {
    filterState.q = '';
    filterState.cat = 'All';
    filterState.day = 'All';
    filterState.venue = 'All';
    filterState.tod = 'All';
    filterState.sort = 'time';
    filterState.savedOnly = false;

    updateControlElementsFromState();
    syncFiltersToUrl();
    renderEventsList();
  }

  function populateVenueDropdown() {
    const select = document.getElementById('venueFilterSelect');
    if (!select || typeof FESTIVAL_EVENTS === 'undefined') return;

    const venues = [...new Set(FESTIVAL_EVENTS.map(e => e.venue))].sort();
    select.innerHTML = '<option value="All">All Venues</option>' +
      venues.map(v => `<option value="${v}">${v}</option>`).join('');
  }

  /* ==========================================================================
     Event Listeners & Keyboard Shortcuts
     ========================================================================== */

  function setupFilterListeners() {
    const searchInput = document.getElementById('eventSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // Debounced search input handler
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const val = searchInput.value;
        if (clearSearchBtn) clearSearchBtn.classList.toggle('d-none', !val);

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          filterState.q = val;
          syncFiltersToUrl(true); // replaceState while live typing
          renderEventsList();
        }, 250);
      });

      // Clear search button
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          searchInput.value = '';
          clearSearchBtn.classList.add('d-none');
          filterState.q = '';
          syncFiltersToUrl();
          renderEventsList();
          searchInput.focus();
        });
      }
    }

    // Global "/" key shortcut to focus search input
    document.addEventListener('keydown', e => {
      // Do not intercept if user is inside an input, textarea, or select
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape' && document.activeElement === searchInput) {
          searchInput.blur();
        }
        return;
      }

      if (e.key === '/' && searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    // Category button chips
    const catButtons = document.querySelectorAll('[data-filter-cat]');
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.cat = btn.getAttribute('data-filter-cat');
        syncFiltersToUrl();
        renderEventsList();
      });
    });

    // Day button chips
    const dayButtons = document.querySelectorAll('[data-filter-day]');
    dayButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        dayButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.day = btn.getAttribute('data-filter-day');
        syncFiltersToUrl();
        renderEventsList();
      });
    });

    // Venue select
    const venueSelect = document.getElementById('venueFilterSelect');
    if (venueSelect) {
      venueSelect.addEventListener('change', () => {
        filterState.venue = venueSelect.value;
        syncFiltersToUrl();
        renderEventsList();
      });
    }

    // Time of Day select
    const todSelect = document.getElementById('todFilterSelect');
    if (todSelect) {
      todSelect.addEventListener('change', () => {
        filterState.tod = todSelect.value;
        syncFiltersToUrl();
        renderEventsList();
      });
    }

    // Saved only toggle
    const savedBtn = document.getElementById('savedFilterBtn');
    if (savedBtn) {
      savedBtn.addEventListener('click', () => {
        filterState.savedOnly = !filterState.savedOnly;
        savedBtn.classList.toggle('active', filterState.savedOnly);
        savedBtn.setAttribute('aria-pressed', filterState.savedOnly ? 'true' : 'false');
        syncFiltersToUrl();
        renderEventsList();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        filterState.sort = sortSelect.value;
        syncFiltersToUrl();
        renderEventsList();
      });
    }

    // Clear all filters button
    const clearAllBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => resetAllFilters());
    }

    // Popstate navigation listener (browser Back/Forward buttons)
    window.addEventListener('popstate', () => {
      syncFiltersFromUrl();
      renderEventsList();
    });

    // Reactive bookmark changes from other tabs or components
    window.addEventListener('fest:saved-changed', () => {
      updateSavedCountBadges();
      if (filterState.savedOnly) {
        renderEventsList();
      } else {
        // Update bookmark button states on cards
        document.querySelectorAll('.btn-card-save').forEach(btn => {
          const evId = btn.getAttribute('data-event-id');
          const isSaved = isEventSaved(evId);
          btn.classList.toggle('is-saved', isSaved);
          btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
          btn.setAttribute('aria-label', `${isSaved ? 'Remove from My Plan' : 'Save to My Plan'}: ${evId}`);
          const icon = btn.querySelector('.bookmark-icon');
          if (icon) icon.setAttribute('fill', isSaved ? 'currentColor' : 'none');
        });
      }
    });

    // Card delegation for bookmark clicks
    const grid = document.getElementById('eventsGrid');
    if (grid) {
      grid.addEventListener('click', e => {
        const saveBtn = e.target.closest('[data-action="toggle-save"]');
        if (saveBtn) {
          e.preventDefault();
          const evId = saveBtn.getAttribute('data-event-id');
          if (typeof toggleSavedEventId === 'function') {
            toggleSavedEventId(evId);
          }
        }
      });
    }
  }

  // Initialize on DOM Ready
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('eventsGrid')) {
        populateVenueDropdown();
        syncFiltersFromUrl();
        setupFilterListeners();
        renderEventsList();
      }
    });
  }
})();
