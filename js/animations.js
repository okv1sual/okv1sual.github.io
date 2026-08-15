// okv1sual — hero animations: hand-drawn eye intro, blink, and typewriter headline
(function () {
  function initHero() {
    const eyeBox = document.getElementById('heroEyeBox');
    const pupil = document.getElementById('heroPupil');
    const lids = document.querySelectorAll('.anim-lid');
    const lashes = document.getElementById('heroLashes');
    const typewriterEl = document.getElementById('heroTypewriter');
    const doodlePrompt = document.getElementById('doodlePrompt');
    const heroSocialGroup = document.getElementById('heroSocialGroup');
    const heroSkyBg = document.getElementById('heroSkyBg');
    const heroScrollBtn = document.getElementById('heroScrollBtn');
    // Optional per-page overrides (coming-soon/). Unset on the main site.
    const heroConfig = window.okv1sualHeroConfig || {};

    if (eyeBox && pupil) {
      function setupPath(path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
      }
      setupPath(pupil);
      lids.forEach(lid => setupPath(lid));

      // --- "click this" doodle: set up hidden state (empty text, undrawn
      // arrow) so it can be revealed with a handwriting-style type-on, and
      // reversed with a matching erase animation on eye click.
      function setupDoodlePrompt() {
        if (!doodlePrompt) return null;
        const textEl = doodlePrompt.querySelector('.doodle-text');
        const arrowPaths = Array.from(doodlePrompt.querySelectorAll('.doodle-arrow-svg path'));
        const fullText = textEl ? textEl.textContent : '';
        if (textEl) textEl.textContent = '';
        arrowPaths.forEach(setupPath);
        return { textEl, arrowPaths, fullText };
      }

      function writeOnDoodlePrompt(state) {
        if (!state) return;
        const { textEl, arrowPaths, fullText } = state;
        let i = 0;
        function typeNext() {
          if (i <= fullText.length) {
            if (textEl) textEl.textContent = fullText.slice(0, i);
            i++;
            setTimeout(typeNext, 45);
          } else {
            arrowPaths.forEach((path, idx) => {
              path.style.transition = 'stroke-dashoffset 0.35s ease-out';
              setTimeout(() => { path.style.strokeDashoffset = '0'; }, idx * 80);
            });
          }
        }
        typeNext();
      }

      function eraseDoodlePrompt(state, onComplete) {
        if (!state) { if (onComplete) onComplete(); return; }
        const { textEl, arrowPaths, fullText } = state;
        arrowPaths.forEach(path => {
          path.style.transition = 'stroke-dashoffset 0.25s ease-in';
          path.style.strokeDashoffset = String(path.getTotalLength());
        });
        setTimeout(() => {
          let i = fullText.length;
          (function eraseNext() {
            if (i >= 0) {
              if (textEl) textEl.textContent = fullText.slice(0, i);
              i--;
              setTimeout(eraseNext, 35);
            } else if (onComplete) {
              onComplete();
            }
          })();
        }, 200);
      }

      const doodleState = setupDoodlePrompt();

      pupil.style.transition = 'stroke-dashoffset 0.95s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => pupil.style.strokeDashoffset = '0', 100);
      setTimeout(() => lids.forEach(lid => { lid.style.transition = 'stroke-dashoffset 0.65s'; lid.style.strokeDashoffset = '0'; }), 950);
      setTimeout(() => lashes.classList.add('is-popped'), 1600);
      setTimeout(() => eyeBox.classList.add('is-blinking'), 2000);
      setTimeout(() => eyeBox.classList.remove('is-blinking'), 2300);

      // EYE IS "READY" once the draw-in finishes — this only enables the
      // hover-blink + click interaction and reveals the "click this"
      // prompt. The rest of the site (nav, sky background, other
      // sections, socials) stays fully locked/hidden until the user
      // actually clicks the eye — see the click handler below.
      let eyeReady = false;
      setTimeout(() => {
        eyeReady = true;
        writeOnDoodlePrompt(doodleState);
      }, 2500);

      // BLINK: a brief, self-resetting animation only — never a persistent
      // closed state — so the eye can't get stuck on any device. Triggered
      // by hover on desktop, and by the click handler below on mobile/tap.
      function triggerBlink(duration) {
        eyeBox.classList.add('is-blinking');
        setTimeout(() => eyeBox.classList.remove('is-blinking'), duration || 300);
      }

      // FIRST CLICK UNLOCKS THE WHOLE SITE: erase "click this", play the
      // closing half of a blink, then — instead of reopening with the
      // usual small lash bounce — "pop" the eye open big while the nav,
      // sky background, and rest of the page all reveal at the same
      // moment, so it reads as one single "pop reveals everything" beat.
      // Every click after that just plays the normal playful blink.
      let siteUnlocked = false;
      eyeBox.addEventListener('click', () => {
        if (!eyeReady) return;

        if (siteUnlocked) {
          triggerBlink();
          return;
        }

        siteUnlocked = true;

        eraseDoodlePrompt(doodleState, () => {
          if (doodlePrompt) doodlePrompt.classList.add('is-hidden');
        });

        eyeBox.classList.add('is-blinking');
        setTimeout(() => {
          eyeBox.classList.remove('is-blinking');
          eyeBox.classList.add('is-popping');

          document.documentElement.style.overflow = '';
          document.body.classList.add('intro-complete');
          startTypewriter();
          if (heroSocialGroup && !heroConfig.deferSocials) heroSocialGroup.classList.add('is-visible');

          setTimeout(() => eyeBox.classList.remove('is-popping'), 700);
        }, 280);
      });

      eyeBox.addEventListener('mouseenter', () => {
        if (!eyeReady) return;
        triggerBlink();
      });

      function revealSocialsIfDeferred() {
        if (heroConfig.deferSocials && heroSocialGroup) heroSocialGroup.classList.add('is-visible');
      }

      function startTypewriter() {
        if (typeof heroConfig.startTypewriter === 'function') {
          heroConfig.startTypewriter(typewriterEl, revealSocialsIfDeferred);
          return;
        }
        if (!typewriterEl) return;
        const textPrefix = "made to be ";
        const highlightWord = "seen";
        let charIndex = 0;
        const totalLen = textPrefix.length + highlightWord.length;

        function typeChar() {
          if (charIndex < totalLen) {
            charIndex++;
            let currentText = (textPrefix + highlightWord).substring(0, charIndex);

            if (currentText.length > textPrefix.length) {
              let typedHighlight = currentText.substring(textPrefix.length);
              typewriterEl.innerHTML = textPrefix + '<span class="highlight-yellow">' + typedHighlight + '</span><span class="cursor-bar">|</span>';
            } else {
              typewriterEl.innerHTML = currentText + '<span class="cursor-bar">|</span>';
            }

            setTimeout(typeChar, 85);
          } else {
            typewriterEl.innerHTML = 'made to be <span class="highlight-yellow">seen</span>';
            revealSocialsIfDeferred();
          }
        }
        typeChar();
      }

      // SKY BACKGROUND PARALLAX + SCROLL-BUTTON VISIBILITY — throttled via
      // requestAnimationFrame. Parallax is capped so it never outpaces the
      // buffer built into .hero-sky-bg. The yellow down-arrow fades out as
      // soon as the page leaves the top (or the button is clicked) and
      // fades back in only when the user returns to the top.
      let scrollUiTicking = false;
      function updateScrollUi() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (heroSkyBg) {
          const offset = Math.min(scrollY * 0.15, 80);
          heroSkyBg.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
        if (heroScrollBtn) {
          heroScrollBtn.classList.toggle('is-away', scrollY > 40);
        }
        scrollUiTicking = false;
      }
      window.addEventListener('scroll', () => {
        if (!scrollUiTicking) {
          window.requestAnimationFrame(updateScrollUi);
          scrollUiTicking = true;
        }
      }, { passive: true });
      updateScrollUi();

      if (heroScrollBtn) {
        heroScrollBtn.addEventListener('click', () => {
          heroScrollBtn.classList.add('is-away');
        });
      }
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initHero); } else { initHero(); }
})();
