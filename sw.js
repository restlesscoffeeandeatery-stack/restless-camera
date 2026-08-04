var CACHE = 'absensi-restless-v3';
var FILES = [
  '/restless-camera/app.html',
  '/restless-camera/pwa-index.html',
  '/restless-camera/camera.html',
  '/restless-camera/manifest.json',
  '/restless-camera/icon-192.png',
  '/restless-camera/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('script.google')!==-1 ||
      e.request.url.indexOf('googleusercontent')!==-1) return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match('/restless-camera/app.html');
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fresh = fetch(e.request).then(function(r) {
        if (r && r.ok) caches.open(CACHE).then(function(c){c.put(e.request,r.clone());});
        return r;
      }).catch(function() { return cached; });
      return cached || fresh;
    })
  );
});
