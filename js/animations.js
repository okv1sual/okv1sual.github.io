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

      pupil.style.transition = 'stroke-dashoffset 0.95s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => pupil.style.strokeDashoffset = '0', 100);
      setTimeout(() => lids.forEach(lid => { lid.style.transition = 'stroke-dashoffset 0.65s'; lid.style.strokeDashoffset = '0'; }), 950);
      setTimeout(() => lashes.classList.add('is-popped'), 1600);
      setTimeout(() => eyeBox.classList.add('is-blinking'), 2000);
      setTimeout(() => eyeBox.classList.remove('is-blinking'), 2300);

      // UNLOCKS UI + TOP BAR AT 2.5S
      setTimeout(() => {
        document.body.classList.add('intro-complete');
        eyeBox.classList.add('can-hover');
        startTypewriter();
      }, 2500);

      // EYE CLICK HANDLER: HIDES "CLICK THIS" & POPS IN SOCIAL ICONS
      let eyeClicked = false;
      eyeBox.addEventListener('click', () => {
        eyeBox.classList.add('is-blinking');
        setTimeout(() => eyeBox.classList.remove('is-blinking'), 300);

        if (!eyeClicked) {
          eyeClicked = true;
          if (doodlePrompt) doodlePrompt.classList.add('is-hidden');
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
