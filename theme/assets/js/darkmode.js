(function () {
  var DARK = '#1a1a19';
  var LIGHT = '#f3f0e6';

  // Dark is the default. Only an explicit stored choice of "light" opts out;
  // prefers-color-scheme is deliberately not consulted.
  var stored = localStorage.getItem('lima-theme');
  if (stored === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else if (stored === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }

  function setMeta(dark) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? DARK : LIGHT;
  }
  setMeta(document.documentElement.dataset.theme !== 'light');

  function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('lima-theme', dark ? 'dark' : 'light');
    setMeta(dark);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.dataset.theme !== 'light';
      applyTheme(!isDark);
    });
  });
})();
