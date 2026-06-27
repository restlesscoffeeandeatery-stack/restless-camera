// Service Worker — Absensi Restless PWA
var CACHE_NAME = 'absensi-restless-v1';
var CACHE_URLS = [
  '/restless-camera/camera.html',
  '/restless-camera/manifest.json',
  '/restless-camera/icon-192.png',
  '/restless-camera/icon-512.png'
];

// Install — cache semua asset
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback ke cache
self.addEventListener('fetch', function(e) {
  // Jangan cache request ke Apps Script (selalu network)
  if (e.request.url.indexOf('script.google') !== -1 ||
      e.request.url.indexOf('googleusercontent') !== -1) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        // Simpan response baru ke cache
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(function() {
        // Offline — ambil dari cache
        return caches.match(e.request);
      })
  );
});
