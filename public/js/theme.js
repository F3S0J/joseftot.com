// Runs blocking in <head>: sets the theme before first paint, decides whether to boot.
(function () {
  var d = document.documentElement;
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (['green', 'dark', 'light', 'mono', 'amber'].indexOf(t) < 0) t = 'green';
  d.setAttribute('data-theme', t);

  var booted = true;
  try { booted = sessionStorage.getItem('booted') === '1'; } catch (e) {}
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!booted && !calm && !/\/play\/?$/.test(location.pathname)) {
    d.setAttribute('data-boot', '');
    // failsafe: never leave the page hidden if the main script does not arrive
    setTimeout(function () { d.removeAttribute('data-boot'); }, 6000);
  }
})();
