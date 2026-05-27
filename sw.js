// Phorya Service Worker
// © 2026 Ivory Lewis. All rights reserved.

const CACHE_NAME = 'phorya-v7';
const STATIC_CACHE = 'phorya-static-v7';
const FONT_CACHE = 'phorya-fonts-v1';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/Phorya/',
  '/Phorya/index.html',
  '/Phorya/manifest.json',
  '/Phorya/sw.js',
];

// Font URLs to cache
const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// ─── INSTALL ───────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== FONT_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ─────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept Anthropic API calls — always go to network
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(request));
    return;
  }

  // Font requests — cache first, network fallback
  if (FONT_ORIGINS.some(origin => request.url.startsWith(origin))) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response('', { status: 408 }));
        })
      )
    );
    return;
  }

  // App shell (HTML + assets) — cache first, network fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          // Always try network for HTML to get updates
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response('Offline', { status: 503 }));

          // Return cached immediately, update in background
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Everything else — network only
  event.respondWith(fetch(request).catch(() => new Response('', { status: 408 })));
});

// ─── BACKGROUND SYNC (session backup) ──────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sessions') {
    // Placeholder for future cloud sync feature
    event.waitUntil(Promise.resolve());
  }
});

// ─── PUSH NOTIFICATIONS (future) ───────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'InterviewLens', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
