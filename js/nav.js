// okv1sual — morphing top nav bar: scroll collapse, drawer menu, live clock, Twitch live status
(function () {
  if (window.__boxerNavInitialized) {
    return;
  }
  window.__boxerNavInitialized = true;

  function init() {
    const navWrapper = document.getElementById('boxerNavWrapper');
    const toggleBtn = document.getElementById('menuToggleBtn');
    const clockEl = document.getElementById('liveClock');

    if (!navWrapper || !toggleBtn) {
      return;
    }

    // --- Scroll handling (throttled via requestAnimationFrame) ---
    let scrollTicking = false;

    function closeMenu() {
      navWrapper.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function handleScroll() {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;

      if (scrollPos > 40) {
        navWrapper.classList.add('is-scrolled');
      } else {
        navWrapper.classList.remove('is-scrolled');
      }

      if (scrollPos > 250 && navWrapper.classList.contains('is-open')) {
        closeMenu();
      }

      scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(handleScroll);
        scrollTicking = true;
      }
    }, { passive: true });

    // --- Letter animation breakdown ---
    document.querySelectorAll('.stagger-link').forEach(link => {
      const text = link.textContent.trim();
      link.textContent = '';

      [...text].forEach((char, index) => {
        const charWrap = document.createElement('span');
        charWrap.className = 'char-wrapper';
        charWrap.style.setProperty('--i', index);

        const primary = document.createElement('span');
        primary.className = 'char-primary';
        primary.textContent = char === ' ' ? '\u00A0' : char;

        const secondary = document.createElement('span');
        secondary.className = 'char-secondary';
        secondary.textContent = char === ' ' ? '\u00A0' : char;

        charWrap.appendChild(primary);
        charWrap.appendChild(secondary);
        link.appendChild(charWrap);
      });
    });

    // --- Menu toggle ---
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navWrapper.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the drawer whenever a menu link is clicked, since links now
    // scroll to sections on the same page rather than navigating away.
    document.querySelectorAll('.menu-links a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!navWrapper.contains(e.target) && navWrapper.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // --- Live clock ---
    if (window.__boxerClockInterval) {
      clearInterval(window.__boxerClockInterval);
    }

    function updateClock() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    updateClock();
    window.__boxerClockInterval = setInterval(updateClock, 1000);

    // --- Twitch live status ---
    // Twitch's own API requires a secret key to check stream status, and
    // this code runs fully client-side (visible in page source), so we
    // can't safely embed that secret here. decapi.me is a free, no-auth
    // status-check service built for exactly this use case (streamer
    // overlays/chatbots call it directly from the browser).
    const streamStatusLink = document.getElementById('streamStatusBtn');
    const statusTextEl = document.getElementById('statusText');
    // Hero's own Twitch icon (in the reveal-on-eye-click social row) gets
    // a small pulsing badge kept in sync with this same status check, so
    // there's a single source of truth for "am I live right now".
    const heroTwitchBtn = document.getElementById('heroTwitchBtn');

    function getTwitchChannelFromLink(link) {
      try {
        const path = new URL(link.href).pathname.replace(/\//g, '');
        return path || null;
      } catch (e) {
        return null;
      }
    }

    function checkTwitchLiveStatus() {
      if (!streamStatusLink || !statusTextEl) return;
      const channel = getTwitchChannelFromLink(streamStatusLink);
      if (!channel) return;

      fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(channel)}`)
        .then(res => {
          if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
          return res.text();
        })
        .then(text => {
          const isLive = !/offline/i.test(text.trim());
          streamStatusLink.classList.toggle('is-live', isLive);
          statusTextEl.textContent = isLive ? 'LIVE' : 'STREAM OFFLINE';
          if (heroTwitchBtn) heroTwitchBtn.classList.toggle('is-live', isLive);
        })
        .catch(() => {
          streamStatusLink.classList.remove('is-live');
          statusTextEl.textContent = 'STREAM OFFLINE';
          if (heroTwitchBtn) heroTwitchBtn.classList.remove('is-live');
        });
    }

    if (window.__boxerTwitchInterval) {
      clearInterval(window.__boxerTwitchInterval);
    }
    checkTwitchLiveStatus();
    window.__boxerTwitchInterval = setInterval(checkTwitchLiveStatus, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
