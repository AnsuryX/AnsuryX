const CACHE_NAME = 'ansury-x-v1';
const STATIC_CACHE = 'ansury-x-static-v1';
const API_CACHE = 'ansury-x-api-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/hero-banner.jpg'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/cycles',
  '/api/habits',
  '/api/journal'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
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

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (request.destination === 'image' || request.url.includes('/assets/')) {
    // Images and assets - Cache First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // HTML, CSS, JS - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE));
  }
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'habit-completion') {
    event.waitUntil(syncHabitCompletions());
  } else if (event.tag === 'journal-entry') {
    event.waitUntil(syncJournalEntries());
  }
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Caching Strategies

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This feature requires an internet connection' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch from network:', error);
    return new Response('', { status: 404 });
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Network fetch failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Background Sync Functions

async function syncHabitCompletions() {
  try {
    const pendingCompletions = await getStoredData('pending-completions');
    
    for (const completion of pendingCompletions) {
      try {
        const response = await fetch('/api/habits/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completion)
        });
        
        if (response.ok) {
          await removeStoredData('pending-completions', completion.id);
        }
      } catch (error) {
        console.log('Failed to sync completion:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

async function syncJournalEntries() {
  try {
    const pendingEntries = await getStoredData('pending-journal-entries');
    
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        
        if (response.ok) {
          await removeStoredData('pending-journal-entries', entry.id);
        }
      } catch (error) {
        console.log('Failed to sync journal entry:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredData(storeName) {
  // Implementation would use IndexedDB to store/retrieve pending data
  return [];
}

async function removeStoredData(storeName, itemId) {
  // Implementation would remove item from IndexedDB
}