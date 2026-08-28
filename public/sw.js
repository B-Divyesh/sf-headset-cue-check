const VERSION = 'hcc-shell-v2';
const ASSET_CACHE = 'hcc-assets-v2';
const CORE = [
  '/manifest.webmanifest', '/offline.html', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png',
  '/assets/headset-specimen.webp', '/audio/field-sentence.wav', '/audio/left-channel.wav',
  '/audio/right-channel.wav', '/audio/interruption-sentence.wav'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const response = await fetch('/', { cache: 'reload' });
    const html = await response.text();
    await cache.put('/', new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    await cache.put('/index.html', new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/g)].map(match => match[1]);
    await cache.addAll([...new Set([...CORE, ...builtAssets])]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([VERSION, ASSET_CACHE]);
    await Promise.all((await caches.keys()).filter(key => !keep.has(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) (await caches.open(VERSION)).put(request, response.clone());
        return response;
      } catch {
        return (await caches.match('/', { ignoreVary: true })) || (await caches.match('/offline.html', { ignoreVary: true }));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(url.pathname, { ignoreSearch: true, ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) (await caches.open(ASSET_CACHE)).put(request, response.clone());
      return response;
    } catch {
      return new Response('Offline resource unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});
