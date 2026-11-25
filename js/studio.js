/* Foundry — Pairing Studio + Type Scale */
(function () {
  'use strict';
  var F = window.F, $ = F.$;

  var CAT_ORDER = ['Serif', 'Sans', 'Slab', 'Display', 'Mono', 'System'];
  var CAT_LABEL = { Serif: 'Serif (web)', Sans: 'Sans (web)', Slab: 'Slab (web)', Display: 'Display (web)', Mono: 'Mono (web)', System: 'System stacks — offline friendly' };

  function fillSelect(sel) {
    var html = '';
    CAT_ORDER.forEach(function (cat) {
      var items = F.FONTS.filter(function (f) { return f.cat === cat; });
      if (!items.length) return;
      html += '<optgroup label="' + CAT_LABEL[cat] + '">';
      items.forEach(function (f) { html += '<option value="' + f.id + '">' + F.esc(f.name) + '</option>'; });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  }

  var SLIDERS = [
    { id: 'hw', fmt: function (v) { return String(v); } },
    { id: 'bw', fmt: function (v) { return String(v); } },
    { id: 'ht', fmt: function (v) { return (v / 100).toFixed(2) + 'em'; } },
    { id: 'bt', fmt: function (v) { return (v / 100).toFixed(2) + 'em'; } },
    { id: 'hl', fmt: function (v) { return (v / 100).toFixed(2); } },
    { id: 'lh', fmt: function (v) { return (v / 100).toFixed(2); } },
    { id: 'sz', fmt: function (v) { return v + 'px'; } }
  ];

  function paintRange(el) {
    var min = +el.min, max = +el.max, v = +el.value;
    var pct = max > min ? ((v - min) / (max - min)) * 100 : 100;
    el.style.setProperty('--pct', pct + '%');
  }

  function bindSliders() {
    SLIDERS.forEach(function (s) {
      var el = $(s.id);
      el.addEventListener('input', function () {
        var patch = {}; patch[s.id] = +el.value; F.set(patch);
        paintRange(el); F.audio.play('tick');
      });
    });
  }

  function syncWeightSlider(key, fontId) {
    var f = F.font(fontId), el = $(key), out = $(key + 'Out');
    el.min = f.min; el.max = f.max;
    var single = f.min === f.max;
    el.disabled = single;
    var w = F.weightFor(fontId, F.S[key]);
    el.value = w;
    out.textContent = single ? w + ' · single weight' : String(w);
    paintRange(el);
  }

  function renderControls(S) {
    $('hFont').value = S.h; $('bFont').value = S.b;
    SLIDERS.forEach(function (s) {
      if (s.id === 'hw' || s.id === 'bw') return;
      var el = $(s.id); el.value = S[s.id]; $(s.id + 'Out').textContent = s.fmt(S[s.id]); paintRange(el);
    });
    syncWeightSlider('hw', S.h); syncWeightSlider('bw', S.b);
    if (document.activeElement !== $('headText')) $('headText').value = S.t;
    $('italicT').checked = S.it === '1';
    $('upperT').checked = S.up === '1';
    var rs = $('ratioSel'); if (rs.value !== S.r) rs.value = S.r;
    var btns = $('pairList').querySelectorAll('button');
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.h === S.h && b.dataset.b === S.b)); });
  }

  F.applyVars = function (el, S) {
    el.style.setProperty('--sh-f', F.family(S.h));
    el.style.setProperty('--sb-f', F.family(S.b));
    el.style.setProperty('--sh-w', F.weightFor(S.h, S.hw));
    el.style.setProperty('--sb-w', F.weightFor(S.b, S.bw));
    el.style.setProperty('--sh-t', (S.ht / 100) + 'em');
    el.style.setProperty('--sb-t', (S.bt / 100) + 'em');
    el.style.setProperty('--sh-l', S.hl / 100);
    el.style.setProperty('--sb-l', S.lh / 100);
    el.style.setProperty('--sz', S.sz + 'px');
    el.style.setProperty('--sp-fg', '#' + S.fg);
    el.style.setProperty('--sp-bg', '#' + S.bg);
    el.style.setProperty('--sh-i', S.it === '1' ? 'italic' : 'normal');
    el.style.setProperty('--sh-u', S.up === '1' ? 'uppercase' : 'none');
  };

  function renderSpecimen(S, changed) {
    var sp = $('specimen');
    F.applyVars(sp, S);
    $('spHead').textContent = S.t || 'Untitled';
    $('spHeadName').textContent = F.font(S.h).name;
    $('spBodyName').textContent = F.font(S.b).name;
    if (changed && (changed.indexOf('h') >= 0 || changed.indexOf('b') >= 0)) {
      sp.classList.remove('restrike'); void sp.offsetWidth; sp.classList.add('restrike');
    }
  }

  var statusSeq = 0;
  function loadPair(S) {
    var seq = ++statusSeq, st = $('fontStatus');
    var hf = F.font(S.h), bf = F.font(S.b);
    var needs = [hf, bf].filter(function (f) { return !f.stack && F.fontState[f.id] !== 'ok'; });
    if (!needs.length) { st.textContent = hf.name + ' + ' + bf.name + ' — set and ready.'; st.className = 'font-status ok'; return; }
    st.textContent = 'Casting ' + needs.map(function (f) { return f.name; }).join(' & ') + '…';
    st.className = 'font-status loading';
    Promise.all([F.loadFont(S.h), F.loadFont(S.b)]).then(function (r) {
      if (seq !== statusSeq) return;
      if (r[0] && r[1]) { st.textContent = hf.name + ' + ' + bf.name + ' — fresh from the foundry.'; st.className = 'font-status ok'; }
      else {
        st.textContent = 'Couldn’t reach Google Fonts (offline?). Showing the fallback stack — system fonts still work.';
        st.className = 'font-status fail';
      }
      document.dispatchEvent(new CustomEvent('foundry:fonts'));
    });
  }

  function buildPairs() {
    var html = '';
    F.PAIRINGS.forEach(function (p, i) {
      html += '<button type="button" class="pair" data-i="' + i + '" data-h="' + p.h + '" data-b="' + p.b + '" aria-pressed="false">' +
        '<b>' + F.esc(p.name) + '</b><span>' + F.esc(F.font(p.h).name) + ' + ' + F.esc(F.font(p.b).name) + '</span>' +
        '<em>' + F.esc(p.note) + '</em></button>';
    });
    $('pairList').innerHTML = html;
    $('pairList').addEventListener('click', function (e) {
      var b = e.target.closest('button.pair'); if (!b) return;
      var p = F.PAIRINGS[+b.dataset.i];
      F.set({ h: p.h, b: p.b }); F.audio.play('press');
      F.toast('“' + p.name + '” — ' + p.note);
    });
  }

  function shuffle() {
    var heads = F.FONTS.filter(function (f) { return f.cat !== 'Mono'; });
    var h = F.pick(heads);
    var bodies = F.FONTS.filter(function (f) {
      return f.id !== h.id && f.cat !== 'Display' && (f.cat !== h.cat || h.cat === 'System');
    });
    var b = F.pick(bodies);
    F.set({ h: h.id, b: b.id }); F.audio.play('press');
    F.toast(F.pick(['Fresh pairing, hot off the press.', 'The type gods have spoken.', 'Shuffled. Not stirred.', 'A bold choice. We respect it.']));
  }

  /* ---------- scale ---------- */
  var STEP_NAMES = { 6: 'Display', 5: 'H1', 4: 'H2', 3: 'H3', 2: 'H4', 1: 'H5', 0: 'Body', '-1': 'Small', '-2': 'Caption' };
  F.scaleSteps = function (S) {
    var r = parseFloat(S.r), out = [];
    for (var i = 6; i >= -2; i--) out.push({ i: i, name: STEP_NAMES[i], px: S.sz * Math.pow(r, i) });
    return out;
  };
  function renderScale(S) {
    var list = $('scaleList');
    F.applyVars(list, S);
    var txt = F.esc($('scaleText').value || 'The quick brown fox');
    var steps = F.scaleSteps(S), max = steps[0].px, html = '';
    steps.forEach(function (st, k) {
      var head = st.i > 0;
      html += '<li class="sc-row' + (head ? ' is-head' : '') + '" style="--d:' + (k * 40) + 'ms">' +
        '<div class="sc-meta"><b>' + st.name + '</b><span>' + st.px.toFixed(1) + 'px</span><span>' + (st.px / 16).toFixed(3) + 'rem</span></div>' +
        '<div class="sc-bar" aria-hidden="true"><i style="width:' + (st.px / max * 100).toFixed(1) + '%"></i></div>' +
        '<p class="sc-sample" style="font-size:' + st.px.toFixed(2) + 'px">' + txt + '</p></li>';
    });
    list.innerHTML = html;
  }

  F.initStudio = function () {
    fillSelect($('hFont')); fillSelect($('bFont'));
    var rs = $('ratioSel');
    rs.innerHTML = F.RATIOS.map(function (r) { return '<option value="' + r.v + '">' + r.n + ' — ' + r.v + '</option>'; }).join('');
    buildPairs(); bindSliders();

    $('hFont').addEventListener('change', function () { F.set({ h: this.value }); F.audio.play('press'); });
    $('bFont').addEventListener('change', function () { F.set({ b: this.value }); F.audio.play('press'); });
    $('shuffleBtn').addEventListener('click', shuffle);
    $('swapFonts').addEventListener('click', function () { F.set({ h: F.S.b, b: F.S.h }); F.audio.play('swish'); });
    $('headText').addEventListener('input', function () { F.set({ t: this.value }); });
    $('italicT').addEventListener('change', function () { F.set({ it: this.checked ? '1' : '0' }); F.audio.play('tick'); });
    $('upperT').addEventListener('change', function () { F.set({ up: this.checked ? '1' : '0' }); F.audio.play('tick'); });
    rs.addEventListener('change', function () { F.set({ r: this.value }); F.audio.play('press'); });
    $('scaleText').addEventListener('input', function () { renderScale(F.S); });

    F.on(function (S, changed) {
      renderControls(S); renderSpecimen(S, changed);
      if (!changed || changed.some(function (k) { return 'h b hw bw ht bt hl lh sz r fg bg up it'.indexOf(k) >= 0; })) renderScale(S);
      if (!changed || changed.indexOf('h') >= 0 || changed.indexOf('b') >= 0) loadPair(S);
    });
  };
})();
