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

      // UNLOCKS UI + TOP BAR AT 2.5S
      let introComplete = false;
      setTimeout(() => {
        document.body.classList.add('intro-complete');
        introComplete = true;
        startTypewriter();
        writeOnDoodlePrompt(doodleState);
      }, 2500);

      // BLINK: a brief, self-resetting animation only — never a persistent
      // closed state — so the eye can't get stuck on any device. Triggered
      // by hover on desktop, and by the click handler below on mobile/tap.
      function triggerBlink(duration) {
        eyeBox.classList.add('is-blinking');
        setTimeout(() => eyeBox.classList.remove('is-blinking'), duration || 300);
      }

      eyeBox.addEventListener('mouseenter', () => {
        if (!introComplete) return;
        triggerBlink();
      });

      // EYE CLICK HANDLER: ERASES "CLICK THIS" & POPS IN SOCIAL ICONS
      let eyeClicked = false;
      eyeBox.addEventListener('click', () => {
        if (!introComplete) return;
        triggerBlink();

        if (!eyeClicked) {
          eyeClicked = true;
          eraseDoodlePrompt(doodleState, () => {
            if (doodlePrompt) doodlePrompt.classList.add('is-hidden');
          });
          setTimeout(() => {
            if (heroSocialGroup) heroSocialGroup.classList.add('is-visible');
          }, 150);
        }
      });

      function startTypewriter() {
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
          }
        }
        typeChar();
      }
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initHero); } else { initHero(); }
})();
