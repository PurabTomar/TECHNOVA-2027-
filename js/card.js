/**
 * TECHNOVA 2027 - Shared Event Card Component
 * Single source of truth for event card HTML markup across Home, Events, and Schedule pages.
 */

/**
 * Render a complete, accessible event card HTML string
 * @param {Object} event - Event data object from FESTIVAL_EVENTS
 * @param {Object} [options] - Optional layout and variant configuration
 * @param {string} [options.variant='grid'] - 'grid', 'featured', or 'schedule'
 * @param {boolean} [options.isParallel=false] - For schedule variant: side-by-side indicator
 * @returns {string} HTML markup string
 */
function renderEventCard(event, options = {}) {
  const variant = options.variant || 'grid';
  const isParallel = Boolean(options.isParallel);
  const catMeta = getCategoryMeta(event.category);
  const timeFormatted = `${formatTime12h(event.start)} - ${formatTime12h(event.end)}`;
  const dateFormatted = formatDateLabel(event.date);

  // Variant: Schedule item inside timeline time-slots
  if (variant === 'schedule') {
    const parallelClass = isParallel ? ' parallel-item' : '';
    return `
      <div class="schedule-event-card${parallelClass}" data-category="${event.category}" data-id="${event.id}">
        <div class="schedule-card-top">
          <span class="category-badge ${catMeta.badgeClass}">
            <span class="cat-icon" aria-hidden="true">${catMeta.icon}</span>
            <span>${catMeta.label}</span>
          </span>
          <span class="schedule-exact-time">
            <span class="clock-icon" aria-hidden="true">⏱</span>
            <span>${timeFormatted}</span>
          </span>
        </div>

        <h3 class="schedule-card-title">${event.title}</h3>
        <p class="schedule-card-venue">
          <span class="venue-icon" aria-hidden="true">📍</span>
          <strong>${event.venue}</strong>
        </p>
        <p class="schedule-card-desc">${event.description}</p>

        <div class="schedule-card-actions">
          <a href="contact.html?event=${encodeURIComponent(event.id)}" class="btn btn-secondary btn-sm" aria-label="Register for ${event.title}">
            <span>Register</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    `;
  }

  // Variant: Grid / Featured standard cards
  return `
    <article class="event-card" data-category="${event.category}" data-id="${event.id}">
      <div class="event-card-stripe" aria-hidden="true"></div>
      <div class="event-card-body">
        <div class="event-card-header">
          <span class="category-badge ${catMeta.badgeClass}">
            <span class="cat-icon" aria-hidden="true">${catMeta.icon}</span>
            <span>${catMeta.label}</span>
          </span>
          <span class="event-venue-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="icon-svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
            <span>${event.venue}</span>
          </span>
        </div>

        <h3 class="event-card-title">${event.title}</h3>
        <p class="event-card-desc">${event.description}</p>

        <div class="event-meta-footer">
          <div class="event-meta-datetime">
            <div class="meta-item date-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="icon-svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/></svg>
              <span>${dateFormatted}</span>
            </div>
            <div class="meta-item time-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="icon-svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/></svg>
              <span>${timeFormatted}</span>
            </div>
          </div>

          <a href="contact.html?event=${encodeURIComponent(event.id)}" class="btn btn-secondary card-register-btn" aria-label="Register for ${event.title}">
            <span>Register</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  `;
}
