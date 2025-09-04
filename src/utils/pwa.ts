// PWA utilities for service worker registration and offline handling

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              showUpdateAvailableNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const showUpdateAvailableNotification = () => {
  if (window.confirm('A new version is available. Reload to update?')) {
    window.location.reload();
  }
};

export const checkOnlineStatus = () => {
  return navigator.onLine;
};

export const setupOfflineHandling = () => {
  window.addEventListener('online', () => {
    console.log('Back online');
    // Trigger sync of pending data
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_PENDING_DATA' });
    }
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
    // Show offline indicator
    showOfflineIndicator();
  });
};

export const showOfflineIndicator = () => {
  // This could show a toast or banner indicating offline status
  console.log('App is now offline. Changes will be synced when connection is restored.');
};

export const queueOfflineAction = (action: any) => {
  // Store action in IndexedDB for later sync
  const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  pendingActions.push({
    ...action,
    timestamp: Date.now(),
    id: crypto.randomUUID()
  });
  localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
};

export const processPendingActions = async () => {
  const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  
  for (const action of pendingActions) {
    try {
      // Process each pending action
      await processAction(action);
      
      // Remove from pending list
      const remainingActions = pendingActions.filter((a: any) => a.id !== action.id);
      localStorage.setItem('pendingActions', JSON.stringify(remainingActions));
    } catch (error) {
      console.error('Failed to process pending action:', error);
    }
  }
};

const processAction = async (action: any) => {
  // Implementation would handle different action types
  switch (action.type) {
    case 'HABIT_COMPLETION':
      // Send habit completion to server
      break;
    case 'JOURNAL_ENTRY':
      // Send journal entry to server
      break;
    default:
      console.warn('Unknown action type:', action.type);
  }
};

export const showInstallPrompt = () => {
  // This would be called from a beforeinstallprompt event listener
  console.log('Install prompt shown');
};

export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};