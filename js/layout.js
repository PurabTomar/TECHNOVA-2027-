/**
 * TECHNOVA 2027 - Shared Layout Engine
 * Injects consistent, accessible sticky navigation, skip link, and footer across all pages.
 * Reads brand metadata from FEST_NAME, FEST_YEAR, FEST_DAYS, and CONTACT_EMAIL in js/data.js.
 */

(function injectSharedLayout() {
  document.addEventListener('DOMContentLoaded', () => {
    injectSkipLink();
    renderNavbar();
    renderFooter();
    setupMobileMenu();
  });

  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page.toLowerCase();
  }

  function injectSkipLink() {
    if (document.querySelector('.skip-to-content')) return;
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  function renderNavbar() {
    const navPlaceholder = document.getElementById('navbar-mount');
    if (!navPlaceholder) return;

    const currentPage = getCurrentPage();

    const navLinks = [
      { label: 'Home', href: 'index.html', active: currentPage === 'index.html' || currentPage === '' },
      { label: 'Events', href: 'events.html', active: currentPage === 'events.html' },
      { label: 'Schedule', href: 'schedule.html', active: currentPage === 'schedule.html' },
      { label: 'My Plan', href: 'plan.html', active: currentPage === 'plan.html', badgeId: 'navSavedBadge' },
      { label: 'Register', href: 'contact.html', active: currentPage === 'contact.html' }
    ];

    let linksHtml = '';
    navLinks.forEach(link => {
      const activeClass = link.active ? 'nav-link active' : 'nav-link';
      const ariaCurrent = link.active ? ' aria-current="page"' : '';
      const badgeHtml = link.badgeId ? `<span class="nav-saved-badge d-none" id="${link.badgeId}" aria-label="Saved events count">0</span>` : '';
      linksHtml += `<li><a href="${link.href}" class="${activeClass}"${ariaCurrent}><span>${link.label}</span>${badgeHtml}</a></li>`;
    });

    const festName = typeof FEST_NAME !== 'undefined' ? FEST_NAME : 'TECHNOVA';
    const festYear = typeof FEST_YEAR !== 'undefined' ? FEST_YEAR : '2027';
    const collegeLogo = (typeof COLLEGE_LOGO !== 'undefined' && COLLEGE_LOGO) ? COLLEGE_LOGO : 'assets/sati-logo.svg';
    const isContactPage = currentPage === 'contact.html';

    const ctaHtml = isContactPage ? '' : `
      <div class="nav-cta-wrapper">
        <a href="contact.html" class="btn btn-primary nav-cta-btn">
          <span>Register Now</span>
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    `;

    navPlaceholder.innerHTML = `
      <header class="site-header">
        <div class="nav-container">
          <a href="index.html" class="brand-logo" aria-label="${festName} ${festYear} Home - SATI Vidisha">
            <div class="college-logo-badge" aria-hidden="true">
              <img src="${collegeLogo}" alt="SATI Emblem" width="32" height="32">
            </div>
            <div class="brand-text-group">
              <span class="brand-name">${festName}</span>
              <span class="brand-year">${festYear}</span>
            </div>
          </a>

          <button type="button" class="mobile-toggle" id="mobileMenuBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="primaryNav">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>

          <nav class="primary-nav" id="primaryNav" aria-label="Main Navigation">
            <ul class="nav-list">
              ${linksHtml}
            </ul>
            ${ctaHtml}
          </nav>
        </div>
      </header>
    `;

    function updateNavbarSavedBadge() {
      const badge = document.getElementById('navSavedBadge');
      if (!badge) return;
      const savedIds = (typeof getSavedEventIds === 'function') ? getSavedEventIds() : [];
      const count = savedIds.length;
      badge.textContent = count;
      badge.classList.toggle('d-none', count === 0);
    }

    updateNavbarSavedBadge();
    window.addEventListener('fest:saved-changed', updateNavbarSavedBadge);
  }

  function renderFooter() {
    const footerPlaceholder = document.getElementById('footer-mount');
    if (!footerPlaceholder) return;

    const festName = typeof FEST_NAME !== 'undefined' ? FEST_NAME : 'TECHNOVA';
    const festYear = typeof FEST_YEAR !== 'undefined' ? FEST_YEAR : '2027';
    const collegeLogo = (typeof COLLEGE_LOGO !== 'undefined' && COLLEGE_LOGO) ? COLLEGE_LOGO : 'assets/sati-logo.svg';
    const email = typeof CONTACT_EMAIL !== 'undefined' ? CONTACT_EMAIL : 'fest@example.edu';
    const venue = typeof VENUE_NAME !== 'undefined' ? VENUE_NAME : 'University Central Campus';
    const datesStr = (typeof FEST_DAYS !== 'undefined' && FEST_DAYS.length >= 2)
      ? `${new Date(FEST_DAYS[0] + 'T00:00:00').getDate()} - ${new Date(FEST_DAYS[FEST_DAYS.length - 1] + 'T00:00:00').getDate()} February ${festYear}`
      : `February ${festYear}`;

    const footerTagline = typeof getThemeCopy === 'function' 
      ? getThemeCopy('footerTagline', 'Code Crack 3.0 Hackathon & Annual College Tech-Cultural Fest.')
      : 'Code Crack 3.0 Hackathon & Annual College Tech-Cultural Fest.';
    
    const footerNote = typeof getThemeCopy === 'function'
      ? getThemeCopy('footerNote', 'Experience • Powered by Pure Vanilla Web Architecture')
      : 'Experience • Powered by Pure Vanilla Web Architecture';

    footerPlaceholder.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-content">
          <div class="footer-grid">
            <div class="footer-col brand-col">
              <div class="brand-logo footer-logo">
                <div class="college-logo-badge footer-logo-badge" aria-hidden="true">
                  <img src="${collegeLogo}" alt="SATI Emblem" width="32" height="32">
                </div>
                <div class="brand-text-group">
                  <span class="brand-name">${festName}</span>
                  <span class="brand-year">${festYear}</span>
                </div>
              </div>
              <p class="footer-tagline" data-theme-copy="footerTagline">${footerTagline}</p>
              <div class="fest-dates-badge">
                <div class="college-logo-badge mini-logo-badge" aria-hidden="true">
                  <img src="${collegeLogo}" alt="SATI" width="20" height="20">
                </div>
                <span>${datesStr} • ${venue}</span>
              </div>
            </div>

            <div class="footer-col links-col">
              <h3 class="footer-title">Navigation</h3>
              <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="events.html">All Events</a></li>
                <li><a href="schedule.html">Festival Schedule</a></li>
                <li><a href="plan.html">My Plan</a></li>
                <li><a href="contact.html">Registration & Contact</a></li>
                <li><a href="registrations.html">My Registrations</a></li>
              </ul>
            </div>

            <div class="footer-col categories-col">
              <h3 class="footer-title">Tracks</h3>
              <ul class="footer-links">
                <li><a href="events.html?cat=Technical">Technical Arenas</a></li>
                <li><a href="events.html?cat=Cultural">Cultural Spectacles</a></li>
                <li><a href="events.html?cat=Gaming">E-Sports & Gaming</a></li>
                <li><a href="schedule.html">Parallel Tracks</a></li>
              </ul>
            </div>

            <div class="footer-col contact-col">
              <h3 class="footer-title">Inquiries & Helpdesk</h3>
              <p class="footer-contact-desc">
                Have questions regarding event guidelines or Code Crack 3.0 problem statements?
              </p>
              <a href="mailto:${email}" class="footer-email-link">
                <span aria-hidden="true">✉</span>
                <span>${email}</span>
              </a>
              <div class="footer-status-pill">
                <span class="status-pulse-dot"></span>
                <span>Registration Desk Open Online</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© ${festYear} ${festName} Festival Committee. Code Crack 3.0 Hackathon. All rights reserved.</p>
            <p class="footer-subtext" data-theme-copy="footerNote">${footerNote}</p>
          </div>
        </div>
      </footer>
    `;
  }

  function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('primaryNav');
    if (!btn || !nav) return;

    function closeMenu() {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('active');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      btn.classList.toggle('active', !isExpanded);
      nav.classList.toggle('open', !isExpanded);
      document.body.classList.toggle('menu-open', !isExpanded);
    });

    // Close on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key press
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        btn.focus();
      }
    });
  }
})();
