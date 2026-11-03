/* =====================================================================
   Ritesh Studio — PWA App Engine & Mobile App Navigation
   Native install prompts, offline detection, bottom dock navigation,
   real-time notification badges, and studio quick actions.
   ===================================================================== */

(function () {
  'use strict';

  window.StudioApp = window.StudioApp || {};

  var deferredPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  /* -------------------------------------------------------------------
     1. Toast Notification System
     ------------------------------------------------------------------- */
  function ensureToastContainer() {
    var container = document.getElementById('studioToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'studioToastContainer';
      container.className = 'studio-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.StudioApp.toast = function (message, type, duration) {
    var container = ensureToastContainer();
    var toast = document.createElement('div');
    toast.className = 'studio-toast' + (type ? ' toast--' + type : '');
    toast.innerHTML = '<span>' + message + '</span>';

    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    }, duration || 3200);
  };

  /* -------------------------------------------------------------------
     2. Service Worker Registration
     ------------------------------------------------------------------- */
  function initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        // Registered successfully
      }).catch(function (err) {
        console.warn('[Studio PWA] Service worker registration error:', err);
      });
    }
  }

  /* -------------------------------------------------------------------
     3. Network Status Monitor (Offline / Reconnected Toasts)
     ------------------------------------------------------------------- */
  function initNetworkMonitor() {
    window.addEventListener('offline', function () {
      window.StudioApp.toast('Operating in offline mode with cached studio records.', 'error', 4000);
    });
    window.addEventListener('online', function () {
      window.StudioApp.toast('Connection restored. Syncing with studio backend.', 'success', 3000);
    });
  }

  /* -------------------------------------------------------------------
     4. PWA Installation Management
     ------------------------------------------------------------------- */
  function initInstallPrompt() {
    var installBtn = document.getElementById('installAppBtn');
    var iosModal = document.getElementById('iosInstallModal');
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isStandalone) {
      if (installBtn) {
        installBtn.style.display = 'none';
      }
      return;
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (choice) {
            if (choice.outcome === 'accepted') {
              window.StudioApp.toast('Studio App installed to your device!', 'success');
              installBtn.style.display = 'none';
            }
            deferredPrompt = null;
          });
        } else if (isIOS) {
          if (iosModal) iosModal.classList.add('is-open');
        } else {
          window.StudioApp.toast('To install: click the Install icon in your browser address bar or Menu.', '', 4500);
        }
      });
    }

    var iosClose = document.getElementById('iosInstallClose');
    if (iosClose && iosModal) {
      iosClose.addEventListener('click', function () {
        iosModal.classList.remove('is-open');
      });
    }
  }

  /* -------------------------------------------------------------------
     5. Real-Time Badges & Live Studio Polling
     ------------------------------------------------------------------- */
  function updateBadges(stats) {
    if (!stats) return;

    // Bookings badge
    var newBookings = Number(stats.newBookings || 0);
    var bBadges = document.querySelectorAll('.badge-bookings');
    bBadges.forEach(function (el) {
      el.textContent = newBookings;
      if (newBookings > 0) el.classList.remove('is-zero');
      else el.classList.add('is-zero');
    });

    // Unread messages badge
    var unreadMsg = Number(stats.unread || 0);
    var mBadges = document.querySelectorAll('.badge-messages');
    mBadges.forEach(function (el) {
      el.textContent = unreadMsg;
      if (unreadMsg > 0) el.classList.remove('is-zero');
      else el.classList.add('is-zero');
    });

    // Update document title with pending tasks
    var pending = newBookings + unreadMsg;
    var rawTitle = document.title.replace(/^\(\d+\)\s*/, '');
    if (pending > 0) {
      document.title = '(' + pending + ') ' + rawTitle;
    } else {
      document.title = rawTitle;
    }
  }

  function pollStudioStats() {
    if (window.Api && window.Api.studio && window.Api.studio.stats) {
      window.Api.studio.stats().then(updateBadges).catch(function () {});
    }
  }

  /* -------------------------------------------------------------------
     6. Studio Quick Actions (WhatsApp & Client Sharing)
     ------------------------------------------------------------------- */
  window.StudioApp.copyGalleryLink = function (galleryId, pin, title, clientName) {
    var base = window.location.origin + window.location.pathname.replace(/\/studio\/.*$/, '');
    var url = base + '/website/client/gallery.html?id=' + encodeURIComponent(galleryId);
    var text = 'Hello ' + (clientName || 'there') + ',\n\nHere is your private archival photography gallery from Ritesh Farswan Photography:\nGallery Link: ' + url + '\nGallery Access PIN: ' + pin + '\n\nYou can view, select favorites, and download high-resolution photos.';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        window.StudioApp.toast('Gallery Link & Access PIN copied to clipboard!', 'success');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    var t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try {
      document.execCommand('copy');
      window.StudioApp.toast('Gallery Link & Access PIN copied to clipboard!', 'success');
    } catch (e) {
      window.prompt('Copy gallery details below:', text);
    }
    document.body.removeChild(t);
  }

  /* -------------------------------------------------------------------
     7. Bottom Mobile Navigation Active Sync
     ------------------------------------------------------------------- */
  function syncBottomNavActive() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    var items = document.querySelectorAll('.studio-bottom-item');
    items.forEach(function (item) {
      var href = item.getAttribute('href') || '';
      if (href.indexOf(filename) !== -1 || (filename === '' && href === 'index.html')) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  }

  /* -------------------------------------------------------------------
     DOM Ready Boot
     ------------------------------------------------------------------- */
  function init() {
    initServiceWorker();
    initNetworkMonitor();
    initInstallPrompt();
    syncBottomNavActive();

    // Initial stats poll & periodic refresh
    setTimeout(pollStudioStats, 600);
    setInterval(pollStudioStats, 25000);

    // Refresh when app tab comes into view
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) pollStudioStats();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
