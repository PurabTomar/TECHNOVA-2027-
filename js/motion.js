/**
 * TECHNOVA 2027 - Master Motion Engine (js/motion.js)
 * High-performance, GPU-accelerated motion controller.
 * Exposes window.FEST.motion: reveal observers, FLIP list animation,
 * countUp, splitText, micro-interactions, and motion preference management.
 * Operates on transform and opacity only.
 */

(function initializeMotionEngine() {
  const FEST_NAMESPACE = (typeof window !== 'undefined')
    ? (window.FEST = window.FEST || {})
    : (typeof global !== 'undefined' ? (global.FEST = global.FEST || {}) : {});

  // 1. Pure Motion Decision & Math Functions (Separated for Testing)
  function sanitizeMotionLevel(val) {
    if (val === 'lite' || val === 'off' || val === 'full') return val;
    return 'full';
  }

  function calculateStaggerDelay(index, baseDelay = 0, staggerStep = 60) {
    const idx = Math.max(0, parseInt(index, 10) || 0);
    const base = Math.max(0, parseInt(baseDelay, 10) || 0);
    const step = Math.max(0, parseInt(staggerStep, 10) || 60);
    return base + (idx * step);
  }

  function decideMotionLevel(env = {}) {
    if (env.storedPreference && ['full', 'lite', 'off'].includes(env.storedPreference)) {
      return env.storedPreference;
    }
    if (env.reducedMotion) return 'off';
    const cores = typeof env.hardwareConcurrency === 'number' ? env.hardwareConcurrency : 4;
    const isSaveData = Boolean(env.saveData);
    const isSmall = typeof env.width === 'number' && env.width < 768;
    return (cores <= 4 || isSaveData || isSmall) ? 'lite' : 'full';
  }

  // 2. Motion State & Preference Management
  let currentLevel = 'full';

  function detectInitialMotionLevel() {
    if (typeof window === 'undefined') return 'full';
    let stored = null;
    try {
      if (window.localStorage) stored = localStorage.getItem('technova_motion');
    } catch (_) {}

    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const width = window.innerWidth || 1024;

    return decideMotionLevel({ reducedMotion, hardwareConcurrency, saveData, width, storedPreference: stored });
  }

  function getMotionLevel() {
    return currentLevel;
  }

  function setMotionLevel(newLevel) {
    const sanitized = sanitizeMotionLevel(newLevel);
    currentLevel = sanitized;

    if (typeof document !== 'undefined') {
      const docEl = document.documentElement;
      docEl.setAttribute('data-motion', sanitized);
      if (sanitized === 'off') {
        docEl.classList.remove('js-motion');
      } else {
        docEl.classList.add('js-motion');
      }

      document.querySelectorAll('[data-motion-set]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-motion-set') === sanitized);
      });
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('technova_motion', sanitized);
      }
    } catch (_) {}

    if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('fest:motion-changed', { detail: { level: sanitized } }));
    }
  }

  // 3. Declarative Reveal Engine (Shared IntersectionObserver)
  let sharedRevealObserver = null;

  function initRevealObserver() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (sharedRevealObserver) sharedRevealObserver.disconnect();

    sharedRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('anim-in');
          const delayMs = parseFloat(el.style.transitionDelay || 0) * 1000;
          setTimeout(() => el.classList.add('anim-done'), delayMs + 400);
          sharedRevealObserver.unobserve(el);
        }
      });
    }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

    scanAndObserveReveals();
  }

  function scanAndObserveReveals() {
    if (!sharedRevealObserver || typeof document === 'undefined') return;

    document.querySelectorAll('[data-anim-stagger]').forEach(parent => {
      const staggerStep = parseInt(parent.getAttribute('data-anim-stagger'), 10) || 60;
      const baseDelay = parseInt(parent.getAttribute('data-anim-delay'), 10) || 0;
      const children = parent.querySelectorAll('[data-anim]');

      children.forEach((child, index) => {
        if (!child.hasAttribute('data-anim-delay')) {
          child.style.transitionDelay = `${calculateStaggerDelay(index, baseDelay, staggerStep)}ms`;
        }
      });
    });

    document.querySelectorAll('[data-anim]:not(.anim-in)').forEach(el => {
      if (el.hasAttribute('data-anim-delay') && !el.style.transitionDelay) {
        const delay = parseInt(el.getAttribute('data-anim-delay'), 10) || 0;
        el.style.transitionDelay = `${delay}ms`;
      }
      sharedRevealObserver.observe(el);
    });
  }

  function revealAll() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-anim]').forEach(el => {
      el.classList.add('anim-in', 'anim-done');
    });
  }

  // 4. Ambient & Tab Visibility Throttling
  let ambientObserver = null;

  function initAmbientObserver() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    ambientObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.01 });

    document.querySelectorAll('.ambient-loop, .bg-layer-2').forEach(el => ambientObserver.observe(el));

    document.addEventListener('visibilitychange', () => {
      const state = document.hidden ? 'paused' : 'running';
      document.querySelectorAll('.ambient-loop, .bg-layer-2, .hero-art-svg').forEach(el => {
        el.style.animationPlayState = state;
      });
    });
  }

  // 5. Advanced Helpers (countUp, splitText, flip, ripple, tilt, magnetic)
  function countUp(el, to, duration = 1000) {
    if (!el) return;
    const target = Number(to) || 0;
    if (currentLevel === 'off' || duration <= 0) {
      el.textContent = target;
      return;
    }
    const startVal = 0;
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(startVal + (target - startVal) * ease);
      if (progress < 1) requestAnimationFrame(updateCount);
      else el.textContent = target;
    }
    requestAnimationFrame(updateCount);
  }

  function splitText(el) {
    if (!el || el.hasAttribute('data-split-applied')) return;
    const text = el.textContent.trim();
    if (!text) return;
    el.setAttribute('aria-label', text);
    el.setAttribute('data-split-applied', 'true');
    const words = text.split(/\s+/);
    el.innerHTML = words.map((word, wIdx) => `
      <span class="split-word" aria-hidden="true" style="--word-index: ${wIdx}; display: inline-block;">
        <span class="split-word-inner" style="display: inline-block;">${word}&nbsp;</span>
      </span>
    `).join('');
  }

  function flip(container, updateFn) {
    if (!container || typeof updateFn !== 'function') {
      if (typeof updateFn === 'function') updateFn();
      return;
    }
    if (currentLevel === 'off') {
      updateFn();
      return;
    }

    const items = [...container.querySelectorAll('[data-id]')];
    const firstRects = new Map();
    items.forEach(item => {
      const id = item.getAttribute('data-id');
      if (id) firstRects.set(id, item.getBoundingClientRect());
    });

    updateFn();

    const newItems = [...container.querySelectorAll('[data-id]')];
    newItems.forEach(item => {
      const id = item.getAttribute('data-id');
      const first = firstRects.get(id);
      if (first) {
        const last = item.getBoundingClientRect();
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          item.style.transition = 'none';
          requestAnimationFrame(() => {
            item.style.transform = '';
            item.style.transition = 'transform var(--dur-med) var(--ease-out)';
          });
        }
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        requestAnimationFrame(() => {
          item.style.transition = 'opacity var(--dur-med) var(--ease-out), transform var(--dur-med) var(--ease-out)';
          item.style.opacity = '1';
          item.style.transform = 'none';
        });
      }
    });
  }

  function ripple(el, e) {
    if (!el || currentLevel === 'off') return;
    const rect = el.getBoundingClientRect();
    const rippleEl = document.createElement('span');
    rippleEl.className = 'btn-ripple-ink';
    const x = e ? e.clientX - rect.left : rect.width / 2;
    const y = e ? e.clientY - rect.top : rect.height / 2;
    rippleEl.style.left = `${x}px`;
    rippleEl.style.top = `${y}px`;
    el.appendChild(rippleEl);
    setTimeout(() => rippleEl.remove(), 600);
  }

  function tilt(el) {
    if (!el || currentLevel !== 'full') return;
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let rafId = null;

    function onMouseMove(e) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
    }

    function onMouseLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
  }

  function magnetic(el) {
    if (!el || currentLevel !== 'full') return;
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    }

    function onMouseLeave() {
      el.style.transform = '';
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
  }

  // 6. Public API Export
  const motionAPI = {
    get level() { return getMotionLevel(); },
    getMotionLevel,
    setMotionLevel,
    decideMotionLevel,
    calculateStaggerDelay,
    sanitizeMotionLevel,
    initRevealObserver,
    scanAndObserveReveals,
    revealAll,
    countUp,
    splitText,
    flip,
    ripple,
    tilt,
    magnetic
  };

  FEST_NAMESPACE.motion = motionAPI;

  // 7. Initialization
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      currentLevel = detectInitialMotionLevel();
      setMotionLevel(currentLevel);
      initRevealObserver();
      initAmbientObserver();

      if (window.matchMedia) {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mql.addEventListener) {
          mql.addEventListener('change', e => {
            setMotionLevel(e.matches ? 'off' : detectInitialMotionLevel());
          });
        }
      }
    });
  }
})();
