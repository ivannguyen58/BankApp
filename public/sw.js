const CACHE_NAME = 'vietbank-mobile-v1';
const urlsToCache = [
    '/',
    '/css/style.css',
    '/js/main.js',
    '/js/dashboard.js',
    '/js/transfer.js',
    '/auth/login',
    '/banking/dashboard'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});