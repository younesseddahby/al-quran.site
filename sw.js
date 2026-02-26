// A more robust and optimized service worker
const STATIC_CACHE_NAME = 'al-quran-app-static-v4';
const DYNAMIC_CACHE_NAME = 'al-quran-app-dynamic-v4';
const AUDIO_CACHE_NAME = 'al-quran-app-audio-v1';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.js',
  '/App.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Naskh+Arabic:wght@400;700&family=Scheherazade+New:wght@400;700&family=Reem+Kufi:wght@400..700&family=Lateef&family=Alkalami&family=Vazirmatn:wght@100..900&family=Gulzar&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key !== AUDIO_CACHE_NAME)
          .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Audio Strategy: Cache First
  if (url.hostname.includes('mp3quran.net') || url.hostname.includes('everyayah.com')) {
    event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
    return;
  }

  // API Strategy: Stale-While-Revalidate
  const apiHosts = ['api.aladhan.com', 'api.alquran.cloud', 'nominatim.openstreetmap.org'];
  if (apiHosts.some(host => url.hostname.includes(host))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cached => {
          const fetched = fetch(event.request).then(network => {
            if (network.ok) cache.put(event.request, network.clone());
            return network;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // General Strategy: Network First
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request) || caches.match('/index.html'))
  );
});