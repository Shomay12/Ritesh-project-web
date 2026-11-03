/*
  Image safety net. If a remote image fails to load (moved, rate limited,
  offline CDN), swap it for a neutral stand-in so the layout never shows a
  broken-image icon. Loaded in <head> so it catches errors on first paint.
*/
(function () {
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG' || el.dataset.fallbackDone) return;
    el.dataset.fallbackDone = '1';
    var src = el.getAttribute('src') || 'frame';
    var seed = src.replace(/[^a-zA-Z0-9]/g, '').slice(-14) || 'frame';
    var w = parseInt(el.getAttribute('width'), 10) || 1600;
    var h = parseInt(el.getAttribute('height'), 10) || 1100;
    var scale = 1600 / Math.max(w, h);
    el.removeAttribute('srcset');
    el.src = 'https://picsum.photos/seed/' + seed + '/' + Math.round(w * scale) + '/' + Math.round(h * scale);
  }, true);
})();

