/* =====================================================================
   Ritesh Studio — Service Worker & Offline Cache Engine
   Cache-first for static assets, network-first for navigation,
   and reliable offline operational capabilities for the studio owner.
   ===================================================================== */

const CACHE_NAME = 'ritesh-studio-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './login.html',
  './bookings.html',
  './galleries.html',
  './upload.html',
  './portfolio.html',
  './messages.html',
  './manifest.webmanifest',
  './assets/css/studio.css',
  './assets/js/config.js',
  './assets/js/demo-store.js',
  './assets/js/emails.js',
  './assets/js/api.js',
  './assets/js/studio-app.js',
  './assets/js/img-fallback.js',
  './assets/icons/studio-icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled so an individual asset failure doesn't halt installation
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[Studio SW] Failed to precache:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Studio SW] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests (e.g. POST uploads)
  if (req.method !== 'GET') return;

  // Skip chrome-extension or other non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests (HTML pages): Network-first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Fonts, Images within scope): Stale-while-revalidate
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return networkRes;
          })
          .catch(() => null);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // 3. All other requests: Network default
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
