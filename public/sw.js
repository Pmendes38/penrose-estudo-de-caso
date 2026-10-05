const CACHE_NAME = 'penrose-v1.2.0';
const STATIC_CACHE_NAME = 'penrose-static-v1.2.0';
const DYNAMIC_CACHE_NAME = 'penrose-dynamic-v1.2.0';

// Assets que devem ser cached imediatamente
const STATIC_ASSETS = [
  '/assets/wide-logo.svg',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// URLs que nunca devem ser cached
const NEVER_CACHE = [
  '/api/',
  '/admin/',
  '/_next/webpack-hmr',
  '/_next/image',
  '/assets/catalog/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip URLs that should never be cached
  if (NEVER_CACHE.some(pattern => url.pathname.startsWith(pattern))) {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Documents must be network-first so a new deployment is never hidden by
  // stale application HTML. The cached offline page remains the fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => caches.match('/offline.html'))
    );
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response (streams can only be consumed once)
            const responseToCache = response.clone();
            
            // Determine which cache to use
            const cacheName = STATIC_ASSETS.includes(url.pathname)
              ? STATIC_CACHE_NAME 
              : DYNAMIC_CACHE_NAME;
            
            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                console.log('[SW] Caching new resource:', request.url);
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Return placeholder for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1f2937"/><text x="100" y="100" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="14">Imagem indisponível</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            throw error;
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    console.log('[SW] Background sync: cart');
    event.waitUntil(syncCart());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação da Penrøse',
    icon: '/web-app-manifest-192x192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver produtos',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Penrøse', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/produtos')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync cart data
async function syncCart() {
  try {
    // Get cart data from IndexedDB or localStorage
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cartData.length > 0) {
      // Send to server
      const response = await fetch('/api/sync-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart: cartData })
      });
      
      if (response.ok) {
        console.log('[SW] Cart synced successfully');
        localStorage.removeItem('cart-pending-sync');
      }
    }
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
  }
}
