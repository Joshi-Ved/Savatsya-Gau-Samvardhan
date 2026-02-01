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

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found
          if (response) {
            return response;
          }

          // Otherwise fetch from network
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Return offline page if available
              return caches.match('/offline.html');
            });
        })
    );
  });
}
