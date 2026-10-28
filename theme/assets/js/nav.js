/* Head navigation: scroll shadow + mobile sandwich toggle + dropdowns + scroll spy. */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  /* ---- fade a divider in under the bar once the page is scrolled ---- */
  var setScrolled = function () {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    nav.classList.toggle('is-scrolled', y > 2);
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* ---- <details> dropdowns: one open at a time, close on outside click ---- */
  var dds = Array.prototype.slice.call(nav.querySelectorAll('.nav-dd'));
  if (dds.length) {
    dds.forEach(function (dd) {
      dd.addEventListener('toggle', function () {
        if (!dd.open) return;
        dds.forEach(function (o) { if (o !== dd) o.open = false; });
      });
    });
    document.addEventListener('click', function (e) {
      dds.forEach(function (dd) {
        if (dd.open && !dd.contains(e.target)) dd.open = false;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dds.forEach(function (dd) { dd.open = false; });
    });
  }

  /* ---- sandwich toggle ---- */
  var burger = nav.querySelector('.nav-burger');
  var menu = document.getElementById('nav-menu');
  if (burger && menu) {
    var close = function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /* ---- doc popovers: move focus into the panel on open, restore on close ---- */
  var popovers = document.querySelectorAll('.doc-side-pop[popover], .doc-outline-pop[popover]');
  Array.prototype.forEach.call(popovers, function (pop) {
    var opener = null;
    pop.addEventListener('toggle', function (e) {
      if (e.newState === 'open') {
        opener = document.activeElement;
        var first = pop.querySelector('a[href], button');
        if (first) first.focus();
      } else if (opener && typeof opener.focus === 'function') {
        opener.focus();
        opener = null;
      }
    });
  });

  /* ---- scroll spy (shared): in-page section strip + doc outline ----
     Tracks each target's own `scroll-margin-top` (the line an anchor click
     or `:target` scrolls it to) rather than a fixed mid-viewport band, so a
     clicked entry highlights immediately and short/last sections — which
     may never cross a mid-screen band, and can't be scrolled past page
     bottom — still activate correctly. */
  function spy(linkNodes) {
    var links = Array.prototype.slice.call(linkNodes).filter(function (a) {
      var h = a.getAttribute('href') || '';
      return h.charAt(0) === '#' || h.indexOf('/#') === 0;
    });
    if (!links.length) return;

    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace(/^[^#]*#/, '');
      var el = id && document.getElementById(id);
      if (el) { map[id] = a; targets.push(el); }
    });
    if (!targets.length) return;

    var activeId;
    function activate(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (id && map[id]) map[id].classList.add('is-active');
    }

    function update() {
      var atBottom = window.innerHeight + window.scrollY
        >= document.documentElement.scrollHeight - 2;
      if (atBottom) { activate(targets[targets.length - 1].id); return; }

      var current = null;
      for (var i = 0; i < targets.length; i++) {
        var margin = parseFloat(getComputedStyle(targets[i]).scrollMarginTop) || 0;
        if (targets[i].getBoundingClientRect().top <= margin + 1) current = targets[i].id;
        else break;                /* targets run in document order */
      }
      activate(current);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        activate(a.getAttribute('href').replace(/^[^#]*#/, ''));
      });
    });

    update();
  }

  spy(nav.querySelectorAll('a[href*="#"]'));
  spy(document.querySelectorAll('.doc-outline:not(.doc-outline-pop) a[href^="#"]'));
})();
