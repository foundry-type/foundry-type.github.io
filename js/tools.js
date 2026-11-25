/* Foundry — contrast checker, CSS export, type drawer (history), timeline */
(function () {
  'use strict';
  var F = window.F, $ = F.$;

  /* ================= CONTRAST ================= */
  function rgbHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
    }
    return [h, s, l];
  }
  function hslHex(h, s, l) {
    function f(n) {
      var k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l);
      var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(c * 255).toString(16).padStart(2, '0');
    }
    return f(0) + f(8) + f(4);
  }
  function fixColour(fg, bg, target) {
    var rgb = F.hexRgb(fg), hsl = rgbHsl(rgb[0], rgb[1], rgb[2]);
    var darker = F.lum(bg) > 0.18;
    var l = hsl[2];
    for (var i = 0; i < 101; i++) {
      var hex = hslHex(hsl[0], hsl[1], F.clamp(l, 0, 1));
      if (F.ratio(hex, bg) >= target) return hex;
      l += darker ? -0.01 : 0.01;
    }
    return darker ? '000000' : 'ffffff';
  }

  function renderContrast(S) {
    var r = F.ratio(S.fg, S.bg);
    var card = $('cPreview');
    card.style.setProperty('--sp-fg', '#' + S.fg);
    card.style.setProperty('--sp-bg', '#' + S.bg);
    card.style.setProperty('--sh-f', F.family(S.h));
    card.style.setProperty('--sb-f', F.family(S.b));
    card.style.setProperty('--sh-w', F.weightFor(S.h, S.hw));
    $('ratioOut').textContent = (Math.floor(r * 100) / 100).toFixed(2);
    var verdict = r >= 7 ? 'Crisp as a fresh proof. AAA all round.' :
      r >= 4.5 ? 'Solid AA. Readers approve.' :
        r >= 3 ? 'Only OK for big type. Body text will squint.' :
          'Too faint. This is a whisper in a thunderstorm.';
    $('ratioVerdict').textContent = verdict;
    var tests = { bAAn: 4.5, bAAl: 3, bAAAn: 7, bAAAl: 4.5, bUI: 3 };
    Object.keys(tests).forEach(function (id) {
      var ok = r >= tests[id], li = $(id);
      li.className = ok ? 'pass' : 'fail';
      li.setAttribute('aria-label', li.textContent.replace(/\s+/g, ' ').trim() + (ok ? ' — pass' : ' — fail'));
    });
    if (document.activeElement !== $('fgHex')) $('fgHex').value = '#' + S.fg;
    if (document.activeElement !== $('bgHex')) $('bgHex').value = '#' + S.bg;
    $('fgPick').value = '#' + S.fg; $('bgPick').value = '#' + S.bg;
    $('palettes').querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.fg === S.fg && b.dataset.bg === S.bg));
    });
  }

  function initContrast() {
    $('palettes').innerHTML = F.PALETTES.map(function (p) {
      return '<button type="button" class="pal" data-fg="' + p.fg + '" data-bg="' + p.bg + '" aria-pressed="false" style="--a:#' + p.fg + ';--b:#' + p.bg + '">' +
        '<i aria-hidden="true">Aa</i><span>' + F.esc(p.n) + '</span></button>';
    }).join('');
    $('palettes').addEventListener('click', function (e) {
      var b = e.target.closest('button.pal'); if (!b) return;
      F.set({ fg: b.dataset.fg, bg: b.dataset.bg }); F.audio.play('press');
      if (b.dataset.fg === 'b8b3a8') F.toast('“Too Subtle” is here as a cautionary tale. Try Fix for AA.');
    });
    $('fgPick').addEventListener('input', function () { F.set({ fg: this.value }); });
    $('bgPick').addEventListener('input', function () { F.set({ bg: this.value }); });
    $('fgHex').addEventListener('input', function () { var v = F.validate('fg', this.value); if (v && this.value.replace('#', '').length >= 6) F.set({ fg: v }); });
    $('bgHex').addEventListener('input', function () { var v = F.validate('bg', this.value); if (v && this.value.replace('#', '').length >= 6) F.set({ bg: v }); });
    ['fgHex', 'bgHex'].forEach(function (id) {
      $(id).addEventListener('blur', function () { this.value = '#' + F.S[id === 'fgHex' ? 'fg' : 'bg']; });
    });
    $('swapColors').addEventListener('click', function () { F.set({ fg: F.S.bg, bg: F.S.fg }); F.audio.play('swish'); });
    $('fixBtn').addEventListener('click', function () {
      var r = F.ratio(F.S.fg, F.S.bg);
      if (r >= 4.5) { F.toast('Already passes AA. Nothing to fix — go have a biscuit.'); F.audio.play('ding'); return; }
      var nf = fixColour(F.S.fg, F.S.bg, 4.5);
      F.set({ fg: nf }); F.audio.play('ding');
      F.toast('Ink adjusted to #' + nf + ' — ' + F.ratio(nf, F.S.bg).toFixed(2) + ':1. Same hue, more backbone.');
    });
    F.on(function (S, ch) { if (!ch || ch.some(function (k) { return 'fg bg h b hw'.split(' ').indexOf(k) >= 0; })) renderContrast(S); });
  }

  /* ================= EXPORT ================= */
  var exMode = 'css';
  function rem(px) { return +(px / 16).toFixed(4) + 'rem'; }
  function clampFor(px) {
    var min = px * 0.82, max = px, vmin = 360, vmax = 1280;
    var slope = (max - min) / (vmax - vmin), inter = min - slope * vmin;
    return 'clamp(' + rem(min) + ', ' + rem(inter) + ' + ' + +(slope * 100).toFixed(4) + 'vw, ' + rem(max) + ')';
  }
  function cssText(S) {
    var hf = F.font(S.h), bf = F.font(S.b), fluid = $('fluidT').checked;
    var url = F.gURL([S.h, S.b]);
    var steps = F.scaleSteps(S);
    var L = [];
    L.push('/* ' + 'Foundry export — ' + hf.name + ' + ' + bf.name + ' */');
    L.push('/* Reopen this design: ' + F.shareURL(S) + ' */');
    if (url) L.push("@import url('" + url + "');");
    else L.push('/* System font stacks only — no downloads, works offline. */');
    L.push('');
    L.push(':root {');
    L.push('  --font-heading: ' + F.family(S.h) + ';');
    L.push('  --font-body: ' + F.family(S.b) + ';');
    L.push('  --weight-heading: ' + F.weightFor(S.h, S.hw) + ';');
    L.push('  --weight-body: ' + F.weightFor(S.b, S.bw) + ';');
    L.push('  --tracking-heading: ' + (S.ht / 100) + 'em;');
    L.push('  --tracking-body: ' + (S.bt / 100) + 'em;');
    L.push('  --leading-heading: ' + (S.hl / 100) + ';');
    L.push('  --leading-body: ' + (S.lh / 100) + ';');
    L.push('  --color-ink: #' + S.fg + ';');
    L.push('  --color-paper: #' + S.bg + ';');
    L.push('  /* type scale: ' + S.sz + 'px × ' + S.r + ' */');
    steps.slice().reverse().forEach(function (st) {
      L.push('  --step-' + (st.i < 0 ? 'n' + (-st.i) : st.i) + ': ' + (fluid ? clampFor(st.px) : rem(st.px)) + '; /* ' + st.name + ' · ' + st.px.toFixed(1) + 'px */');
    });
    L.push('}');
    L.push('');
    L.push('body {');
    L.push('  font-family: var(--font-body);');
    L.push('  font-weight: var(--weight-body);');
    L.push('  font-size: var(--step-0);');
    L.push('  line-height: var(--leading-body);');
    L.push('  letter-spacing: var(--tracking-body);');
    L.push('  color: var(--color-ink);');
    L.push('  background: var(--color-paper);');
    L.push('  text-rendering: optimizeLegibility;');
    L.push('  font-kerning: normal;');
    L.push('}');
    L.push('');
    L.push('h1, h2, h3, h4, h5, .display {');
    L.push('  font-family: var(--font-heading);');
    L.push('  font-weight: var(--weight-heading);');
    L.push('  line-height: var(--leading-heading);');
    L.push('  letter-spacing: var(--tracking-heading);');
    if (S.it === '1') L.push('  font-style: italic;');
    if (S.up === '1') L.push('  text-transform: uppercase;');
    L.push('  text-wrap: balance;');
    L.push('}');
    L.push('.display { font-size: var(--step-6); }');
    L.push('h1 { font-size: var(--step-5); }');
    L.push('h2 { font-size: var(--step-4); }');
    L.push('h3 { font-size: var(--step-3); }');
    L.push('h4 { font-size: var(--step-2); }');
    L.push('h5 { font-size: var(--step-1); }');
    L.push('small, .small { font-size: var(--step-n1); }');
    L.push('.caption { font-size: var(--step-n2); }');
    L.push('p { max-width: 66ch; }');
    return L.join('\n');
  }
  function jsonText(S) {
    var steps = {};
    F.scaleSteps(S).forEach(function (st) { steps[st.name.toLowerCase()] = { px: +st.px.toFixed(2), rem: +(st.px / 16).toFixed(4) }; });
    return JSON.stringify({
      $schema: 'foundry-tokens/1', share: F.shareURL(S),
      font: {
        heading: { name: F.font(S.h).name, stack: F.family(S.h), weight: F.weightFor(S.h, S.hw), tracking: S.ht / 100 + 'em', leading: S.hl / 100, italic: S.it === '1', uppercase: S.up === '1' },
        body: { name: F.font(S.b).name, stack: F.family(S.b), weight: F.weightFor(S.b, S.bw), tracking: S.bt / 100 + 'em', leading: S.lh / 100 },
        googleFontsUrl: F.gURL([S.h, S.b]) || null
      },
      color: { ink: '#' + S.fg, paper: '#' + S.bg, contrast: +F.ratio(S.fg, S.bg).toFixed(2) },
      scale: { base: S.sz, ratio: +S.r, steps: steps }
    }, null, 2);
  }
  function highlight(code) {
    var e = F.esc(code);
    if (exMode === 'json') return e.replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2');
    return e.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>')
      .replace(/(--[a-z0-9-]+)(?=:)/g, '<span class="k">$1</span>')
      .replace(/(@import)/g, '<span class="a">$1</span>');
  }
  function renderExport(S) {
    var code = exMode === 'css' ? cssText(S) : jsonText(S);
    $('exCode').innerHTML = highlight(code);
    $('exCode').dataset.raw = code;
  }
  function initExport() {
    $('exTabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-x]'); if (!b) return;
      exMode = b.dataset.x;
      $('exTabs').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      renderExport(F.S); F.audio.play('tick');
    });
    $('fluidT').addEventListener('change', function () { renderExport(F.S); F.audio.play('tick'); });
    $('copyCss').addEventListener('click', function () {
      F.copy($('exCode').dataset.raw || '').then(function (ok) {
        F.toast(ok ? 'Copied. Paste responsibly.' : 'Copy blocked — select the code and copy manually.');
        F.audio.play(ok ? 'ding' : 'buzz');
      });
    });
    $('dlCss').addEventListener('click', function () {
      var css = exMode === 'css';
      F.download(css ? 'foundry-type.css' : 'foundry-tokens.json', $('exCode').dataset.raw || '', css ? 'text/css' : 'application/json');
      F.audio.play('press');
    });
    F.on(function (S) { renderExport(S); });
  }

  /* ================= DRAWER (local history) ================= */
  function ago(ts) {
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }
  function renderDrawer() {
    var list = F.hist.all(), ul = $('histList');
    $('histEmpty').hidden = list.length > 0;
    $('clearHist').hidden = list.length === 0;
    ul.innerHTML = list.map(function (it) {
      var st = Object.assign({}, F.DEF, F.parseQuery(it.q));
      return '<li class="hist-card" style="--hb:#' + st.bg + ';--hf:#' + st.fg + ';--hh:' + F.esc(F.family(st.h)) + ';--hbf:' + F.esc(F.family(st.b)) + ';--hw:' + F.weightFor(st.h, st.hw) + '">' +
        '<button type="button" class="hist-open" data-q="' + F.esc(it.q) + '" aria-label="Open design ' + F.esc(it.name) + '">' +
        '<span class="hc-head">' + F.esc(st.t || 'Untitled') + '</span>' +
        '<span class="hc-body">' + F.esc(F.font(st.h).name) + ' + ' + F.esc(F.font(st.b).name) + '</span></button>' +
        '<div class="hc-foot"><b>' + F.esc(it.name) + '</b><span>' + ago(it.at) + '</span>' +
        '<button type="button" class="hc-link" data-q="' + F.esc(it.q) + '" aria-label="Copy link for ' + F.esc(it.name) + '">Link</button>' +
        '<button type="button" class="hc-del" data-id="' + F.esc(it.id) + '" aria-label="Delete ' + F.esc(it.name) + '">×</button></div></li>';
    }).join('');
    /* lazily load the fonts these cards use */
    list.slice(0, 8).forEach(function (it) { var st = F.parseQuery(it.q); if (st.h) F.loadFont(st.h); if (st.b) F.loadFont(st.b); });
  }
  function share() {
    var url = F.shareURL();
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      navigator.share({ title: 'Foundry design', url: url }).catch(function () { });
      return;
    }
    F.copy(url).then(function (ok) { F.toast(ok ? 'Link copied — the whole design is in it.' : 'Copy blocked. The link is in your address bar.'); F.audio.play(ok ? 'ding' : 'buzz'); });
  }
  function initDrawer() {
    $('saveBtn').addEventListener('click', function () {
      var name = ($('saveName').value || '').trim() || (F.font(F.S.h).name + ' & ' + F.font(F.S.b).name);
      if (F.hist.add(name)) { F.toast('Filed under “' + name + '”.'); F.audio.play('press'); $('saveName').value = ''; }
      else F.toast('Storage is full or blocked. Your link still holds the design.');
      renderDrawer();
    });
    $('saveName').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('saveBtn').click(); });
    $('shareBtn').addEventListener('click', share);
    $('resetBtn').addEventListener('click', function () {
      var d = Object.assign({}, F.DEF); d.th = F.S.th;
      F.set(d); F.toast('Back to a clean forme.'); F.audio.play('swish');
    });
    $('clearHist').addEventListener('click', function () {
      if (!window.confirm('Empty the whole drawer? Links you already shared keep working.')) return;
      F.hist.clear(); renderDrawer(); F.toast('Drawer emptied. Minimalism achieved.');
    });
    $('histList').addEventListener('click', function (e) {
      var o = e.target.closest('.hist-open'), d = e.target.closest('.hc-del'), l = e.target.closest('.hc-link');
      if (o) {
        var st = Object.assign({}, F.DEF, F.parseQuery(o.dataset.q)); st.th = F.S.th;
        F.set(st); F.audio.play('press'); F.toast('Design reloaded. Welcome back.');
        var sEl = $('studio'); if (sEl) sEl.scrollIntoView({ behavior: F.reduced() ? 'auto' : 'smooth' });
      } else if (d) { F.hist.remove(d.dataset.id); renderDrawer(); F.audio.play('tick'); }
      else if (l) {
        F.copy(location.origin + location.pathname + '?' + l.dataset.q).then(function (ok) { F.toast(ok ? 'Link copied.' : 'Copy blocked.'); });
      }
    });
    F.shareNow = share;
    renderDrawer();
    window.addEventListener('storage', function (e) { if (e.key === 'foundry.drawer.v1') renderDrawer(); });
  }

  /* ================= TIMELINE ================= */
  var era = 'All';
  function renderTimeline() {
    var items = F.TIMELINE.filter(function (x) { return era === 'All' || x.era === era; });
    $('tlTrack').innerHTML = items.map(function (x, i) {
      return '<li class="tl-card" style="--d:' + (i * 50) + 'ms;--tf:' + F.esc(F.family(x.f)) + '">' +
        '<p class="tl-year">' + F.esc(x.y) + '</p><p class="tl-era">' + F.esc(x.era) + '</p>' +
        '<h3 class="tl-title">' + F.esc(x.t) + '</h3><p class="tl-text">' + F.esc(x.d) + '</p>' +
        '<p class="tl-spec" aria-hidden="true">Aa</p></li>';
    }).join('');
    $('tlTrack').scrollLeft = 0;
    $('tlFilters').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.era === era)); });
  }
  function initTimeline() {
    $('tlFilters').innerHTML = F.ERAS.map(function (e) { return '<button type="button" class="chip-btn" data-era="' + e + '" aria-pressed="false">' + e + '</button>'; }).join('');
    $('tlFilters').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-era]'); if (!b) return;
      era = b.dataset.era; renderTimeline(); F.audio.play('tick');
    });
    function step(dir) {
      var tr = $('tlTrack'), card = tr.querySelector('.tl-card');
      var w = card ? card.getBoundingClientRect().width + 20 : 300;
      tr.scrollBy({ left: dir * w * (window.innerWidth > 900 ? 2 : 1), behavior: F.reduced() ? 'auto' : 'smooth' });
      F.audio.play('swish');
    }
    $('tlPrev').addEventListener('click', function () { step(-1); });
    $('tlNext').addEventListener('click', function () { step(1); });
    $('tlTrack').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    /* lazy-load the web fonts used for the specimen glyphs when the timeline is near */
    var loadAll = function () { F.TIMELINE.forEach(function (x) { F.loadFont(x.f); }); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadAll(); io.disconnect(); } }, { rootMargin: '400px' });
      io.observe($('timeline'));
    } else loadAll();
    renderTimeline();
  }

  F.initTools = function () { initContrast(); initExport(); initDrawer(); initTimeline(); };
})();
