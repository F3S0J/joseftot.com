// Click-to-load SoundCloud player: nothing is fetched from SoundCloud until a visitor presses play.
(function () {
  'use strict';
  var open = null;

  function colour() {
    var c = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
    return /^#[0-9a-f]{6}$/i.test(c) ? c : '#3dff7a';
  }

  function close(li) {
    var f = li.querySelector('iframe');
    if (f) f.remove();
    li.classList.remove('on');
    li.querySelector('.play').setAttribute('aria-label', li.querySelector('.play').getAttribute('aria-label').replace(/^Stop/, 'Play'));
    li.querySelector('.play').innerHTML = '&#9654;';
  }

  document.querySelectorAll('.track .play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.closest('.track');
      if (li.classList.contains('on')) { close(li); open = null; return; }
      if (open) close(open);
      var id = li.getAttribute('data-id');
      if (!/^\d+$/.test(id)) return;
      var f = document.createElement('iframe');
      f.title = 'SoundCloud player';
      f.allow = 'autoplay';
      f.loading = 'lazy';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
      f.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent('https://api.soundcloud.com/tracks/' + id) +
        '&color=' + encodeURIComponent(colour()) +
        '&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false';
      li.appendChild(f);
      li.classList.add('on');
      btn.innerHTML = '&#9632;';
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Play/, 'Stop'));
      open = li;
    });
  });
})();
