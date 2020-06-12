const VERSION = "1.0";
const CACHE_VERSION = "tour19" + VERSION;
const OFFLINE_URL = "/offline";

let cacheablePages = [
    "/"
];

// Pre-Cache all cacheable pags
self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_VERSION)
        .then(cache => {
            return cache.addAll(cacheablePages);
        })
        .then(() => {
            return self.skipWaiting();
        })
   );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (CACHE_VERSION !== cacheName) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    // it can be empty if you just want to get rid of that error
});