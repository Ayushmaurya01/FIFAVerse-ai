const CACHE_NAME = 'fifaverse-ai-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⚡ PWA Service Worker: Caching critical shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker - Cleans up old stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('⚡ PWA Service Worker: Clearing stale cache node', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache Fetch Interceptor
self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/S requests, bypass chrome-extensions or dev-tools
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First strategy for HTML/Document navigation to ensure fresh bundle loads
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match(event.request);
        })
    );
    return;
  }

  // Cache-First strategy for assets (JS, CSS, images) which have unique hashes
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Assets fallback
        if (event.request.url.endsWith('.js') || event.request.url.endsWith('.css')) {
          return new Response('', { status: 408, statusText: 'Network request failed' });
        }
      });
    })
  );
});
