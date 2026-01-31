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
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    const preference = getPreferredTheme();
    if (preference === 'system') {
      applyTheme('system');
    }
  });
})();

// Intersection Observer for scroll-triggered animations
if ('IntersectionObserver' in window) {
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
  // Fallback for browsers without IntersectionObserver
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
}

// Parallax effect for background orbs on scroll
let ticking = false;
const orbs = document.querySelectorAll('.orb');

function updateParallax() {
  const scrolled = window.scrollY;

  orbs.forEach((orb, i) => {
    const speed = 0.1 + (i * 0.05);
    orb.style.transform = `translateY(${scrolled * speed}px)`;
  });

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// Cursor-reactive glow for orbs (desktop only)
if (window.matchMedia('(min-width: 768px)').matches) {
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateOrbs() {
    // Smooth lerp animation
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    orbs.forEach((orb, i) => {
      const rect = orb.getBoundingClientRect();
      const orbCenterX = rect.left + rect.width / 2;
      const orbCenterY = rect.top + rect.height / 2;

      const deltaX = currentX - orbCenterX;
      const deltaY = currentY - orbCenterY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 500;

      if (distance < maxDistance) {
        const strength = (1 - distance / maxDistance) * 20;
        const moveX = (deltaX / distance) * strength;
        const moveY = (deltaY / distance) * strength;

        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });

    requestAnimationFrame(animateOrbs);
  }

  animateOrbs();
}
