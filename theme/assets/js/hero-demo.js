/* The hero code sample is fully rendered from the start. Once it scrolls
   into view, the `tags:` value writes itself: [format] — a beat to think —
   corrected to [frontmatter] — a beat — then , specification is added.
   No-JS / reduced-motion: the final value is already there. */
(function () {
  var sample = document.querySelector('.hero .sample');
  if (!sample) return;
  var tags = sample.querySelector('.sample-tags');
  if (!tags) return;

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  var finalHTML = tags.innerHTML;

  var caret = document.createElement('span');
  caret.className = 'sample-caret';
  caret.setAttribute('aria-hidden', 'true');

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typeStr(str, per) {
    return str.split('').reduce(function (p, ch) {
      return p.then(function () {
        tags.textContent += ch;
        return wait(per + Math.random() * 55);
      });
    }, Promise.resolve());
  }

  function eraseN(n, per) {
    return new Promise(function (resolve) {
      (function back(left) {
        if (left <= 0 || !tags.textContent.length) return resolve();
        tags.textContent = tags.textContent.slice(0, -1);
        setTimeout(function () { back(left - 1); }, per);
      })(n);
    });
  }

  function run() {
    tags.textContent = '';
    tags.after(caret);
    wait(450)
      .then(function () { return typeStr('[format]', 72); })
      .then(function () { return wait(1000); })           // ... thinking
      .then(function () { return eraseN(7, 46); })        // "format]" -> "["
      .then(function () { return typeStr('frontmatter]', 72); })
      .then(function () { return wait(600); })            // beat
      .then(function () { return eraseN(1, 46); })        // "]" -> "[frontmatter"
      .then(function () { return typeStr(', specification]', 72); })
      .then(function () { return wait(300); })
      .then(function () { tags.innerHTML = finalHTML; tags.after(caret); });
  }

  var io = new IntersectionObserver(function (entries, obs) {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    run();
  }, { threshold: 0.45 });

  io.observe(sample);
})();
