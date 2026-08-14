// okv1sual — "what i do" section: scroll-triggered doodle reveal for the
// heading, subtext, and hand-drawn icon cards.
(function () {
  if (window.__widInitialized) {
    return;
  }
  window.__widInitialized = true;

  function init() {
    const revealEls = document.querySelectorAll('#what-i-do .scroll-reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      // No IO support: just show everything immediately.
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
