/* Foundry — core: helpers, font loader, URL state, local history, audio, toast */
(function () {
  'use strict';
  var F = window.F;

  /* ---------- helpers ---------- */
  F.$ = function (id) { return document.getElementById(id); };
  F.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  F.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  F.reduced = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  F.lowPower = (function () {
    var c = navigator.hardwareConcurrency || 4;
    var m = navigator.deviceMemory || 4;
    return c <= 2 || m <= 2;
  })();
  F.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  /* ---------- fonts ---------- */
  F.font = function (id) { return F.FONT_MAP[id] || F.FONT_MAP.inter; };
  F.family = function (id) {
    var f = F.font(id);
    return f.stack ? f.stack : '"' + f.name + '", ' + f.fb;
  };
  F.gURL = function (ids) {
    var fams = [];
    ids.forEach(function (i) { var f = F.font(i); if (f.g && fams.indexOf(f.g) < 0) fams.push(f.g); });
    if (!fams.length) return '';
    return 'https://fonts.googleapis.com/css2?' + fams.map(function (g) { return 'family=' + g; }).join('&') + '&display=swap';
  };
  F.fontState = {}; // id -> 'ok' | 'fail' | 'loading'
  var fontPromises = {};
  F.loadFont = function (id) {
    var f = F.font(id);
    if (f.stack) { F.fontState[id] = 'ok'; return Promise.resolve(true); }
    if (fontPromises[f.id]) return fontPromises[f.id];
    F.fontState[f.id] = 'loading';
    fontPromises[f.id] = new Promise(function (resolve) {
      var done = false;
      function finish(ok) {
        if (done) return; done = true;
        F.fontState[f.id] = ok ? 'ok' : 'fail';
        resolve(ok);
      }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = F.gURL([f.id]);
      link.onload = function () {
        if (!document.fonts || !document.fonts.load) { finish(true); return; }
        var w = F.clamp(400, f.min, f.max);
        document.fonts.load(w + ' 40px "' + f.name + '"').then(function (list) {
          finish(list && list.length > 0);
        }).catch(function () { finish(false); });
      };
      link.onerror = function () { finish(false); };
      document.head.appendChild(link);
      setTimeout(function () { finish(false); }, 10000);
    });
    return fontPromises[f.id];
  };
  /* make sure a given weight/style is ready (for canvas drawing) */
  F.ensureFace = function (id, weight, italic) {
    var f = F.font(id);
    if (f.stack || !document.fonts || !document.fonts.load) return Promise.resolve(true);
    return F.loadFont(id).then(function (ok) {
      if (!ok) return false;
      return document.fonts.load((italic ? 'italic ' : '') + weight + ' 40px "' + f.name + '"')
        .then(function () { return true; }).catch(function () { return false; });
    });
  };
  F.weightFor = function (id, w) { var f = F.font(id); return F.clamp(w, f.min, f.max); };

  /* ---------- URL state ---------- */
  F.DEF = {
    h: 'fraunces', b: 'inter', hw: 800, bw: 400, ht: -2, bt: 0, hl: 100, lh: 150, sz: 18,
    r: '1.25', fg: '111111', bg: 'f4efe6', t: 'Foundry', p: 'zurich', th: 'swiss', it: '0', up: '0'
  };
  var SPEC = {
    h: { t: 'font' }, b: { t: 'font' },
    hw: { t: 'n', min: 100, max: 900 }, bw: { t: 'n', min: 100, max: 900 },
    ht: { t: 'n', min: -10, max: 30 }, bt: { t: 'n', min: -5, max: 20 },
    hl: { t: 'n', min: 80, max: 160 }, lh: { t: 'n', min: 100, max: 240 },
    sz: { t: 'n', min: 12, max: 28 },
    r: { t: 'e', v: F.RATIOS.map(function (r) { return r.v; }) },
    fg: { t: 'hex' }, bg: { t: 'hex' }, t: { t: 's', max: 40 },
    p: { t: 'e', v: ['zurich', 'press', 'glyph', 'fall'] },
    th: { t: 'e', v: ['swiss', 'letterpress', 'night', 'riso'] },
    it: { t: 'e', v: ['0', '1'] }, up: { t: 'e', v: ['0', '1'] }
  };
  F.KEYS = Object.keys(F.DEF);

  function validate(k, v) {
    var s = SPEC[k];
    if (!s || v === undefined || v === null) return undefined;
    if (s.t === 'font') return F.FONT_MAP[v] ? v : undefined;
    if (s.t === 'n') { var n = Math.round(parseFloat(v)); return isFinite(n) ? F.clamp(n, s.min, s.max) : undefined; }
    if (s.t === 'e') return s.v.indexOf(String(v)) >= 0 ? String(v) : undefined;
    if (s.t === 'hex') { var h = String(v).replace('#', '').toLowerCase(); if (/^[0-9a-f]{3}$/.test(h)) h = h.replace(/(.)/g, '$1$1'); return /^[0-9a-f]{6}$/.test(h) ? h : undefined; }
    if (s.t === 's') { var str = String(v).replace(/[\u0000-\u001f]/g, '').slice(0, s.max); return str; }
    return undefined;
  }
  F.validate = validate;

  F.S = Object.assign({}, F.DEF);
  F.parseQuery = function (q) {
    var out = {};
    var p;
    try { p = new URLSearchParams(q); } catch (e) { return out; }
    F.KEYS.forEach(function (k) { if (p.has(k)) { var v = validate(k, p.get(k)); if (v !== undefined) out[k] = v; } });
    return out;
  };
  F.toQuery = function (s) {
    var p = new URLSearchParams();
    F.KEYS.forEach(function (k) { p.set(k, String(s[k])); });
    return p.toString();
  };
  F.shareURL = function (s) {
    return location.origin + location.pathname + '?' + F.toQuery(s || F.S);
  };

  var subs = [];
  F.on = function (fn) { subs.push(fn); };
  var urlTimer = null;
  var touched = !!location.search;
  F.set = function (patch, opts) {
    opts = opts || {};
    var changed = [];
    Object.keys(patch).forEach(function (k) {
      var v = validate(k, patch[k]);
      if (v !== undefined && F.S[k] !== v) { F.S[k] = v; changed.push(k); }
    });
    if (!changed.length && !opts.force) return;
    if (changed.length) touched = true;
    var arg = (opts.force && !changed.length) ? null : changed;
    subs.forEach(function (fn) { try { fn(F.S, arg, opts); } catch (e) { if (window.console) console.warn(e); } });
    clearTimeout(urlTimer);
    urlTimer = setTimeout(F.writeURL, 220);
  };
  F.writeURL = function () {
    if (touched) {
      var url = '?' + F.toQuery(F.S) + location.hash;
      try { history.replaceState(null, '', url); } catch (e) { /* file:// or sandbox */ }
    }
    var peek = F.$('urlPeek'); if (peek) peek.textContent = F.shareURL();
  };

  /* ---------- local history (drawer) ---------- */
  var HKEY = 'foundry.drawer.v1';
  F.hist = {
    all: function () {
      try { var a = JSON.parse(localStorage.getItem(HKEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
    },
    save: function (list) {
      try { localStorage.setItem(HKEY, JSON.stringify(list.slice(0, 24))); return true; } catch (e) { return false; }
    },
    add: function (name) {
      var list = F.hist.all();
      var q = F.toQuery(F.S);
      list = list.filter(function (x) { return x.q !== q; });
      list.unshift({ id: Date.now().toString(36), name: name, q: q, at: Date.now() });
      return F.hist.save(list);
    },
    remove: function (id) { F.hist.save(F.hist.all().filter(function (x) { return x.id !== id; })); },
    clear: function () { try { localStorage.removeItem(HKEY); } catch (e) { } }
  };

  /* ---------- clipboard ---------- */
  F.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return legacy(); });
    }
    return Promise.resolve(legacy());
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta); return ok;
    }
  };
  F.download = function (name, blobOrText, type) {
    var blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type: type || 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };

  /* ---------- toast ---------- */
  var toastT = null;
  F.toast = function (msg) {
    var t = F.$('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2800);
  };

  /* ---------- audio (synthesized, muted until enabled) ---------- */
  F.audio = (function () {
    var ctx = null, on = false, last = 0;
    function ensure() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (e) { return null; }
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function noise(c, dur) {
      var len = Math.max(1, Math.floor(c.sampleRate * dur));
      var b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      var s = c.createBufferSource(); s.buffer = b; return s;
    }
    function env(c, g, t, a, peak, dec) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    }
    var sounds = {
      /* the platen hitting paper: low thud + paper slap */
      press: function (c, t) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
        env(c, g, t, 0.004, 0.5, 0.2); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.25);
        var n = noise(c, 0.08), f = c.createBiquadFilter(), g2 = c.createGain();
        f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
        env(c, g2, t, 0.002, 0.35, 0.07); n.connect(f).connect(g2).connect(c.destination); n.start(t);
      },
      tick: function (c, t) {
        var n = noise(c, 0.02), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'highpass'; f.frequency.value = 3000;
        env(c, g, t, 0.001, 0.12, 0.02); n.connect(f).connect(g).connect(c.destination); n.start(t);
      },
      ding: function (c, t) {
        [1318.5, 1975.5, 2637].forEach(function (fr, i) {
          var o = c.createOscillator(), g = c.createGain();
          o.type = 'sine'; o.frequency.value = fr;
          env(c, g, t, 0.003, 0.18 / (i + 1), 1.1 - i * 0.25); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 1.3);
        });
      },
      buzz: function (c, t) {
        var o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.linearRampToValueAtTime(90, t + 0.25);
        f.type = 'lowpass'; f.frequency.value = 900;
        env(c, g, t, 0.01, 0.16, 0.28); o.connect(f).connect(g).connect(c.destination); o.start(t); o.stop(t + 0.35);
      },
      swish: function (c, t) {
        var n = noise(c, 0.3), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(4000, t + 0.25);
        env(c, g, t, 0.03, 0.18, 0.25); n.connect(f).connect(g).connect(c.destination); n.start(t);
      }
    };
    return {
      isOn: function () { return on; },
      set: function (v) { on = !!v; if (on) ensure(); },
      unlock: function () { if (on) ensure(); },
      play: function (name) {
        if (!on) return;
        var c = ensure(); if (!c || !sounds[name]) return;
        var now = performance.now();
        if (name === 'tick' && now - last < 45) return;
        last = now;
        try { sounds[name](c, c.currentTime + 0.005); } catch (e) { }
      }
    };
  })();
})();
