/**
 * TECHNOVA 2027 - Motion Boot Loader
 * Tiny inline-free head script loaded synchronously in <head> BEFORE first paint.
 * Sets data-motion="full|lite|off" and html.js-motion before styles render.
 * Protects against layout shift and ensures 100% visible fallback if JS is disabled or reveals fail.
 */
(function motionBoot() {
  try {
    const docEl = document.documentElement;
    let stored = null;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        stored = localStorage.getItem('technova_motion');
      }
    } catch (_) {}

    const validLevels = ['full', 'lite', 'off'];
    let motionLevel = 'full';

    if (stored && validLevels.includes(stored)) {
      motionLevel = stored;
    } else {
      const prefersReduced = (typeof window !== 'undefined' && window.matchMedia)
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

      if (prefersReduced) {
        motionLevel = 'off';
      } else {
        const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
        const saveData = (typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData);
        const isMobileWidth = (typeof window !== 'undefined' && window.innerWidth < 768);

        if (cores <= 4 || saveData || isMobileWidth) {
          motionLevel = 'lite';
        } else {
          motionLevel = 'full';
        }
      }
    }

    docEl.setAttribute('data-motion', motionLevel);

    // Apply js-motion class only if motion is not explicitly off
    if (motionLevel !== 'off') {
      docEl.classList.add('js-motion');
    }

    // Safety net: reveal all content within 2 seconds if reveal observer hasn't completed
    setTimeout(function() {
      if (docEl.classList.contains('js-motion')) {
        docEl.classList.remove('js-motion');
        docEl.classList.add('js-motion-timeout');
      }
    }, 2000);
  } catch (_) {
    // Graceful error fallback: fail open so all content remains visible
  }
})();
