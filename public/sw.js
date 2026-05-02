const CACHE_NAME = "mg-portfolio-v2";
const RUNTIME_CACHE = "mg-portfolio-runtime";
const IMAGES_CACHE = "mg-portfolio-images";
const ASSETS_CACHE = "mg-portfolio-assets";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/favicons/favicon.ico",
  "/favicons/favicon-16x16.png",
  "/favicons/favicon-32x32.png",
  "/favicons/apple-touch-icon.png",
];

const ASSET_PATTERNS = [
  /\.(js|css|woff|woff2|ttf|eot|otf)$/,
];

const IMAGE_PATTERNS = [
  /\.(png|jpg|jpeg|webp|svg|gif)$/,
];

// Install event - precache important assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== IMAGES_CACHE &&
            cacheName !== ASSETS_CACHE
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET methods
  if (url.origin !== self.location.origin || request.method !== "GET") {
    return;
  }

  // Navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request) || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Asset requests (CSS, JS, fonts)
  if (ASSET_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request)
            .then((response) => {
              const clonedResponse = response.clone();
              caches.open(ASSETS_CACHE).then((cache) => {
                cache.put(request, clonedResponse);
              });
              return response;
            })
            .catch(() => new Response("Asset unavailable offline", { status: 503 }))
        );
      })
    );
    return;
  }

  // Image requests
  if (IMAGE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request)
            .then((response) => {
              const clonedResponse = response.clone();
              caches.open(IMAGES_CACHE).then((cache) => {
                cache.put(request, clonedResponse);
              });
              return response;
            })
            .catch(() => {
              // Return placeholder for missing images
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f3f4f6" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Image unavailable</text></svg>',
                {
                  headers: { "Content-Type": "image/svg+xml" },
                }
              );
            })
        );
      })
    );
    return;
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request) || new Response(JSON.stringify({ error: "Offline" }), {
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }

  // Default strategy: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request)
          .then((response) => {
            const clonedResponse = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
            return response;
          })
          .catch(() => new Response("Resource unavailable offline", { status: 503 }))
      );
    })
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((cacheNames) => {
      Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    });
  }
});
