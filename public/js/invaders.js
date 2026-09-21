// Space Invaders for TOT//OS. Plain canvas, no dependencies, colours follow the site theme.
(function () {
  'use strict';
  var cv = document.getElementById('game');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = 360, H = 440, PX = 2;
  cv.width = W; cv.height = H;

  var SPR = {
    squid: [['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '..X..X..', '.X.XX.X.', 'X.X..X.X'],
            ['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.X.XX.X.', 'X......X', '.X....X.']],
    crab: [['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
           ['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXX.XXX.XXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.']],
    octo: [['....XXXX....', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXX..XX..XXX', 'XXXXXXXXXXXX', '...XX..XX...', '..XX.XX.XX..', 'XX........XX'],
           ['....XXXX....', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXX..XX..XXX', 'XXXXXXXXXXXX', '..XXX..XXX..', '.XX..XX..XX.', '..XX....XX..']],
    ship: [['......X......', '.....XXX.....', '.....XXX.....', '.XXXXXXXXXXX.', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX']],
    ufo: [['.....XXXXXX.....', '...XXXXXXXXXX...', '..XXXXXXXXXXXX..', '.XX.XX.XX.XX.XX.', 'XXXXXXXXXXXXXXXX', '..XXX..XX..XXX..', '...X........X...']],
    boom: [['X...X..X...X', '.X...XX...X.', '..X......X..', 'XX........XX', '..X......X..', '.X...XX...X.', 'X...X..X...X']],
    bunker: [['....XXXXXXXXXXXXXX....', '...XXXXXXXXXXXXXXXX...', '..XXXXXXXXXXXXXXXXXX..', '.XXXXXXXXXXXXXXXXXXXX.', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXX........XXXXXXX', 'XXXXXX..........XXXXXX', 'XXXXX............XXXXX', 'XXXXX............XXXXX']],
  };
  function size(name) { var s = SPR[name][0]; return { w: s[0].length * PX, h: s.length * PX }; }
  function sprite(name, frame, x, y) {
    var rows = SPR[name][frame % SPR[name].length];
    for (var r = 0; r < rows.length; r++)
      for (var c = 0; c < rows[r].length; c++)
        if (rows[r].charCodeAt(c) === 88) ctx.fillRect(x + c * PX, y + r * PX, PX, PX);
  }

  /* ---------- theme ---------- */
  var col = {};
  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    col.fg = cs.getPropertyValue('--fg').trim() || '#3dff7a';
    col.accent = cs.getPropertyValue('--accent').trim() || '#fff';
    col.dim = cs.getPropertyValue('--dim').trim() || '#2a6';
    col.bg = cs.getPropertyValue('--bg-2').trim() || '#000';
    col.glow = cs.getPropertyValue('--crt').trim() === '1';
  }
  readTheme();
  document.addEventListener('themechange', function () { readTheme(); if (state !== 'play') draw(); });

  /* ---------- sound ---------- */
  var ac = null, muted = true;
  try { muted = localStorage.getItem('inv:sound') !== 'on'; } catch (e) {}
  function beep(freq, dur, type, vol, slide) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  var MARCH = [110, 98, 87, 82], marchI = 0;

  /* ---------- state ---------- */
  var state = 'title'; // title | play | pause | dead | over
  var score = 0, hi = 0, lives = 3, wave = 1;
  try { hi = +localStorage.getItem('inv:hi') || 0; } catch (e) {}
  var ship, shot, bombs, inv, dir, stepT, frame, ufo, ufoT, bunkers, booms, deadT;
  var keys = { l: false, r: false, f: false };
  var hud = { score: document.getElementById('hud-score'), hi: document.getElementById('hud-hi'), lives: document.getElementById('hud-lives') };

  function z(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function syncHud() {
    if (!hud.score) return;
    hud.score.textContent = z(score, 5); hud.hi.textContent = z(hi, 5);
    hud.lives.textContent = lives > 0 ? new Array(lives + 1).join('A ').trim() : '-';
  }

  function makeBunkers() {
    bunkers = [];
    var s = size('bunker');
    for (var i = 0; i < 4; i++) {
      var cells = SPR.bunker[0].map(function (r) { return r.split('').map(function (ch) { return ch === 'X'; }); });
      bunkers.push({ x: 38 + i * 80, y: H - 92, w: s.w, h: s.h, cells: cells });
    }
  }
  function newWave() {
    inv = [];
    var top = 54 + Math.min(wave - 1, 5) * 12;
    var kinds = ['squid', 'crab', 'crab', 'octo', 'octo'], pts = [30, 20, 20, 10, 10];
    for (var r = 0; r < 5; r++)
      for (var c = 0; c < 11; c++) {
        var s = size(kinds[r]);
        inv.push({ kind: kinds[r], pts: pts[r], c: c, r: r, x: 26 + c * 28 + (28 - s.w) / 2, y: top + r * 24, w: s.w, h: s.h, alive: true });
      }
    dir = 1; stepT = 0; frame = 0; bombs = []; shot = null; ufo = null; ufoT = 12 + Math.random() * 10; booms = [];
  }
  function reset() {
    score = 0; lives = 3; wave = 1;
    ship = { x: W / 2 - 13, y: H - 40, w: 26, h: 16 };
    makeBunkers(); newWave(); syncHud();
  }

  function hitBunker(o, down) {
    for (var b = 0; b < bunkers.length; b++) {
      var k = bunkers[b];
      if (o.x + o.w < k.x || o.x > k.x + k.w || o.y + o.h < k.y || o.y > k.y + k.h) continue;
      var cx = Math.floor((o.x + o.w / 2 - k.x) / PX);
      var rows = k.cells.length, r0 = down ? 0 : rows - 1, dr = down ? 1 : -1;
      for (var r = r0; r >= 0 && r < rows; r += dr) {
        var ry = k.y + r * PX;
        if (ry + PX < o.y || ry > o.y + o.h) continue;
        if (k.cells[r][cx]) {
          for (var yy = -2; yy <= 2; yy++) for (var xx = -2; xx <= 2; xx++) {
            var R = k.cells[r + yy];
            if (R && R[cx + xx] !== undefined && Math.abs(xx) + Math.abs(yy) < 4 && Math.random() < 0.8) R[cx + xx] = false;
          }
          return true;
        }
      }
    }
    return false;
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  /* ---------- update ---------- */
  function update(dt) {
    if (state === 'dead') {
      deadT -= dt;
      if (deadT <= 0) {
        if (lives <= 0) { state = 'over'; if (score > hi) { hi = score; try { localStorage.setItem('inv:hi', hi); } catch (e) {} } syncHud(); }
        else { state = 'play'; ship.x = W / 2 - 13; bombs = []; }
      }
      return;
    }
    // ship
    var v = 150 * dt;
    if (keys.l) ship.x -= v;
    if (keys.r) ship.x += v;
    ship.x = Math.max(6, Math.min(W - ship.w - 6, ship.x));
    if (keys.f && !shot) { shot = { x: ship.x + ship.w / 2 - 1, y: ship.y - 8, w: 2, h: 8 }; beep(880, 0.12, 'square', 0.04, 220); }

    // player shot
    if (shot) {
      shot.y -= 420 * dt;
      if (shot.y < 26) shot = null;
      else if (hitBunker(shot, false)) shot = null;
      else if (ufo && overlap(shot, ufo)) {
        var bonus = [50, 100, 150, 300][(Math.random() * 4) | 0];
        score += bonus; booms.push({ x: ufo.x + 4, y: ufo.y, t: 0.5, text: String(bonus) }); ufo = null; shot = null;
        beep(300, 0.4, 'sawtooth', 0.05, 1200); syncHud();
      } else for (var i = 0; i < inv.length; i++) {
        var a = inv[i];
        if (a.alive && overlap(shot, a)) {
          a.alive = false; shot = null; score += a.pts; booms.push({ x: a.x - 2, y: a.y, t: 0.22 });
          beep(160, 0.18, 'sawtooth', 0.06, 40); syncHud(); break;
        }
      }
    }

    // invaders march: the fewer are left, the faster they step
    var alive = inv.filter(function (a) { return a.alive; });
    if (!alive.length) { wave++; newWave(); makeBunkers(); return; }
    stepT -= dt;
    if (stepT <= 0) {
      stepT = Math.max(0.035, 0.02 + (alive.length / 55) * (0.62 - Math.min(wave - 1, 6) * 0.05));
      frame++;
      beep(MARCH[marchI++ % 4], 0.09, 'square', 0.05);
      var minX = 1e9, maxX = -1e9;
      alive.forEach(function (a) { minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x + a.w); });
      if ((dir > 0 && maxX + 4 > W - 6) || (dir < 0 && minX - 4 < 6)) { dir = -dir; inv.forEach(function (a) { a.y += 12; }); }
      else inv.forEach(function (a) { a.x += 4 * dir; });
      // bombs come from the lowest invader of a random column
      if (bombs.length < 2 + Math.min(wave, 4) && Math.random() < 0.35 + wave * 0.04) {
        var colN = alive[(Math.random() * alive.length) | 0].c, low = null;
        alive.forEach(function (a) { if (a.c === colN && (!low || a.y > low.y)) low = a; });
        bombs.push({ x: low.x + low.w / 2 - 1, y: low.y + low.h, w: 2, h: 8 });
      }
      alive.forEach(function (a) {
        if (a.y + a.h >= ship.y) { lives = 0; die(); }
        bunkers.forEach(function (k) { if (overlap(a, k)) k.cells.forEach(function (R) { R.fill(false); }); });
      });
    }

    // bombs
    for (var b = bombs.length - 1; b >= 0; b--) {
      var m = bombs[b];
      m.y += (120 + wave * 12) * dt;
      if (m.y > H - 18 || hitBunker(m, true)) bombs.splice(b, 1);
      else if (shot && overlap(m, { x: shot.x - 2, y: shot.y, w: 6, h: shot.h })) { bombs.splice(b, 1); shot = null; }
      else if (overlap(m, ship)) { bombs.splice(b, 1); lives--; die(); }
    }

    // mystery ship
    ufoT -= dt;
    if (!ufo && ufoT <= 0) { var d = Math.random() < 0.5 ? 1 : -1; ufo = { x: d > 0 ? -32 : W, y: 30, w: 32, h: 14, d: d }; ufoT = 18 + Math.random() * 14; }
    if (ufo) { ufo.x += ufo.d * 70 * dt; if (ufo.x < -40 || ufo.x > W + 8) ufo = null; else if (frame % 2 === 0) beep(1200, 0.03, 'sine', 0.012); }

    for (var e = booms.length - 1; e >= 0; e--) { booms[e].t -= dt; if (booms[e].t <= 0) booms.splice(e, 1); }
  }
  function die() {
    state = 'dead'; deadT = 1.1; shot = null; syncHud();
    beep(120, 0.9, 'sawtooth', 0.08, 30);
  }

  /* ---------- draw ---------- */
  function text(s, y, px, color) {
    ctx.font = px + 'px VT323, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = color || col.fg;
    ctx.fillText(s, W / 2, y);
  }
  function draw() {
    ctx.shadowBlur = 0;
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    if (col.glow) { ctx.shadowColor = col.fg; ctx.shadowBlur = 6; }

    if (state === 'title') {
      ctx.fillStyle = col.fg;
      sprite('squid', 0, 116, 170); sprite('crab', 0, 113, 200); sprite('octo', 0, 112, 230); sprite('ufo', 0, 108, 140);
      ctx.font = '18px VT323, monospace'; ctx.textAlign = 'left';
      ctx.fillText('= ?  MYSTERY', 160, 153); ctx.fillText('= 30 POINTS', 160, 183); ctx.fillText('= 20 POINTS', 160, 213); ctx.fillText('= 10 POINTS', 160, 243);
      text('SPACE INVADERS', 96, 48, col.accent);
      if (Math.floor(performance.now() / 500) % 2) text('PRESS ENTER OR TAP TO START', 320, 20);
      text('SHALL WE PLAY A GAME?', 362, 18, col.dim);
      return;
    }

    ctx.fillStyle = col.fg;
    inv.forEach(function (a) { if (a.alive) sprite(a.kind, frame, a.x, a.y); });
    bunkers.forEach(function (k) {
      for (var r = 0; r < k.cells.length; r++) for (var c = 0; c < k.cells[r].length; c++)
        if (k.cells[r][c]) ctx.fillRect(k.x + c * PX, k.y + r * PX, PX, PX);
    });
    if (state !== 'dead' || Math.floor(deadT * 10) % 2) sprite('ship', 0, ship.x, ship.y);
    ctx.fillStyle = col.accent;
    if (shot) ctx.fillRect(shot.x, shot.y, shot.w, shot.h);
    bombs.forEach(function (m) { ctx.fillRect(m.x, m.y, m.w, m.h); ctx.fillRect(m.x - 2, m.y + (frame % 2 ? 2 : 5), 6, 2); });
    if (ufo) sprite('ufo', 0, ufo.x, ufo.y);
    booms.forEach(function (b) {
      if (b.text) { ctx.font = '16px VT323, monospace'; ctx.textAlign = 'left'; ctx.fillText(b.text, b.x, b.y + 12); }
      else sprite('boom', 0, b.x, b.y);
    });
    ctx.fillStyle = col.dim; ctx.fillRect(0, H - 16, W, 1);
    ctx.font = '14px VT323, monospace'; ctx.textAlign = 'left'; ctx.fillText('WAVE ' + z(wave, 2), 6, H - 4);
    ctx.textAlign = 'right'; ctx.fillText(muted ? 'M: SOUND OFF' : 'M: SOUND ON', W - 6, H - 4);

    if (state === 'pause') text('PAUSED', 220, 40, col.accent);
    if (state === 'over') {
      text('GAME OVER', 180, 48, col.accent);
      text(score >= hi && score > 0 ? 'NEW HIGH SCORE ' + z(score, 5) : 'SCORE ' + z(score, 5), 212, 22);
      text('THE ONLY WINNING MOVE IS TO PLAY AGAIN.', 250, 15, col.dim);
      if (Math.floor(performance.now() / 500) % 2) text('PRESS ENTER OR TAP', 286, 20);
    }
  }

  /* ---------- loop ---------- */
  var last = 0;
  function loop(t) {
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (state === 'play' || state === 'dead') update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function start() { if (state === 'title' || state === 'over') { reset(); state = 'play'; cv.focus({ preventScroll: true }); } }
  function togglePause() { if (state === 'play') state = 'pause'; else if (state === 'pause') state = 'play'; }

  /* ---------- input ---------- */
  document.body.setAttribute('data-game', '');
  function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA)$/.test(a.tagName); }
  function key(e, down) {
    if (typing()) return;
    var k = e.key.toLowerCase(), used = true;
    if (k === 'arrowleft' || k === 'a') keys.l = down;
    else if (k === 'arrowright' || k === 'd') keys.r = down;
    else if (k === ' ' || k === 'arrowup' || k === 'w') { keys.f = down; if (down && state !== 'play') start(); }
    else if (down && k === 'enter') start();
    else if (down && k === 'p') togglePause();
    else if (down && k === 'm') { muted = !muted; try { localStorage.setItem('inv:sound', muted ? 'off' : 'on'); } catch (er) {} if (!muted) beep(660, 0.1); }
    else used = false;
    if (used) e.preventDefault();
  }
  addEventListener('keydown', function (e) { key(e, true); });
  addEventListener('keyup', function (e) { key(e, false); });
  cv.addEventListener('pointerdown', function () { if (state === 'pause') state = 'play'; else start(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && state === 'play') state = 'pause'; });

  document.querySelectorAll('.pad button').forEach(function (b) {
    var k = b.dataset.k;
    var set = function (v) { return function (e) { e.preventDefault(); keys[k] = v; if (v && k === 'f' && state !== 'play') start(); }; };
    b.addEventListener('pointerdown', set(true));
    b.addEventListener('pointerup', set(false));
    b.addEventListener('pointerleave', set(false));
    b.addEventListener('pointercancel', set(false));
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

  syncHud();
  requestAnimationFrame(function (t) { last = t; loop(t); });
})();
