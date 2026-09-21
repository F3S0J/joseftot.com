// TOT//OS shell — theme switch, boot, typed lines, and a working command line.
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var THEMES = ['green', 'dark', 'light', 'mono'];
  var SECRET = ['amber'];
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (s, k) { try { return s.getItem(k); } catch (e) { return null; } },
    set: function (s, k, v) { try { s.setItem(k, v); } catch (e) {} },
  };

  /* ---------- themes ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    store.set(localStorage, 'theme', t);
    document.querySelectorAll('.themes button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.set === t));
    });
    document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  document.querySelectorAll('.themes button').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(b.dataset.set); });
  });
  setTheme(root.getAttribute('data-theme') || 'green');

  /* ---------- clock ---------- */
  var clock = $('.clock');
  if (clock) {
    var tick = function () {
      clock.textContent = new Date().toLocaleTimeString('de-AT', { hour12: false, timeZone: 'Europe/Vienna' }) + ' VIE';
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- boot ---------- */
  function boot(done) {
    var el = document.createElement('div');
    el.className = 'boot';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="skip-hint">[ any key to skip ]</span>';
    var pre = document.createElement('div');
    el.prepend(pre);
    document.body.appendChild(el);
    var lines = [
      'TOT//OS BIOS 1.0  (c) ' + new Date().getFullYear() + ' J. TOT',
      '',
      'CPU ............ 1x HUMAN, CAFFEINATED',
      'MEMORY ......... 640K OK  (OUGHT TO BE ENOUGH)',
      'NETWORK ........ LINK UP',
      'MOUNT /blog .... OK',
      'MOUNT /projects  OK',
      'LOADING PERSONALITY MODULE .... OK',
      '',
      'GREETINGS, VISITOR.',
    ];
    var i = 0, timer, finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      store.set(sessionStorage, 'booted', '1');
      root.removeAttribute('data-boot');
      el.remove();
      removeEventListener('keydown', finish, true);
      removeEventListener('pointerdown', finish, true);
      done();
    }
    function next() {
      if (i >= lines.length) { timer = setTimeout(finish, 420); return; }
      pre.textContent += lines[i++] + '\n';
      timer = setTimeout(next, 70 + Math.random() * 120);
    }
    addEventListener('keydown', finish, true);
    addEventListener('pointerdown', finish, true);
    next();
  }

  /* ---------- typed lines ---------- */
  function typeAll() {
    document.querySelectorAll('[data-type]').forEach(function (el) {
      var text = el.textContent.trim();
      if (calm || store.get(sessionStorage, 'typed:' + location.pathname)) return;
      store.set(sessionStorage, 'typed:' + location.pathname, '1');
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var cur = document.createElement('span');
      cur.className = 'cursor';
      el.appendChild(cur);
      var i = 0;
      (function step() {
        if (i >= text.length) return;
        cur.before(text[i++]);
        setTimeout(step, 14 + Math.random() * 30);
      })();
    });
  }

  if (root.hasAttribute('data-boot')) boot(typeAll); else typeAll();

  /* ---------- command line ---------- */
  var out = $('.term-out'), input = $('#cmd'), form = $('.term form');
  if (!input) return;

  var history = JSON.parse(store.get(sessionStorage, 'hist') || '[]');
  var hpos = history.length;
  var index = null;
  var mode = null; // 'joshua' while WOPR is talking

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function persist() {
    var kids = Array.prototype.slice.call(out.children, -80);
    store.set(sessionStorage, 'out', kids.map(function (k) { return k.outerHTML; }).join(''));
    store.set(sessionStorage, 'outOpen', out.hidden ? '0' : '1');
  }
  function print(html, cls) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.hidden = false;
    out.scrollTop = out.scrollHeight;
    persist();
  }
  function slowPrint(lines, delay, then) {
    var i = 0;
    (function step() {
      if (i >= lines.length) { if (then) then(); return; }
      print(lines[i++]);
      setTimeout(step, calm ? 0 : delay);
    })();
  }
  function go(path) {
    print('-> ' + esc(path), 'in');
    setTimeout(function () { location.href = path; }, 140);
  }

  var saved = store.get(sessionStorage, 'out');
  if (saved) { out.innerHTML = saved; out.hidden = store.get(sessionStorage, 'outOpen') !== '1'; out.scrollTop = out.scrollHeight; }

  function cwd() {
    var p = location.pathname.replace(/^\/(blog|projects)\/.+$/, '/$1').replace(/\/+$/, '');
    return p === '' ? '~' : '~' + p;
  }
  var host = $('.term .path');
  if (host) host.textContent = cwd();

  function loadIndex(cb) {
    if (index) return cb(index);
    fetch('/index.json').then(function (r) { return r.json(); }).then(function (j) { index = j; cb(j); })
      .catch(function () { print('index unavailable', 'err'); });
  }
  function section() {
    var m = location.pathname.match(/^\/(blog|projects)\//);
    return m ? m[1] : null;
  }
  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

  var DIRS = { blog: '/blog/', projects: '/projects/', about: '/about/', play: '/play/', home: '/', '~': '/', '/': '/', '..': null, imprint: '/imprint/' };

  var commands = {
    help: function () {
      print([
        'AVAILABLE COMMANDS',
        '  ls              list what is here',
        '  cd &lt;dir&gt;        blog | projects | about | ~ | ..',
        '  cat &lt;name&gt;      open a post or project (tab completes)',
        '  theme &lt;name&gt;    ' + THEMES.join(' | '),
        '  play            space invaders',
        '  matrix          follow the white rabbit',
        '  whoami, date, neofetch, history, clear',
        '',
        '<span class="dim">some commands are not listed. a strange game.</span>',
      ].join('\n'));
    },
    ls: function () {
      var s = section();
      if (!s) {
        print('<a href="/blog/">blog/</a>      <a href="/projects/">projects/</a>      <a href="/about/">about.md</a>      <a href="/play/">invaders*</a>      <a href="/rss.xml">rss.xml</a>');
        return;
      }
      loadIndex(function (ix) {
        print(ix[s].map(function (e) {
          return '<span class="dim">' + esc(pad(e.meta, 11)) + '</span> <a href="' + e.url + '">' + esc(e.slug) + '</a>';
        }).join('\n') || 'total 0');
      });
    },
    cd: function (a) {
      var t = (a[0] || '~').replace(/^\.?\/+|\/+$/g, '') || '~';
      if (t === '..') {
        var up = location.pathname.replace(/\/+$/, '').split('/').slice(0, -1).join('/') + '/';
        return go(up);
      }
      if (DIRS[t]) return go(DIRS[t]);
      print('cd: no such directory: ' + esc(t), 'err');
    },
    cat: function (a) {
      var name = (a[0] || '').replace(/\.md$/, '').replace(/^.*\//, '');
      if (!name) return print('usage: cat &lt;name&gt;', 'err');
      if (name === 'about') return go('/about/');
      loadIndex(function (ix) {
        var pools = section() ? [section()] : ['blog', 'projects'];
        for (var p = 0; p < pools.length; p++) {
          var hit = ix[pools[p]].filter(function (e) { return e.slug === name; })[0];
          if (hit) return go(hit.url);
        }
        print('cat: ' + esc(name) + ': no such file', 'err');
      });
    },
    theme: function (a) {
      var t = a[0];
      if (THEMES.indexOf(t) >= 0 || SECRET.indexOf(t) >= 0) { setTheme(t); print('theme: ' + t + (SECRET.indexOf(t) >= 0 ? '  <span class="dim">(you found one.)</span>' : '')); }
      else print('themes: ' + THEMES.join(', ') + '\ncurrent: ' + root.getAttribute('data-theme'));
    },
    play: function () { go('/play/'); },
    whoami: function () { print('guest  <span class="dim">(uid=1000, groups=visitors,curious)</span>'); },
    date: function () { print(esc(new Date().toString())); },
    pwd: function () { print(esc(cwd().replace('~', '/home/josef'))); },
    echo: function (a) { print(esc(a.join(' '))); },
    history: function () { print(history.map(function (h, i) { return pad(i + 1, 4) + esc(h); }).join('\n')); },
    clear: function () { out.innerHTML = ''; out.hidden = true; persist(); },
    exit: function () { print('there is no exit. only <a href="/">~</a>.'); },
    sudo: function () { print('guest is not in the sudoers file. This incident will be reported.', 'err'); },
    rm: function () { print('rm: nice try.', 'err'); },
    vim: function () { print('you would never get out again.'); },
    neofetch: function () {
      var t = root.getAttribute('data-theme');
      print([
        ' _____ ___ _____    <b>guest</b>@<b>joseftot.com</b>',
        '|_   _/ _ \\_   _|   -------------------',
        '  | || (_) || |     OS      TOT//OS 1.0',
        '  |_| \\___/ |_|     SHELL   totsh',
        '                    THEME   ' + t,
        '                    VIEW    ' + innerWidth + 'x' + innerHeight,
        '                    UPTIME  ' + Math.round(performance.now() / 1000) + 's',
      ].join('\n'));
    },
    matrix: function () { rain(); },
    joshua: function () { wopr(); },
  };
  var alias = { '?': 'help', dir: 'ls', ll: 'ls', open: 'cat', less: 'cat', more: 'cat', invaders: 'play', game: 'play', games: 'joshua', themes: 'theme', cls: 'clear', home: 'cd', vi: 'vim', nano: 'vim', emacs: 'vim' };

  /* ---------- WOPR ---------- */
  function wopr() {
    mode = 'joshua';
    slowPrint(['GREETINGS PROFESSOR FALKEN.', '', 'SHALL WE PLAY A GAME?',
      '<span class="dim">  CHESS\n  POKER\n  FALKEN\'S MAZE\n  SPACE INVADERS\n  GLOBAL THERMONUCLEAR WAR</span>'], 380);
  }
  function woprReply(line) {
    var l = line.toLowerCase();
    mode = null;
    if (/war|nuclear|thermo/.test(l)) {
      slowPrint(['WOULDN\'T YOU PREFER A GOOD GAME OF SPACE INVADERS?', '...', 'A STRANGE GAME.', 'THE ONLY WINNING MOVE IS NOT TO PLAY.', '', 'HOW ABOUT A NICE GAME OF <a href="/play/">SPACE INVADERS</a>?'], 650);
    } else if (/invader|yes|ok|sure|play/.test(l)) {
      slowPrint(['EXCELLENT.'], 300, function () { go('/play/'); });
    } else {
      print('THAT GAME IS NOT INSTALLED. TRY <a href="/play/">SPACE INVADERS</a>.');
    }
  }

  /* ---------- matrix rain ---------- */
  function rain() {
    var c = document.createElement('canvas');
    c.className = 'rain';
    c.setAttribute('aria-label', 'Matrix rain. Press any key to leave.');
    document.body.appendChild(c);
    var x = c.getContext('2d'), w, h, cols, drops, raf, last = 0, size = 16;
    var glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789JOSEFTOT';
    function fit() {
      w = c.width = innerWidth; h = c.height = innerHeight;
      cols = Math.ceil(w / size); drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -60;
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (t - last < 45) return;
      last = t;
      x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(0, 0, w, h);
      x.font = size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var g = glyphs[(Math.random() * glyphs.length) | 0];
        var y = drops[i] * size;
        x.fillStyle = '#d8ffe4'; x.fillText(g, i * size, y);
        x.fillStyle = '#25d45f'; x.fillText(g, i * size, y - size);
        drops[i] = y > h && Math.random() > 0.975 ? 0 : drops[i] + 1;
      }
    }
    function stop(e) {
      if (e) e.preventDefault();
      cancelAnimationFrame(raf); c.remove();
      removeEventListener('keydown', stop, true); removeEventListener('resize', fit);
      print('Wake up, Neo...');
      input.focus();
    }
    fit(); addEventListener('resize', fit);
    setTimeout(function () { addEventListener('keydown', stop, true); c.addEventListener('pointerdown', stop); }, 250);
    raf = requestAnimationFrame(frame);
  }

  /* ---------- run ---------- */
  function run(line) {
    line = line.trim();
    if (!line) return;
    print('<span class="dim">' + esc(cwd()) + '$</span> ' + esc(line), 'in');
    history.push(line); if (history.length > 50) history.shift();
    hpos = history.length;
    store.set(sessionStorage, 'hist', JSON.stringify(history));

    if (mode === 'joshua') return woprReply(line);
    var l = line.toLowerCase();
    if (/^(hello|hi|hey)\b/.test(l)) return print('hello, friend.');
    if (/thermonuclear|^shall we play/.test(l)) return wopr();
    if (/white rabbit|^wake up/.test(l)) return rain();

    var parts = line.split(/\s+/), name = parts[0].toLowerCase();
    if (name.indexOf('./') === 0) name = name.slice(2);
    name = alias[name] || name;
    if (name === 'cd' && parts[0].toLowerCase() === 'home') parts = ['cd', '~'];
    if (commands[name]) commands[name](parts.slice(1));
    else print('totsh: command not found: ' + esc(parts[0]) + '  <span class="dim">(try help)</span>', 'err');
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; run(v); });
  var helpBtn = $('.term [data-run]');
  if (helpBtn) helpBtn.addEventListener('click', function () { run(helpBtn.dataset.run); input.focus(); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { if (hpos > 0) input.value = history[--hpos]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hpos = Math.min(history.length, hpos + 1); input.value = history[hpos] || ''; e.preventDefault(); }
    else if (e.key === 'Escape') { out.hidden = true; persist(); input.blur(); }
    else if (e.key === 'l' && e.ctrlKey) { commands.clear(); e.preventDefault(); }
    else if (e.key === 'Tab' && input.value) {
      e.preventDefault();
      var parts = input.value.split(/\s+/);
      var complete = function (pool) {
        var frag = parts[parts.length - 1].toLowerCase();
        var hits = pool.filter(function (p) { return p.indexOf(frag) === 0; });
        if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + ' '; }
        else if (hits.length > 1) print(hits.join('   '));
      };
      if (parts.length === 1) complete(Object.keys(commands));
      else if (/^(cd)$/.test(parts[0])) complete(['blog', 'projects', 'about', 'play']);
      else if (/^(theme)$/.test(parts[0])) complete(THEMES);
      else loadIndex(function (ix) {
        var s = section();
        complete((s ? ix[s] : ix.blog.concat(ix.projects)).map(function (x) { return x.slug; }));
      });
    }
  });

  // start typing anywhere and it lands in the prompt
  addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.body.hasAttribute('data-game')) return;
    var a = document.activeElement;
    if (a && (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(a.tagName) || a.isContentEditable)) return;
    if (e.key.length === 1 && e.key !== ' ') input.focus();
  });
})();
