// Service Worker for Push Notifications
// Vacature-ORBIT Chat Push Notifications

const CACHE_NAME = 'vacature-orbit-v1';
const APP_NAME = 'Vacature ORBIT';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    notificationData = {
      title: 'Nieuw bericht',
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    };
  }

  const notificationOptions = {
    body: notificationData.body || 'U heeft een nieuw bericht ontvangen',
    icon: notificationData.icon || '/favicon.ico',
    badge: notificationData.badge || '/favicon.ico',
    image: notificationData.image,
    data: {
      url: notificationData.url || '/messages',
      threadId: notificationData.threadId,
      messageId: notificationData.messageId,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Bekijk bericht',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Negeren'
      }
    ],
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    tag: notificationData.threadId ? `message-${notificationData.threadId}` : 'message-general'
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || `${APP_NAME} - Nieuw bericht`,
      notificationOptions
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/messages';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          // Focus existing window and navigate to message
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            url: urlToOpen,
            data: event.notification.data
          });
          return;
        }
      }
      
      // Open new window if app is not open
      return clients.openWindow(urlToOpen);
    })
  );
});

// Background sync for offline message queue
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'message-sync') {
    event.waitUntil(syncMessages());
  }
});

// Sync offline messages when back online
async function syncMessages() {
  try {
    // Get offline messages from IndexedDB or cache
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        await sendMessage(message);
        await removeOfflineMessage(message.id);
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error during message sync:', error);
  }
}

// Helper functions for offline message handling
async function getOfflineMessages() {
  // Implementation would use IndexedDB to store offline messages
  return [];
}

async function sendMessage(message) {
  // Implementation would send message to server
  const response = await fetch('/api/messages/thread/' + message.threadId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${message.token}`
    },
    body: JSON.stringify({ content: message.content })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

async function removeOfflineMessage(messageId) {
  // Implementation would remove message from IndexedDB
  console.log('[SW] Removing offline message:', messageId);
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from app:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'STORE_OFFLINE_MESSAGE') {
    storeOfflineMessage(event.data.message);
  }
});

async function storeOfflineMessage(message) {
  // Store message for background sync when online
  console.log('[SW] Storing offline message:', message);
}