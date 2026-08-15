// okv1sual — "what i do" section: scroll-triggered doodle reveal for the
// hand-drawn icon cards. Cards hide again only once you're back at the
// top of the page, so the draw-in can replay on the next pass.
(function () {
  if (window.__widInitialized) {
    return;
  }
  window.__widInitialized = true;

  function init() {
    const revealEls = document.querySelectorAll('#what-i-do .scroll-reveal');
    if (!revealEls.length) return;

    function isAtPageTop() {
      return (window.scrollY || document.documentElement.scrollTop) <= 40;
    }

    function cardInView(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.82 && rect.bottom > 0;
    }

    function updateCards() {
      if (isAtPageTop()) {
        revealEls.forEach(el => el.classList.remove('is-visible'));
        return;
      }

      revealEls.forEach(el => {
        if (cardInView(el)) el.classList.add('is-visible');
      });
    }

    let scrollTicking = false;
    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateCards();
        scrollTicking = false;
      });
    }

    updateCards();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
