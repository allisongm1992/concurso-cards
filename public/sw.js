const CACHE_NAME = 'concurso-cards-v3'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

// URLs that should never be cached
const NO_CACHE_PATTERNS = [
  '/auth/',
  '/rest/',
  'supabase.co',
  'googleapis.com/token',
]

function shouldCache(url) {
  return !NO_CACHE_PATTERNS.some(pattern => url.includes(pattern))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url

  // Skip caching for auth/API requests
  if (!shouldCache(url)) {
    event.respondWith(fetch(event.request))
    return
  }

  // Network first, fallback to cache for safe URLs
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
