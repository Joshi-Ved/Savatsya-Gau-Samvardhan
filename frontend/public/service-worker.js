// -----------------------------------------------------------------------------
// DEVELOPMENT SAFETY GUARD
// -----------------------------------------------------------------------------
// Check if running on localhost to prevent caching issues during development
const isLocalhost = Boolean(
  self.location.hostname === 'localhost' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

if (isLocalhost) {
  console.log('SW: Detected localhost. Unregistering to prevent cache issues.');

  self.addEventListener('install', (event) => {
    // Skip waiting to activate immediately
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    // Unregister immediately
    self.registration.unregister()
      .then(() => console.log('SW: Unregistered successfully in dev mode'));

    // Claim clients to take effect immediately (stop intercepting fetches)
    self.clients.claim();
  });

  // DO NOT add a fetch listener. Requests will go to network.

} else {
  // ---------------------------------------------------------------------------
  // PRODUCTION SERVICE WORKER LOGIC
  // ---------------------------------------------------------------------------

  const CACHE_NAME = 'sawatsya-v2';
  const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html',
  ];

  // Install event - cache essential resources
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache))
        .catch((err) => console.warn('Cache installation failed:', err))
    );
    self.skipWaiting();
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim();
  });

  // Fetch event - serve from cache, fallback to network
  self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
      return;
    }

    // Never cache API requests — always use network-first
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request).catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      return;
    }

    // SPA navigation requests — always serve index.html (network-first, fallback to cache)
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Cache the latest index.html
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseToCache);
            });
            return response;
          })
          .catch(() => {
            // Offline — serve cached index.html so client-side routing works
            return caches.match('/index.html')
              .then((cached) => cached || caches.match('/offline.html'));
          })
      );
      return;
    }

    // Static assets — cache-first
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              return caches.match('/offline.html');
            });
        })
    );
  });
}
