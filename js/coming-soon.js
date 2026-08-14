// Isolated coming-soon page only. Safe to delete with coming-soon/ and css/coming-soon.css.
// Must load before js/animations.js so the shared eye intro can call this typewriter.
(function () {
  window.okv1sualHeroConfig = {
    deferSocials: true,
    startTypewriter: function (typewriterEl, onComplete) {
      if (!typewriterEl) {
        if (onComplete) onComplete();
        return;
      }
      const textPrefix = "coming ";
      const highlightWord = "soon";
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
          typewriterEl.innerHTML = 'coming <span class="highlight-yellow">soon</span>';
          if (onComplete) onComplete();
        }
      }
      typeChar();
    }
  };
})();
