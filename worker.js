importScripts('serviceworker-cache-polyfill.js');

var CACHE_VERSION = 1200;
var CURRENT_CACHES = {
  'read-through': 'read-through-cache-v' + CACHE_VERSION,
  'prefetch': 'prefetch-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var urlsToPrefetch = [
    './',
    './index.html',
    './style.css',
    './browser-polyfill.js',
    './js/app.js',
    './array-from.js',
    './worker.js',
    './fonts/fontello.woff',
    './favicon.ico',
    './pouchdb.min.js',
    './bluebird.min.js',
    './id3js.min.js',
    './blob-util.min.js',
    './runtime.min.js',
    './js/utils/worker.js',
    './js/utils/worker.min.js',
    './dist/app.js'
  ];

  // All of these logging statements should be visible via the "Inspect" interface
  // for the relevant SW accessed via chrome://serviceworker-internals
  console.log('Handling install event. Resources to pre-fetch:', urlsToPrefetch);

  event.waitUntil(
    caches.open(CURRENT_CACHES['prefetch']).then(function(cache) {
      return cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
        return new Request(urlToPrefetch, {mode: 'no-cors'});
      })).then(function() {
        console.log('All resources have been fetched and cached.');
      });
    }).catch(function(error) {
      // This catch() will handle any exceptions from the caches.open()/cache.addAll() steps.
      console.error('Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) == -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        // If there is an entry in the cache for event.request, then response will be defined
        // and we can just return it.
        console.log(' Found response in cache:', response);

        return response;
      } else {
        if (event.request.url.match(/https:\/\/offline.audio\//)) {
          return fetch('https://offline.audio/')
        } else if (event.request.url.match(/http:\/\/localhost:3000\/.+/)) {
          return caches.match('/index.html')
        } else {
          console.log(' No response for %s found in cache. About to fetch from network...', event.request.url);
          return fetch(event.request.clone()).then(function(response) {
            console.log('  Response for %s from network is: %O', event.request.url, response);
            if (response.status < 400) {
              var responseClone = response.clone()
              caches.open(CURRENT_CACHES['read-through']).then(function(cache) {
                cache.put(event.request, responseClone)
              })
            }

            // Return the original response object, which will be used to fulfill the resource request.
            return response;
          });
        }
      }
    }).catch(function(error) {
      // This catch() will handle exceptions that arise from the match() or fetch() operations.
      // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
      // It will return a normal response object that has the appropriate error code set.
      console.error('  Read-through caching failed:', error);

      throw error;
    })
  );
});
