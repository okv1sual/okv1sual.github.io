// okv1sual — card housing: scroll-reveal grid, click-to-expand, nav hash open.
(function () {
  if (window.__siteCardsInitialized) {
    return;
  }
  window.__siteCardsInitialized = true;

  const CARD_IDS = ['about', 'sponsors', 'lets-chat', 'downloads', 'support', 'merch'];
  const INSET = 20;

  function init() {
    const section = document.getElementById('cards');
    const cards = Array.from(document.querySelectorAll('.site-card'));
    if (!section || !cards.length) return;

    cards.forEach((card, index) => {
      card.classList.add('site-card--' + (index + 1));
    });

    let openCardEl = null;
    let placeholder = null;
    let closing = false;
    let opening = false;

    function isAtPageTop() {
      return (window.scrollY || document.documentElement.scrollTop) <= 40;
    }

    function cardInView(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.82 && rect.bottom > 0;
    }

    function updateReveal() {
      if (openCardEl) return;
      if (isAtPageTop()) {
        cards.forEach(el => el.classList.remove('is-visible'));
        return;
      }
      cards.forEach(el => {
        if (cardInView(el)) el.classList.add('is-visible');
      });
    }

    function flyAway(card, active) {
      const rect = card.getBoundingClientRect();
      const dx = (rect.left + rect.width / 2) - (window.innerWidth / 2);
      const dy = (rect.top + rect.height / 2) - (window.innerHeight / 2);
      const dist = Math.max(Math.hypot(dx, dy), 1);
      const push = Math.max(window.innerWidth, window.innerHeight) * 0.9 / dist;
      card.classList.add('is-away');
      card.style.transform = 'translate(' + (dx * push) + 'px, ' + (dy * push) + 'px) scale(0.72)';
      card.style.opacity = '0';
    }

    function restoreAway(card) {
      card.classList.remove('is-away');
      card.style.transform = '';
      card.style.opacity = '';
    }

    function setExpandedFrame(card, rect) {
      card.style.position = 'fixed';
      card.style.top = rect.top + 'px';
      card.style.left = rect.left + 'px';
      card.style.width = rect.width + 'px';
      card.style.height = rect.height + 'px';
      card.style.margin = '0';
      card.style.zIndex = '900';
      card.style.right = 'auto';
      card.style.bottom = 'auto';
    }

    function setFullFrame(card) {
      card.style.top = INSET + 'px';
      card.style.left = INSET + 'px';
      card.style.width = 'calc(100% - ' + (INSET * 2) + 'px)';
      card.style.height = 'calc(100% - ' + (INSET * 2) + 'px)';
    }

    function clearFrame(card) {
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.width = '';
      card.style.height = '';
      card.style.margin = '';
      card.style.zIndex = '';
      card.style.right = '';
      card.style.bottom = '';
      card.style.transform = '';
      card.style.opacity = '';
    }

    function openCard(id) {
      const card = document.getElementById(id);
      if (!card || closing || opening) return;
      if (openCardEl && openCardEl.id === id) return;

      if (openCardEl && openCardEl !== card) {
        closeCard(true);
      }

      opening = true;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const alreadyNear = section.getBoundingClientRect().top <= 80 && section.getBoundingClientRect().top > -120;
      if (!alreadyNear) {
        window.scrollTo({ top: Math.max(0, sectionTop), behavior: 'smooth' });
      }

      const start = function () {
        opening = false;
        cards.forEach(el => el.classList.add('is-visible'));
        const rect = card.getBoundingClientRect();
        placeholder = document.createElement('div');
        placeholder.className = 'site-card-slot';
        placeholder.style.height = rect.height + 'px';
        card.parentNode.insertBefore(placeholder, card);

        cards.forEach(other => {
          if (other !== card) flyAway(other);
        });

        setExpandedFrame(card, rect);
        card.classList.add('is-expanded');
        openCardEl = card;
        section.classList.add('is-open');
        document.body.classList.add('card-open');
        const navWrapper = document.getElementById('boxerNavWrapper');
        if (navWrapper) {
          navWrapper.classList.remove('is-open');
          const toggleBtn = document.getElementById('menuToggleBtn');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            setFullFrame(card);
          });
        });

        if (history.replaceState) {
          history.replaceState(null, '', '#' + id);
        }
      };

      if (alreadyNear) {
        start();
      } else {
        let tries = 0;
        (function waitForSection() {
          if (section.getBoundingClientRect().top <= 90 || tries > 24) {
            start();
            return;
          }
          tries += 1;
          window.setTimeout(waitForSection, 50);
        })();
      }
    }

    function closeCard(instant) {
      if (!openCardEl || closing) return;
      const card = openCardEl;
      closing = true;

      cards.forEach(other => {
        if (other !== card) restoreAway(other);
      });

      function finish() {
        card.classList.remove('is-expanded');
        clearFrame(card);
        if (placeholder) {
          placeholder.remove();
          placeholder = null;
        }
        openCardEl = null;
        closing = false;
        section.classList.remove('is-open');
        document.body.classList.remove('card-open');
        if (history.replaceState) {
          history.replaceState(null, '', '#cards');
        }
      }

      if (instant || !placeholder) {
        finish();
        return;
      }

      const dest = placeholder.getBoundingClientRect();
      setExpandedFrame(card, {
        top: INSET,
        left: INSET,
        width: card.getBoundingClientRect().width,
        height: card.getBoundingClientRect().height
      });
      window.requestAnimationFrame(function () {
        card.style.top = dest.top + 'px';
        card.style.left = dest.left + 'px';
        card.style.width = dest.width + 'px';
        card.style.height = dest.height + 'px';
      });

      const onEnd = function (e) {
        if (e.propertyName !== 'width' && e.propertyName !== 'top') return;
        card.removeEventListener('transitionend', onEnd);
        finish();
      };
      card.addEventListener('transitionend', onEnd);
      window.setTimeout(function () {
        if (openCardEl === card) {
          card.removeEventListener('transitionend', onEnd);
          finish();
        }
      }, 700);
    }

    cards.forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.site-card-close')) {
          e.stopPropagation();
          closeCard();
          return;
        }
        if (card.classList.contains('is-expanded')) return;
        openCard(card.id);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCard();
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const id = (link.getAttribute('href') || '').replace('#', '');
        if (id === 'hero' || id === 'cards' || id === '') {
          if (openCardEl) closeCard(true);
          return;
        }
        if (CARD_IDS.indexOf(id) !== -1) {
          e.preventDefault();
          openCard(id);
        }
      });
    });

    let scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        updateReveal();
        scrollTicking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', updateReveal);

    updateReveal();

    const hash = (window.location.hash || '').replace('#', '');
    if (CARD_IDS.indexOf(hash) !== -1) {
      window.setTimeout(function () {
        openCard(hash);
      }, 2600);
    }

    window.__siteCards = {
      open: openCard,
      close: closeCard
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
