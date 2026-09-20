/**
 * PathUp service worker.
 *
 * Keeps the app shell available with no connection: navigations fall back to the cached page and
 * the app's own files are served from cache while a fresh copy is fetched in the background.
 * Anything that is not our own origin (Supabase, for instance) always goes to the network.
 */
const CACHE = 'pathup-shell-v1';
const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/fonts/inter-variable.woff2',
  '/fonts/barlow-condensed-600.woff2',
  '/fonts/barlow-condensed-700.woff2',
  '/icons/icon-192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/', response.clone());
    return response;
  } catch {
    return (await cache.match('/')) ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (
    /\/(_expo|fonts|icons|assets)\//.test(url.pathname) ||
    /\.(js|css|png|woff2|ico)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
  }
});
