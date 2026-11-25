/* Foundry — Guess the Font */
(function () {
  'use strict';
  var F = window.F, $ = F.$;
  var BEST_KEY = 'foundry.game.best';
  var G = { on: false, round: 0, score: 0, streak: 0, pool: [], used: [], answer: null, locked: false, hinted: false, gen: 0 };

  function best() { try { return +(localStorage.getItem(BEST_KEY) || 0); } catch (e) { return 0; } }
  function setBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { } }
  function hud() {
    $('gameRound').textContent = G.round; $('gameScore').textContent = G.score;
    $('gameStreak').textContent = G.streak; $('gameBest').textContent = best();
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function start() {
    G.gen++; G.on = false;
    $('gameStart').disabled = true;
    $('gameMsg').textContent = 'Warming up the type case…';
    $('gameWord').textContent = '…';
    var cands = F.FONTS.filter(function (f) { return !f.stack; });
    Promise.all(cands.map(function (f) { return F.loadFont(f.id).then(function (ok) { return ok ? f : null; }); })).then(function (res) {
      G.pool = res.filter(Boolean);
      $('gameStart').disabled = false;
      if (G.pool.length < 4) {
        $('gameWord').textContent = 'Offline?';
        $('gameMsg').textContent = 'The game needs web fonts (system fonts look different on every device, which would be cheating — for us). Reconnect and try again.';
        F.audio.play('buzz');
        return;
      }
      G.gen++; G.on = true; G.round = 0; G.score = 0; G.streak = 0; G.used = [];
      $('gameStart').textContent = 'Restart';
      next();
    });
  }

  function next() {
    if (G.round >= 10) return finish();
    G.round++; G.locked = false; G.hinted = false;
    var fresh = G.pool.filter(function (f) { return G.used.indexOf(f.id) < 0; });
    if (!fresh.length) { G.used = []; fresh = G.pool.slice(); }
    var ans = F.pick(fresh); G.used.push(ans.id); G.answer = ans;
    /* later rounds: decoys from the same category when possible */
    var same = G.pool.filter(function (f) { return f.id !== ans.id && f.cat === ans.cat; });
    var other = G.pool.filter(function (f) { return f.id !== ans.id && f.cat !== ans.cat; });
    shuffle(same); shuffle(other);
    var nSame = G.round > 5 ? Math.min(3, same.length) : Math.min(1, same.length);
    var decoys = same.slice(0, nSame).concat(other).slice(0, 3);
    if (decoys.length < 3) decoys = decoys.concat(same.slice(nSame)).slice(0, 3);
    var opts = shuffle([ans].concat(decoys));
    var w = $('gameWord');
    w.style.fontFamily = F.family(ans.id);
    w.style.fontWeight = F.weightFor(ans.id, ans.cat === 'Display' ? 400 : 500);
    w.textContent = F.pick(F.GAME_WORDS);
    w.classList.remove('strike'); void w.offsetWidth; w.classList.add('strike');
    $('gameMsg').textContent = G.round > 5 ? 'Tricky round — the suspects are related.' : 'Which typeface is this?';
    $('gameOpts').innerHTML = opts.map(function (f, i) {
      return '<button type="button" class="opt" data-id="' + f.id + '"><kbd>' + (i + 1) + '</kbd>' + F.esc(f.name) + '</button>';
    }).join('');
    $('gameHint').disabled = false;
    hud(); F.audio.play('press');
  }

  function choose(btn) {
    if (!G.on || G.locked || !btn) return;
    G.locked = true; $('gameHint').disabled = true;
    var ok = btn.dataset.id === G.answer.id;
    $('gameOpts').querySelectorAll('.opt').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.id === G.answer.id) b.classList.add('right');
    });
    if (ok) {
      var pts = (G.hinted ? 5 : 10) + G.streak * 2;
      G.score += pts; G.streak++;
      $('gameMsg').textContent = F.pick(['Correct! +' + pts + '. Your eye is well kerned.', 'Yes! +' + pts + '. A connoisseur.', 'Nailed it. +' + pts + '.', 'Bang on. +' + pts + ' — the serifs salute you.']);
      F.audio.play('ding');
    } else {
      btn.classList.add('wrong'); G.streak = 0;
      $('gameMsg').textContent = 'Nope — that was ' + G.answer.name + '. Easy mistake; they went to the same type school.';
      F.audio.play('buzz');
    }
    hud();
    var gen = G.gen;
    setTimeout(function () { if (gen === G.gen && G.on) next(); }, ok ? 1100 : 1800);
  }

  function finish() {
    G.on = false;
    var b = best(), rec = G.score > b;
    if (rec) setBest(G.score);
    var title = G.score >= 120 ? 'Master Typographer' : G.score >= 80 ? 'Senior Compositor' : G.score >= 40 ? 'Apprentice Printer' : 'Ink-stained Intern';
    $('gameWord').style.fontFamily = ''; $('gameWord').style.fontWeight = '';
    $('gameWord').textContent = G.score + ' pts';
    $('gameMsg').textContent = title + (rec ? ' — new personal best!' : '') + ' Play again?';
    $('gameOpts').innerHTML = '';
    $('gameHint').disabled = true;
    hud(); F.audio.play(rec ? 'ding' : 'press');
    if (rec) F.toast('New best: ' + G.score + '. Someone fetch the gold leaf.');
  }

  function hint() {
    if (!G.on || G.locked || G.hinted) return;
    G.hinted = true; $('gameHint').disabled = true;
    var wrong = Array.prototype.slice.call($('gameOpts').querySelectorAll('.opt:not(:disabled)')).filter(function (b) { return b.dataset.id !== G.answer.id; });
    if (wrong.length) { var x = F.pick(wrong); x.disabled = true; x.classList.add('struck'); }
    $('gameMsg').textContent = 'Hint: it’s a ' + G.answer.cat.toLowerCase() + ' face. One suspect has an alibi (half points now).';
    F.audio.play('tick');
  }

  F.initGame = function () {
    hud();
    $('gameStart').addEventListener('click', start);
    $('gameHint').addEventListener('click', hint);
    $('gameOpts').addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b && !b.disabled) choose(b); });
    document.addEventListener('keydown', function (e) {
      if (!G.on || G.locked) return;
      var gs = $('game'); if (!gs.contains(document.activeElement) && document.activeElement !== document.body) return;
      var r = gs.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) { var b = $('gameOpts').querySelectorAll('.opt')[n - 1]; if (b && !b.disabled) { e.preventDefault(); choose(b); } }
    });
  };
})();
