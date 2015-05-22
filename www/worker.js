/* global self, caches, importScripts, Request, fetch */
"use strict";

importScripts("serviceworker-cache-polyfill.min.js");

var CACHE_VERSION = 1356730999;

var CURRENT_CACHES = new Map();
CURRENT_CACHES.set("read-through", "read-through-cache-v" + CACHE_VERSION);
CURRENT_CACHES.set("prefetch", "prefetch-cache-v" + CACHE_VERSION);

self.addEventListener("install", function (event) {
  var urlsToPrefetch = ["./", "./index.html", "./style.css", "./serviceworker-cache-polyfill.min.js", "./worker.min.js", "./fonts/fontello.woff", "./favicon.ico", "./js/utils/worker.min.js", "./dist/app.min.js", "./dist/worker-addons.min.js"];

  // Access logs via chrome://serviceworker-internals
  console.log("Handling install event. Resources to pre-fetch:", urlsToPrefetch);

  event.waitUntil(caches.open(CURRENT_CACHES.get("prefetch")).then(function (cache) {
    return cache.addAll(urlsToPrefetch.map(function (urlToPrefetch) {
      return new Request(urlToPrefetch, { mode: "no-cors" });
    })).then(function () {
      return console.log("All resources have been fetched and cached.");
    });
  })["catch"](function (error) {
    return console.error("Pre-fetching failed:", error);
  }));
});

self.addEventListener("activate", function (event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  var expectedCacheNames = Array.from(CURRENT_CACHES.keys());

  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.map(function (cacheName) {
      if (!expectedCacheNames.includes(cacheName)) {
        console.log("Deleting out of date cache:", cacheName);
        return caches["delete"](cacheName);
      }
    }));
  }));
});

self.addEventListener("fetch", function (event) {
  console.log("Handling fetch event for", event.request.url);

  event.respondWith(caches.match(event.request).then(function (response) {
    return response ? response : event.request.url.match(/https:\/\/offline.audio\//) ? fetch("https://offline.audio/") : event.request.url.match(/http:\/\/localhost\/.+/) ? caches.match("/index.html") : fetch(event.request.clone()).then(function (response) {
      // We clone the request stream as we want to consume it twice, by the brwoser and cache
      if (response.status < 400) {
        var responseClone = response.clone(); // We clone the response stream for the same reason as the request stream
        caches.open(CURRENT_CACHES.get("read-through")).then(function (cache) {
          return cache.put(event.request, responseClone);
        });
      }
      return response;
    });
  })["catch"](function (error) {
    // This isn't called for 404's but for match of fetch errors. 404's are valid responses.
    console.error("Read-through caching failed:", error);
    throw error;
  }));
});
