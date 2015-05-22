/* global self, caches, importScripts, Request, fetch */
importScripts('serviceworker-cache-polyfill.min.js')

const CACHE_VERSION = 1356730999

const CURRENT_CACHES = new Map()
CURRENT_CACHES.set('read-through', 'read-through-cache-v' + CACHE_VERSION)
CURRENT_CACHES.set('prefetch', 'prefetch-cache-v' + CACHE_VERSION)

self.addEventListener('install', event => {
  const urlsToPrefetch = [
    './',
    './index.html',
    './style.css',
    './serviceworker-cache-polyfill.min.js',
    './worker.min.js',
    './fonts/fontello.woff',
    './favicon.ico',
    './js/utils/worker.min.js',
    './dist/app.min.js',
    './dist/worker-addons.min.js'
  ]

  // Access logs via chrome://serviceworker-internals
  console.log('Handling install event. Resources to pre-fetch:', urlsToPrefetch)

  event.waitUntil(
    caches.open(CURRENT_CACHES.get('prefetch')).then(cache =>
      cache.addAll(urlsToPrefetch.map(urlToPrefetch =>
        new Request(urlToPrefetch, {mode: 'no-cors'})
      )).then(() => console.log('All resources have been fetched and cached.'))
    ).catch(error => console.error('Pre-fetching failed:', error))
  )
})

self.addEventListener('activate', event => {
  // Delete all caches that aren't named in CURRENT_CACHES.
  var expectedCacheNames = Array.from(CURRENT_CACHES.keys())

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!expectedCacheNames.includes(cacheName)) {
            console.log('Deleting out of date cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
})

self.addEventListener('fetch', event => {
  console.log('Handling fetch event for', event.request.url)

  event.respondWith(
    caches.match(event.request).then(response =>
      response ?
        response
        : (event.request.url.match(/https:\/\/offline.audio\//)) ?
          fetch('https://offline.audio/')
        : (event.request.url.match(/http:\/\/localhost\/.+/)) ?
          caches.match('/index.html')
        : fetch(event.request.clone()).then(response => { // We clone the request stream as we want to consume it twice, by the brwoser and cache
            if (response.status < 400) {
              var responseClone = response.clone() // We clone the response stream for the same reason as the request stream
              caches.open(CURRENT_CACHES.get('read-through')).then(cache =>
                cache.put(event.request, responseClone)
              )
            }
            return response
          })
    ).catch(error => {
      // This isn't called for 404's but for match of fetch errors. 404's are valid responses.
      console.error('Read-through caching failed:', error)
      throw error
    })
  )
})
