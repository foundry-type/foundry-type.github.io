/* Foundry — specimen posters on canvas (with letterpress ink distress) */
(function () {
  'use strict';
  var F = window.F, $ = F.$;

  /* ---------- colour math (shared) ---------- */
  F.hexRgb = function (h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  F.lum = function (hex) {
    var c = F.hexRgb(hex).map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  F.ratio = function (a, b) {
    var l1 = F.lum(a), l2 = F.lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  var W = 900, H = 1200;
  var cv, ctx, ink, ictx, mask, paper;
  var seed = 7, invert = false, animating = false, visible = true, raf = 0, lastT = 0;

  function rng(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function buildTextures() {
    var r = rng(seed);
    /* distress mask: specks + worn edges where ink did not take */
    mask = document.createElement('canvas'); mask.width = W; mask.height = H;
    var m = mask.getContext('2d');
    var n = F.lowPower ? 1400 : 3200;
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = r() * H, rad = r() * r() * 2.6 + 0.3;
      m.globalAlpha = 0.25 + r() * 0.6;
      m.beginPath(); m.arc(x, y, rad, 0, Math.PI * 2); m.fill();
    }
    /* a few long worn scratches */
    m.globalAlpha = 0.25; m.lineWidth = 1;
    for (var j = 0; j < 14; j++) {
      m.beginPath(); var sx = r() * W, sy = r() * H; m.moveTo(sx, sy);
      m.quadraticCurveTo(sx + (r() - 0.5) * 200, sy + (r() - 0.5) * 60, sx + (r() - 0.5) * 380, sy + (r() - 0.5) * 30); m.stroke();
    }
    /* paper grain */
    paper = document.createElement('canvas'); paper.width = 300; paper.height = 300;
    var p = paper.getContext('2d'), img = p.createImageData(300, 300), d = img.data;
    for (var k = 0; k < d.length; k += 4) {
      var v = 128 + (r() - 0.5) * 90;
      d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 40;
    }
    p.putImageData(img, 0, 0);
    /* fibres */
    p.strokeStyle = 'rgba(80,60,40,.10)';
    for (var q = 0; q < 50; q++) { p.beginPath(); var fx = r() * 300, fy = r() * 300; p.moveTo(fx, fy); p.lineTo(fx + (r() - 0.5) * 30, fy + (r() - 0.5) * 30); p.stroke(); }
  }

  function fontStr(id, w, px, italic) {
    return (italic ? 'italic ' : '') + F.weightFor(id, w) + ' ' + Math.round(px) + 'px ' + F.family(id);
  }

  function tracked(c, text, x, y, em, px, align) {
    var sp = em * px;
    if (!sp) { c.textAlign = align || 'left'; c.fillText(text, x, y); return c.measureText(text).width; }
    var chars = Array.from(text), ws = chars.map(function (ch) { return c.measureText(ch).width; });
    var total = ws.reduce(function (a, b) { return a + b; }, 0) + sp * Math.max(0, chars.length - 1);
    var sx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    c.textAlign = 'left';
    chars.forEach(function (ch, i) { c.fillText(ch, sx, y); sx += ws[i] + sp; });
    return total;
  }
  function trackedWidth(c, text, em, px) {
    var w = c.measureText(text).width; return w + em * px * Math.max(0, Array.from(text).length - 1);
  }
  function fit(c, text, maxW, startPx, mk, em) {
    var px = startPx;
    for (var i = 0; i < 40; i++) {
      c.font = mk(px);
      if (trackedWidth(c, text, em, px) <= maxW) break;
      px *= 0.93;
    }
    return px;
  }
  function wrap(c, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  var BODY = 'Type is a beautiful group of letters, not a group of beautiful letters. Set it with care, give it room to breathe, and it will carry any idea to any reader. This specimen was composed in Foundry, printed on imaginary paper and inked with entirely real enthusiasm.';

  function colours(S) {
    var fg = '#' + S.fg, bg = '#' + S.bg;
    if (invert) { var t = fg; fg = bg; bg = t; }
    var accent = '#e4002b';
    if (F.ratio(accent.slice(1), bg.slice(1)) < 1.8 || F.ratio(accent.slice(1), fg.slice(1)) < 1.4) accent = fg;
    return { fg: fg, bg: bg, ac: accent };
  }

  /* ---------- layouts: draw ink onto c (transparent), decorations ---------- */
  var L = {};
  L.zurich = function (c, S, col, t) {
    var head = (S.up === '1' ? S.t.toUpperCase() : S.t) || 'Foundry';
    var it = S.it === '1', em = S.ht / 100;
    /* grid */
    c.strokeStyle = col.fg; c.globalAlpha = 0.12; c.lineWidth = 1;
    for (var g = 0; g <= 12; g++) { var gx = 60 + g * 65; c.beginPath(); c.moveTo(gx, 40); c.lineTo(gx, H - 40); c.stroke(); }
    c.globalAlpha = 1;
    /* loud circle */
    c.fillStyle = col.ac;
    var cx = 660 + Math.sin(t * 0.8) * 40, cy = 300 + Math.cos(t * 0.6) * 25;
    c.beginPath(); c.arc(cx, cy, 190, 0, Math.PI * 2); c.fill();
    /* stacked headline */
    c.fillStyle = col.fg; c.textBaseline = 'alphabetic';
    var words = head.split(/\s+/).filter(Boolean);
    if (words.length === 1 && words[0].length > 6) { var w0 = words[0], mid = Math.ceil(w0.length / 2); words = [w0.slice(0, mid), w0.slice(mid)]; }
    var y = 230;
    words = words.slice(0, 4);
    var cap = Math.min(300, 600 / Math.max(1, words.length));
    words.forEach(function (w, i) {
      var px = fit(c, w, 780, cap, function (p) { return fontStr(S.h, S.hw, p, it); }, em);
      px = Math.min(px, cap);
      c.font = fontStr(S.h, S.hw, px, it);
      var off = Math.sin(t * 1.4 + i) * 6;
      y += i === 0 ? px * 0.8 : px * (S.hl / 100) * 0.92;
      tracked(c, w, 60 + off, y, em, px, 'left');
    });
    /* rule + meta */
    var ry = Math.max(y + 60, 820);
    c.fillRect(60, ry, 780, 6);
    c.font = fontStr(S.b, 700, 20, false);
    c.fillText('HEADING', 60, ry + 44); c.fillText('BODY', 320, ry + 44); c.fillText('SCALE', 580, ry + 44);
    c.font = fontStr(S.b, S.bw, 20, false);
    c.fillText(F.font(S.h).name + ' ' + F.weightFor(S.h, S.hw), 60, ry + 72);
    c.fillText(F.font(S.b).name + ' ' + F.weightFor(S.b, S.bw), 320, ry + 72);
    c.fillText('× ' + S.r + ' from ' + S.sz + 'px', 580, ry + 72);
    /* body columns */
    c.font = fontStr(S.b, S.bw, 19, false);
    var lines = wrap(c, BODY, 370), lh = 19 * (S.lh / 100), by = ry + 120;
    var half = Math.ceil(lines.length / 2);
    lines.forEach(function (ln, i) {
      var colX = i < half ? 60 : 470, rowY = by + (i < half ? i : i - half) * lh;
      if (rowY < H - 70) c.fillText(ln, colX, rowY);
    });
    /* vertical label */
    c.save(); c.translate(870, 60); c.rotate(Math.PI / 2);
    c.font = fontStr(S.b, 600, 16, false); c.fillText('FOUNDRY TYPE SPECIMEN — Nº ' + String(seed % 100).padStart(2, '0'), 0, 0);
    c.restore();
  };

  L.press = function (c, S, col, t) {
    var head = (S.up === '1' ? S.t.toUpperCase() : S.t) || 'Foundry';
    var it = S.it === '1', em = S.ht / 100;
    c.strokeStyle = col.fg; c.fillStyle = col.fg;
    c.lineWidth = 6; c.strokeRect(40, 40, W - 80, H - 80);
    c.lineWidth = 1.5; c.strokeRect(58, 58, W - 116, H - 116);
    c.textBaseline = 'alphabetic';
    c.font = fontStr(S.b, 600, 22, false);
    tracked(c, 'A SPECIMEN OF PRINTING TYPE', W / 2, 140, 0.3, 22, 'center');
    /* ornament diamonds */
    function diamonds(y) {
      for (var i = -2; i <= 2; i++) { c.save(); c.translate(W / 2 + i * 34, y); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore(); }
      c.fillRect(110, y - 1, 230, 2); c.fillRect(W - 340, y - 1, 230, 2);
    }
    diamonds(185);
    var px = Math.min(260, fit(c, head, 720, 260, function (p) { return fontStr(S.h, S.hw, p, it); }, em));
    c.font = fontStr(S.h, S.hw, px, it);
    var bob = Math.sin(t) * 3;
    tracked(c, head, W / 2, 260 + px * 0.8 + bob, em, px, 'center');
    var y = 300 + px * 0.95;
    c.font = 'italic ' + F.weightFor(S.b, S.bw) + ' 26px ' + F.family(S.b);
    c.textAlign = 'center';
    c.fillText(F.font(S.h).name + ' & ' + F.font(S.b).name, W / 2, y);
    diamonds(y + 46);
    c.font = fontStr(S.b, S.bw, 20, false);
    var lines = wrap(c, BODY, 620), lh = 20 * (S.lh / 100), by = y + 110;
    lines.forEach(function (ln, i) { c.fillText(ln, W / 2, by + i * lh); });
    var ay = by + lines.length * lh + 70;
    var rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '0123456789 &?!'];
    rows.forEach(function (rw, i) {
      var rp = Math.min(56, fit(c, rw, 700, 56, function (p) { return fontStr(S.h, S.hw, p, it); }, 0.04));
      c.font = fontStr(S.h, S.hw, rp, it);
      if (ay + i * 70 < H - 110) tracked(c, rw, W / 2, ay + i * 70, 0.04, rp, 'center');
    });
    c.font = fontStr(S.b, 600, 16, false);
    tracked(c, 'CAST AT THE FOUNDRY · PRINTED BY HAND · NO KERNS WERE HARMED', W / 2, H - 82, 0.12, 16, 'center');
  };

  L.glyph = function (c, S, col, t) {
    var head = S.t || 'Foundry';
    var first = Array.from(head.trim() || 'A')[0];
    var pair = first.toUpperCase() + first.toLowerCase();
    if (pair[0] === pair[1]) pair = first + 'a';
    var it = S.it === '1';
    c.textBaseline = 'alphabetic';
    c.save();
    c.translate(W * 0.52, H * 0.74); c.rotate(-0.05 + Math.sin(t * 0.5) * 0.03);
    c.font = fontStr(S.h, S.hw, 820, it); c.fillStyle = col.ac; c.textAlign = 'center';
    c.fillText(pair, 30, 0);
    c.restore();
    c.fillStyle = col.fg;
    var name = F.font(S.h).name;
    var px = Math.min(110, fit(c, name, 780, 110, function (p) { return fontStr(S.h, S.hw, p, it); }, 0));
    c.font = fontStr(S.h, S.hw, px, it); c.textAlign = 'left';
    c.fillText(name, 60, 60 + px);
    var f = F.font(S.h);
    c.font = fontStr(S.b, 600, 18, false);
    c.fillText(f.cat.toUpperCase() + ' · WEIGHTS ' + f.min + '–' + f.max + (f.stack ? ' · SYSTEM STACK' : ' · WEB FONT'), 60, 100 + px);
    /* weight ladder */
    var steps = f.max > f.min ? 5 : 1;
    for (var i = 0; i < steps; i++) {
      var w = steps === 1 ? f.min : Math.round(f.min + (f.max - f.min) * i / (steps - 1));
      c.font = fontStr(S.h, w, 40, it);
      c.fillText('Rag ' + w, 60, 190 + px + i * 52);
    }
    /* footer strip */
    c.fillRect(0, H - 150, W, 150);
    c.fillStyle = col.bg;
    c.font = fontStr(S.b, S.bw, 24, false);
    c.fillText('abcdefghijklmnopqrstuvwxyz 0123456789', 60, H - 92);
    c.font = fontStr(S.b, 700, 16, false);
    c.fillText('BIG GLYPH · SET WITH ' + F.font(S.b).name.toUpperCase(), 60, H - 52);
  };

  L.fall = function (c, S, col, t) {
    var head = (S.up === '1' ? S.t.toUpperCase() : S.t) || 'Foundry';
    var it = S.it === '1';
    var steps = F.scaleSteps(S);
    c.fillStyle = col.fg; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    c.font = fontStr(S.b, 700, 18, false);
    c.fillText('WATERFALL — ' + F.font(S.h).name.toUpperCase() + ' — RATIO ' + S.r, 60, 80);
    c.fillRect(60, 96, 780, 3);
    var sum = steps.reduce(function (a, st) { return a + st.px * 1.08; }, 0);
    var k = Math.min(2.1, (H - 320) / sum), y = 110;
    steps.forEach(function (st, i) {
      var px = Math.max(9, st.px * k);
      var face = st.i > 0 ? fontStr(S.h, S.hw, px, it) : fontStr(S.b, S.bw, px, false);
      c.font = face;
      var em = (st.i > 0 ? S.ht / 100 : S.bt / 100) + Math.sin(t * 1.2 + i * 0.6) * 0.015;
      y += px * 1.08 + 10;
      if (y > H - 90) return;
      c.save(); c.beginPath(); c.rect(150, y - px * 1.2, 700, px * 1.6); c.clip();
      tracked(c, head + ' — ' + head, 150, y, em, px, 'left');
      c.restore();
      c.font = fontStr(S.b, 600, 14, false);
      c.fillText(st.name, 60, y - 4);
      c.globalAlpha = 0.6; c.fillText(st.px.toFixed(1) + 'px', 60, y + 14); c.globalAlpha = 1;
    });
    c.fillRect(60, H - 80, 780, 3);
    c.font = fontStr(S.b, S.bw, 16, false);
    c.fillText('Each line is the one below it × ' + S.r + '. Music, but for headings.', 60, H - 48);
  };

  var CAPTIONS = {
    zurich: 'Zürich Grid — strict columns, one loud circle.',
    press: 'Letterpress — centred, ornamented, gloriously imperfect ink.',
    glyph: 'Big Glyph — one letter, enormous, unapologetic.',
    fall: 'Waterfall — your type scale, cascading.'
  };

  function draw(t) {
    var S = F.S, col = colours(S);
    ictx.setTransform(1, 0, 0, 1, 0, 0);
    ictx.globalCompositeOperation = 'source-over'; ictx.globalAlpha = 1;
    ictx.clearRect(0, 0, W, H);
    L[S.p](ictx, S, col, t);
    /* distress ink */
    ictx.globalCompositeOperation = 'destination-out';
    ictx.globalAlpha = S.p === 'press' ? 0.9 : 0.45;
    ictx.drawImage(mask, 0, 0);
    ictx.globalCompositeOperation = 'source-over'; ictx.globalAlpha = 1;
    /* compose */
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.16; ctx.drawImage(ink, 0.9, 0.7); /* faint double impression */
    ctx.globalAlpha = 1; ctx.drawImage(ink, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5;
    var pat = ctx.createPattern(paper, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  var seq = 0;
  function render(withPress) {
    var S = F.S, my = ++seq;
    $('posterCaption').textContent = CAPTIONS[S.p];
    var tabs = $('posterTabs').querySelectorAll('button');
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.p === S.p)); b.tabIndex = b.dataset.p === S.p ? 0 : -1; });
    var faces = [F.ensureFace(S.h, F.weightFor(S.h, S.hw), S.it === '1'), F.ensureFace(S.b, F.weightFor(S.b, S.bw), false), F.ensureFace(S.b, F.weightFor(S.b, 700), false), F.ensureFace(S.b, F.weightFor(S.b, S.bw), true)];
    Promise.all(faces).then(function (r) {
      if (my !== seq) return;
      draw(lastT);
      cv.setAttribute('aria-label', 'Specimen poster: ' + CAPTIONS[S.p] + ' Heading ' + F.font(S.h).name + ', body ' + F.font(S.b).name + '.' + (r[0] && r[1] ? '' : ' (fallback fonts)'));
      if (withPress && !F.reduced()) {
        var fr = $('posterFrame'); fr.classList.remove('printing'); void fr.offsetWidth; fr.classList.add('printing');
      }
    });
  }

  function loop(ts) {
    raf = 0;
    if (!animating || !visible) return;
    lastT = ts / 1000;
    draw(lastT);
    raf = requestAnimationFrame(loop);
  }
  function setAnim(v) {
    animating = v;
    $('posterAnim').setAttribute('aria-pressed', String(v));
    $('posterAnim').textContent = v ? 'Stop the press' : 'Animate poster';
    if (v && !raf) raf = requestAnimationFrame(loop);
  }

  var pending = null;
  F.initPosters = function () {
    cv = $('posterCanvas'); ctx = cv.getContext('2d');
    ink = document.createElement('canvas'); ink.width = W; ink.height = H; ictx = ink.getContext('2d');
    buildTextures();

    $('posterTabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-p]'); if (!b) return;
      F.set({ p: b.dataset.p }); F.audio.play('press');
    });
    $('posterTabs').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var ids = ['zurich', 'press', 'glyph', 'fall'], i = ids.indexOf(F.S.p);
      i = (i + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
      F.set({ p: ids[i] });
      var nb = $('posterTabs').querySelector('[data-p="' + ids[i] + '"]'); if (nb) nb.focus();
    });
    $('posterPng').addEventListener('click', function () {
      draw(lastT);
      if (cv.toBlob) cv.toBlob(function (b) { if (b) { F.download('foundry-poster-' + F.S.p + '.png', b); F.toast('Poster pulled. Frame it, or at least fridge-magnet it.'); } }, 'image/png');
      F.audio.play('press');
    });
    $('posterAnim').addEventListener('click', function () {
      if (F.reduced() && !animating) { F.toast('Reduced motion is on — the press stays still. Respect.'); return; }
      setAnim(!animating); F.audio.play('tick');
    });
    $('posterInvert').addEventListener('click', function () { invert = !invert; render(true); F.audio.play('swish'); });
    $('posterReprint').addEventListener('click', function () { seed = (seed * 7 + 13) % 9973; buildTextures(); render(true); F.audio.play('press'); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && animating && !raf) raf = requestAnimationFrame(loop);
      }).observe(cv);
    }
    document.addEventListener('foundry:fonts', function () { render(false); });

    F.on(function (S, changed) {
      var relevant = !changed || changed.some(function (k) { return k !== 'th'; });
      if (!relevant) return;
      clearTimeout(pending);
      var press = !changed || changed.indexOf('p') >= 0 || changed.indexOf('h') >= 0 || changed.indexOf('b') >= 0;
      pending = setTimeout(function () { render(press); }, animating ? 0 : 60);
    });
  };
})();
