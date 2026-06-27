var CACHE = 'absensi-restless-v2';
var FILES = [
  '/restless-camera/app.html',
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
  if (e.request.url.indexOf('script.google')!==-1 ||
      e.request.url.indexOf('googleusercontent')!==-1) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      var rc = r.clone();
      caches.open(CACHE).then(function(c){c.put(e.request,rc);});
      return r;
    }).catch(function() { return caches.match(e.request); })
  );
});
