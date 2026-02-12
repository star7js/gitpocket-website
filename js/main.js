// GitPocket - Shared JavaScript

// Theme detection and toggle
(function() {
  const html = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themes = ['system', 'light', 'dark'];

  // Get the effective theme based on preference
  function getEffectiveTheme(preference) {
    if (preference === 'system') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return preference;
  }

  // Check for saved theme preference or default to system
  function getPreferredTheme() {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'system';
    } catch (e) {
      // localStorage might be disabled (private browsing)
      return 'system';
    }
  }

  // Apply theme
  function applyTheme(preference) {
    const effectiveTheme = getEffectiveTheme(preference);
    html.setAttribute('data-theme', effectiveTheme);
    try {
      localStorage.setItem('theme', preference);
    } catch (e) {
      // Fail silently if localStorage is unavailable
    }
    updateThemeIcon(preference);
  }

  // Update icon based on theme preference
  function updateThemeIcon(preference) {
    const icons = { system: '💻', light: '☀️', dark: '🌙' };
    if (themeIcon) {
      themeIcon.textContent = icons[preference];
    }
    if (themeToggle) {
      const label = preference.charAt(0).toUpperCase() + preference.slice(1);
      themeToggle.setAttribute('aria-label', `Theme: ${label}`);
    }
  }

  // Initialize theme
  const currentPreference = getPreferredTheme();
  applyTheme(currentPreference);

  // Cycle theme on button click: system → light → dark → system
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = getPreferredTheme();
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      applyTheme(next);
    });
  }

  // Listen for system theme changes (only affects system mode)
  const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: light)');
  const syncSystemTheme = () => {
    const preference = getPreferredTheme();
    if (preference === 'system') {
      applyTheme('system');
    }
  };

  if ('addEventListener' in colorSchemeMedia) {
    colorSchemeMedia.addEventListener('change', syncSystemTheme);
  } else if ('addListener' in colorSchemeMedia) {
    colorSchemeMedia.addListener(syncSystemTheme);
  }
})();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Intersection Observer for scroll-triggered animations
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all elements with the reveal class
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
} else {
  // Reduced motion or fallback for browsers without IntersectionObserver
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
}

if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let rafId = null;
  let latestX = window.innerWidth / 2;
  let latestY = window.innerHeight / 3;

  const applyPointerGlow = () => {
    document.documentElement.style.setProperty('--cursor-x', `${latestX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${latestY}px`);
    rafId = null;
  };

  document.addEventListener('pointermove', (event) => {
    latestX = event.clientX;
    latestY = event.clientY;

    if (!rafId) {
      rafId = window.requestAnimationFrame(applyPointerGlow);
    }
  }, { passive: true });
}
