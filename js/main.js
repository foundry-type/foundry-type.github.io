/* Foundry — boot, theme, navigation, hero kinetics, reveals, easter eggs */
(function () {
  'use strict';
  var F = window.F, $ = F.$;

  var THEMES = [
    { id: 'swiss', n: 'Swiss', c: '#e4002b' },
    { id: 'letterpress', n: 'Letterpress', c: '#b8371d' },
    { id: 'night', n: 'Night Press', c: '#0f0f10' },
    { id: 'riso', n: 'Riso', c: '#ff3d9a' }
  ];

  function applyTheme(id) {
    var t = THEMES.filter(function (x) { return x.id === id; })[0] || THEMES[0];
    document.documentElement.setAttribute('data-theme', t.id);
    $('themeName').textContent = t.n;
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t.c);
  }

  /* ---------- nav ---------- */
  function initNav() {
    var nav = $('nav'), btn = $('menuBtn');
    function setOpen(v) {
      nav.classList.toggle('open', v); document.body.classList.toggle('menu-open', v);
      btn.setAttribute('aria-expanded', String(v)); btn.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    }
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); F.audio.play('swish'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100 && nav.classList.contains('open')) setOpen(false); });

    var links = nav.querySelectorAll('a');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (!x.isIntersecting) return;
          links.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + x.target.id;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main > section').forEach(function (s) { io.observe(s); });
    }
    $('top').classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', function () { $('top').classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });
  }

  /* ---------- section titles: split into letters for the press-drop ---------- */
  function splitTitles() {
    document.querySelectorAll('[data-split]').forEach(function (h) {
      var txt = h.textContent; h.setAttribute('aria-label', txt);
      h.innerHTML = Array.from(txt).map(function (ch, i) {
        return ch === ' ' ? '<span class="sp" aria-hidden="true"> </span>' : '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + F.esc(ch) + '</span>';
      }).join('');
    });
    var secs = document.querySelectorAll('.sec');
    if (!('IntersectionObserver' in window) || F.reduced()) { secs.forEach(function (s) { s.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.08 });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------- hero: weight follows the pointer, taps recast letters ---------- */
  function initHero() {
    var hero = $('hero'), word = $('heroTitle'), letters = word.querySelectorAll('.hl');
    var faces = ['inter', 'fraunces', 'anton'];
    letters.forEach(function (l, i) { l.style.setProperty('--i', i); });
    var raf = 0, px = 0, py = 0;
    function update() {
      raf = 0;
      letters.forEach(function (l) {
        var r = l.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var d = Math.hypot(px - cx, (py - cy) * 0.6);
        var w = Math.round(F.clamp(900 - d * 1.6, 100, 900));
        l.style.fontWeight = w;
      });
    }
    if (!F.reduced()) {
      hero.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        hero.classList.add('live'); px = e.clientX; py = e.clientY;
        if (!raf) raf = requestAnimationFrame(update);
      });
      hero.addEventListener('pointerleave', function () {
        hero.classList.remove('live'); letters.forEach(function (l) { l.style.fontWeight = ''; });
      });
    }
    function recast(l) {
      var cur = l.dataset.face || 'inter';
      var opts = faces.concat(F.FONTS.filter(function (f) { return F.fontState[f.id] === 'ok' && !f.stack; }).map(function (f) { return f.id; }))
        .filter(function (id, i, a) { return a.indexOf(id) === i && id !== cur; });
      var id = F.pick(opts); l.dataset.face = id;
      l.style.fontFamily = F.family(id);
      l.title = F.font(id).name;
      l.classList.remove('pop'); void l.offsetWidth; l.classList.add('pop');
      setTimeout(function () { l.classList.remove('pop'); }, 600);
      F.audio.play('press');
    }
    word.addEventListener('click', function (e) { var l = e.target.closest('.hl'); if (l) recast(l); });
    /* keyboard equivalent: Enter on the headline recasts a random letter */
    word.tabIndex = 0;
    word.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); recast(F.pick(Array.prototype.slice.call(letters))); } });
    var tk = $('tickerIn'); tk.innerHTML += tk.innerHTML;
  }

  /* ---------- easter eggs ---------- */
  function initEggs() {
    var buf = '';
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (!e.key || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-12);
      if (/comic ?sans$/.test(buf)) { buf = ''; comic(); }
      else if (/keming$/.test(buf)) { buf = ''; keming(); }
    });
    function comic() {
      document.body.classList.add('comic');
      F.toast('You typed it. We’ve alerted the typographic authorities. (6 seconds of chaos…)');
      F.audio.play('buzz');
      setTimeout(function () { document.body.classList.remove('comic'); F.toast('Order restored. Nobody saw anything.'); }, 6000);
    }
    function keming() {
      var w = $('heroTitle'); w.classList.add('keming');
      F.toast('Keming: the result of improper kerning. Fixing it in 3… 2… 1…');
      setTimeout(function () { w.classList.remove('keming'); }, 3200);
    }
    /* tap the brand mark five times for a joke */
    var taps = 0, tt = 0;
    document.querySelector('.brand-mark').addEventListener('click', function (e) {
      taps++; clearTimeout(tt); tt = setTimeout(function () { taps = 0; }, 1500);
      if (taps >= 5) { e.preventDefault(); taps = 0; F.toast(F.pick(F.JOKES)); F.audio.play('ding'); }
    });
  }

  /* ---------- sound + theme buttons ---------- */
  function initButtons() {
    var sb = $('soundBtn');
    var saved = false; try { saved = localStorage.getItem('foundry.sound') === '1'; } catch (e) { }
    function setSound(v, announce) {
      F.audio.set(v);
      sb.setAttribute('aria-pressed', String(v)); sb.classList.toggle('on', v);
      sb.setAttribute('aria-label', v ? 'Sound on. Turn off press sounds' : 'Sound off. Turn on press sounds');
      try { localStorage.setItem('foundry.sound', v ? '1' : '0'); } catch (e) { }
      if (announce) { F.toast(v ? 'Press sounds on. Ka-chunk.' : 'Silence. Like a library, but for type.'); F.audio.play('press'); }
    }
    /* preference remembered, but audio only starts after a gesture (iOS/autoplay rules) */
    sb.setAttribute('aria-pressed', String(saved)); sb.classList.toggle('on', saved);
    var pendingOn = saved;
    sb.addEventListener('click', function () { pendingOn = false; setSound(!F.audio.isOn(), true); });
    var unlock = function () {
      if (pendingOn) { pendingOn = false; setSound(true, false); }
      F.audio.unlock();
      window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);

    $('themeBtn').addEventListener('click', function () {
      var i = THEMES.map(function (t) { return t.id; }).indexOf(F.S.th);
      var nt = THEMES[(i + 1) % THEMES.length];
      F.set({ th: nt.id }); F.audio.play('swish');
      document.documentElement.classList.add('theme-flip');
      setTimeout(function () { document.documentElement.classList.remove('theme-flip'); }, 700);
    });
    $('shareTop').addEventListener('click', function () { F.shareNow(); });
  }

  function boot() {
    var parsed = F.parseQuery(location.search);
    F.S = Object.assign({}, F.DEF, parsed);
    applyTheme(F.S.th);
    F.on(function (S, ch) { if (!ch || ch.indexOf('th') >= 0) applyTheme(S.th); });
    F.initStudio();
    F.initPosters();
    F.initTools();
    F.initGame();
    initNav(); splitTitles(); initHero(); initEggs(); initButtons();
    F.set({}, { force: true });
    F.writeURL();
    if (Object.keys(parsed).length > 2) setTimeout(function () { F.toast('Design loaded from the link. Hello, fellow typographer.'); }, 900);
    document.documentElement.classList.add('ready');
    if (F.lowPower) document.documentElement.classList.add('low');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
