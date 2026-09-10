/* =========================================================
   main.js — behaviour for 回
   Everything degrades: no JS still gives a readable page.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse  = window.matchMedia('(pointer: coarse)').matches;

  /* --- 1. links come from config.js, one place to edit ---------- */
  function applyLinks() {
    var cfg = window.SITE || {};
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var key = el.getAttribute('data-link');
      var val = cfg[key];
      if (!val) {                                   // not provided yet
        var slot = el.closest('[data-link-slot]');
        if (slot) {
          slot.classList.add('is-pending');
          el.removeAttribute('target');
          el.setAttribute('href', '#chapter-08');
          el.setAttribute('aria-disabled', 'true');
          var v = el.querySelector('.links__v');
          if (v) v.textContent = 'add your URL in config.js';
        }
        return;
      }
      el.setAttribute('href', key === 'email' ? 'mailto:' + val : val);
    });
  }
  applyLinks();

  /* --- 2. page-load sequence ------------------------------------ */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* --- 3. chapter tracking: rail, progress bar, ink/paper -------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('.chapter'));
  var railLinks = {};
  document.querySelectorAll('[data-rail]').forEach(function (a) {
    railLinks[a.getAttribute('data-rail')] = a;
  });
  var menuNow  = document.getElementById('menuNow');
  var progress = document.getElementById('progress');
  var ticking  = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var mid = window.scrollY + window.innerHeight * 0.45;
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= mid) current = sections[i];
      }
      var id = current.id.replace('chapter-', '');
      for (var k in railLinks) railLinks[k].classList.toggle('is-on', k === id);
      if (menuNow) {
        var label = railLinks[id] ? railLinks[id].querySelector('span').textContent : '';
        menuNow.textContent = id + ' ' + label;
      }
      document.body.classList.toggle('is-paper', current.classList.contains('chapter--paper'));

      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.height = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* --- 4. reveal the two diagrams, once each -------------------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-live'); io.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    ['system', 'stages'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  } else {
    ['system', 'stages'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('is-live');
    });
  }

  /* --- 5. mobile chapter index --------------------------------- */
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    function setMenu(open) {
      btn.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () {
      setMenu(btn.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
  }

  /* --- 6. magnetic primary buttons (desktop, motion allowed) ---- */
  if (!reduced && !coarse) {
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* --- 7. the lattice: nested squares that lean toward you ------ */
  var cv = document.getElementById('lattice');
  if (!cv) return;
  var ctx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, dpr = 1, cells = [];
  var px = -9999, py = -9999, tx = -9999, ty = -9999;
  var GAP = 78, REACH = 240;
  var t = 0, raf = null, visible = true;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var gap = W < 640 ? 62 : GAP;
    cells = [];
    var cols = Math.ceil(W / gap), rows = Math.ceil(H / gap);
    var ox = (W - (cols - 1) * gap) / 2, oy = (H - (rows - 1) * gap) / 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) cells.push({ x: ox + c * gap, y: oy + r * gap });
    }
  }

  function square(x, y, s, a) {
    ctx.beginPath();
    ctx.rect(x - s / 2, y - s / 2, s, s);
    ctx.globalAlpha = a;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var dx = cell.x - px, dy = cell.y - py;
      var d = Math.sqrt(dx * dx + dy * dy);
      var f = d < REACH ? 1 - d / REACH : 0;          // 0 → 1 nearness
      f = f * f;
      var rings = 1 + Math.round(f * 2.6);            // 回 grows near the pointer
      ctx.strokeStyle = f > 0.06 ? 'rgba(155,132,232,' + (0.14 + f * 0.7) + ')'
                                 : 'rgba(232,229,222,0.10)';
      for (var k = 0; k < rings; k++) {
        square(cell.x, cell.y, 5 + k * 7 + f * 16, k === 0 ? 1 : 1 - k * 0.22);
      }
    }
    ctx.globalAlpha = 1;
  }

  function idle() {                                   // slow drift when nobody points
    t += 0.006;
    tx = W * (0.5 + 0.34 * Math.cos(t)) ;
    ty = H * (0.5 + 0.28 * Math.sin(t * 1.31));
  }

  var pointed = false, lastMove = 0;
  function loop() {
    if (!pointed || performance.now() - lastMove > 2600) { pointed = false; idle(); }
    px += (tx - px) * 0.075;
    py += (ty - py) * 0.075;
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() { if (!raf && visible && !reduced) raf = requestAnimationFrame(loop); }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  build();
  if (reduced) {
    px = W * 0.28; py = H * 0.42; draw();             // one static frame, no animation
  } else {
    idle(); px = tx; py = ty; start();
    window.addEventListener('pointermove', function (e) {
      if (e.clientY > window.innerHeight) return;
      tx = e.clientX; ty = e.clientY + window.scrollY - cv.getBoundingClientRect().top - window.scrollY;
      pointed = true; lastMove = performance.now();
    }, { passive: true });
  }

  window.addEventListener('resize', function () { build(); if (reduced) draw(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      visible ? start() : stop();                     // no work while off-screen
    }, { threshold: 0 }).observe(cv);
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
})();
