/**
 * TECHNOVA 2027 - Registration Form Controller
 * Strict client-side validation, inline accessible error prompts,
 * safe localStorage caching, anti-double-submission lock, and confirmation boarding pass.
 * Zero inline styles and zero inline event handlers.
 */

(function initializeRegistrationForm() {
  let isSubmitting = false;

  // Pure Validation Rules
  const FormValidators = {
    isValidName: val => val.trim().length >= 2,
    isValidEmail: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    isValidPhone: val => {
      const cleaned = val.trim().replace(/[\s\-()]/g, '');
      if (cleaned === '') return true; // Optional field
      return /^\d{10}$/.test(cleaned);
    },
    isValidRequired: val => val.trim().length > 0
  };

  const FIELD_CONFIGS = [
    {
      id: 'regName',
      errorId: 'nameError',
      validator: FormValidators.isValidName,
      message: 'Please enter your full name (minimum 2 characters).'
    },
    {
      id: 'regEmail',
      errorId: 'emailError',
      validator: FormValidators.isValidEmail,
      message: 'Please enter a valid email address (e.g., student@college.edu).'
    },
    {
      id: 'regPhone',
      errorId: 'phoneError',
      validator: FormValidators.isValidPhone,
      message: 'Phone is optional, but if entered it must be exactly 10 digits.'
    },
    {
      id: 'regCollege',
      errorId: 'collegeError',
      validator: FormValidators.isValidRequired,
      message: 'Please enter your college or institution name.'
    },
    {
      id: 'regYear',
      errorId: 'yearError',
      validator: FormValidators.isValidRequired,
      message: 'Please select your current year of study.'
    },
    {
      id: 'regEvent',
      errorId: 'eventError',
      validator: FormValidators.isValidRequired,
      message: 'Please select an event to register for.'
    }
  ];

  /**
   * Validate a single input field and toggle error feedback
   */
  function validateField(fieldConfig) {
    const inputEl = document.getElementById(fieldConfig.id);
    const errorEl = document.getElementById(fieldConfig.errorId);
    if (!inputEl || !errorEl) return true;

    const isValid = fieldConfig.validator(inputEl.value);

    if (!isValid) {
      inputEl.classList.add('input-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = fieldConfig.message;
      errorEl.classList.remove('d-none');
      return false;
    } else {
      inputEl.classList.remove('input-invalid');
      inputEl.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
      errorEl.classList.add('d-none');
      return true;
    }
  }

  /**
   * Populate event options from FESTIVAL_EVENTS, pre-selecting ?event=<id> if valid
   */
  function populateEventDropdown() {
    const selectEl = document.getElementById('regEvent');
    if (!selectEl || typeof FESTIVAL_EVENTS === 'undefined') return;

    selectEl.innerHTML = '<option value="" disabled selected>— Select an Event —</option>';

    const categories = Object.keys(CATEGORIES);
    categories.forEach(cat => {
      const groupEl = document.createElement('optgroup');
      groupEl.label = `${cat} Track`;

      const catEvents = FESTIVAL_EVENTS.filter(e => e.category === cat);
      catEvents.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.textContent = `${ev.title} (${ev.date === '2027-02-12' ? '12 Feb' : '13 Feb'}, ${formatTime12h(ev.start)})`;
        groupEl.appendChild(opt);
      });

      selectEl.appendChild(groupEl);
    });

    // Check ?event=<id> parameter; ignore if invalid
    const params = new URLSearchParams(window.location.search);
    const targetEventId = params.get('event');
    if (targetEventId) {
      const matched = FESTIVAL_EVENTS.find(e => e.id.toLowerCase() === targetEventId.toLowerCase());
      if (matched) {
        selectEl.value = matched.id;
      }
    }
  }

  /**
   * Generate unique alphanumeric reference ID
   */
  function generateReferenceId() {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const char1 = chars.charAt(Math.floor(Math.random() * chars.length));
    const char2 = chars.charAt(Math.floor(Math.random() * chars.length));
    return `TECH27-${char1}${char2}${randNum}`;
  }

  /**
   * Safely persist registration in localStorage wrapped in try/catch
   */
  function saveRegistrationLocally(regData) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existing = JSON.parse(localStorage.getItem('technova_registrations') || '[]');
        existing.push(regData);
        localStorage.setItem('technova_registrations', JSON.stringify(existing));
      }
    } catch (_) {
      // Gracefully handle storage quota or privacy mode restrictions
    }
  }

  /**
   * Display confirmation pass and attach button listeners
   */
  function showConfirmationCard(submissionData) {
    const formSection = document.getElementById('registrationFormSection');
    const confirmSection = document.getElementById('confirmationSection');
    if (!formSection || !confirmSection) return;

    const eventObj = FESTIVAL_EVENTS.find(e => e.id === submissionData.eventId) || {
      title: submissionData.eventId,
      venue: VENUE_NAME,
      date: FEST_DAYS[0],
      start: '10:00',
      end: '12:00',
      category: 'Festival Track'
    };

    const ticketPill = typeof getThemeCopy === 'function' ? getThemeCopy('ticketPassPill', 'Boarding Pass Confirmed') : 'Boarding Pass Confirmed';
    const ticketHeader = typeof getThemeCopy === 'function' ? getThemeCopy('ticketPassHeader', 'TECHNOVA PASS') : 'TECHNOVA PASS';

    confirmSection.innerHTML = `
      <div class="confirmation-card" role="region" aria-label="Registration Confirmation">
        <div class="confirm-badge">
          <span class="confirm-icon" aria-hidden="true">✔</span>
        </div>

        <div class="confirm-header">
          <span class="status-pill-accent">${ticketPill}</span>
          <h2 class="confirm-title">Registration Successful!</h2>
          <p class="confirm-subtitle">Your entry pass is confirmed. Present this reference pass at the registration desk.</p>
        </div>

        <div class="pass-ticket">
          <div class="ticket-header">
            <div class="ticket-fest-brand">
              <span class="brand-badge-icon" aria-hidden="true">✦</span> ${ticketHeader}
            </div>
            <div class="ticket-ref-id">
              <span class="ref-label">REF ID:</span>
              <strong class="ref-code">${submissionData.referenceId}</strong>
            </div>
          </div>

          <div class="ticket-body-grid">
            <div class="ticket-row">
              <span class="ticket-label">Participant:</span>
              <strong class="ticket-val">${submissionData.name}</strong>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Registered Event:</span>
              <strong class="ticket-val text-accent">${eventObj.title}</strong>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Category Track:</span>
              <span class="ticket-val">${eventObj.category}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Date & Timing:</span>
              <span class="ticket-val">${formatDateLabel(eventObj.date)} • ${formatTime12h(eventObj.start)} - ${formatTime12h(eventObj.end)}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Venue:</span>
              <span class="ticket-val">📍 ${eventObj.venue}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Institution:</span>
              <span class="ticket-val">${submissionData.college} (${submissionData.year})</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Official Email:</span>
              <span class="ticket-val">${submissionData.email}</span>
            </div>
            ${submissionData.phone ? `
            <div class="ticket-row">
              <span class="ticket-label">Phone:</span>
              <span class="ticket-val">${submissionData.phone}</span>
            </div>` : ''}
          </div>

          <div class="ticket-barcode-mock" aria-hidden="true">
            <div class="barcode-lines"></div>
            <span class="barcode-num">${submissionData.referenceId} • PASS-AUTH-VERIFIED</span>
          </div>
        </div>

        <div class="confirm-actions">
          <button type="button" class="btn btn-primary" id="printTicketBtn">
            <span>🖨 Print / Save Pass</span>
          </button>
          <button type="button" class="btn btn-secondary" id="registerAnotherBtn">
            <span>Register for Another Event</span>
          </button>
        </div>
      </div>
    `;

    // Swap view using classes, no inline styles
    formSection.classList.add('d-none');
    confirmSection.classList.remove('d-none');
    confirmSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Print button handler (no inline onclick)
    const printBtn = document.getElementById('printTicketBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Register another handler
    const anotherBtn = document.getElementById('registerAnotherBtn');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', () => {
        const form = document.getElementById('registrationForm');
        if (form) form.reset();
        populateEventDropdown();

        // Clear all inline error states
        FIELD_CONFIGS.forEach(cfg => {
          const input = document.getElementById(cfg.id);
          const err = document.getElementById(cfg.errorId);
          if (input) {
            input.classList.remove('input-invalid');
            input.setAttribute('aria-invalid', 'false');
          }
          if (err) {
            err.textContent = '';
            err.classList.add('d-none');
          }
        });

        isSubmitting = false;
        const submitBtn = document.getElementById('formSubmitBtn');
        if (submitBtn) submitBtn.disabled = false;

        confirmSection.classList.add('d-none');
        formSection.classList.remove('d-none');
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  /**
   * Form event listeners & submit validation
   */
  function setupFormHandlers() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('formSubmitBtn');
    if (!form) return;

    FIELD_CONFIGS.forEach(cfg => {
      const input = document.getElementById(cfg.id);
      if (input) {
        input.addEventListener('blur', () => validateField(cfg));
        input.addEventListener('input', () => {
          if (input.classList.contains('input-invalid')) {
            validateField(cfg);
          }
        });
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      if (isSubmitting) return; // Block double submit

      let isAllValid = true;
      let firstInvalidInput = null;

      FIELD_CONFIGS.forEach(cfg => {
        const isValid = validateField(cfg);
        if (!isValid) {
          isAllValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = document.getElementById(cfg.id);
          }
        }
      });

      if (!isAllValid) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      isSubmitting = true;
      if (submitBtn) submitBtn.disabled = true;

      const submissionData = {
        referenceId: generateReferenceId(),
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        college: document.getElementById('regCollege').value.trim(),
        year: document.getElementById('regYear').value,
        eventId: document.getElementById('regEvent').value,
        message: document.getElementById('regMessage').value.trim(),
        timestamp: new Date().toISOString()
      };

      saveRegistrationLocally(submissionData);
      showConfirmationCard(submissionData);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('registrationForm')) {
      populateEventDropdown();
      setupFormHandlers();
    }
  });
})();
