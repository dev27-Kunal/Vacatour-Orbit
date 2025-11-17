// Push Notifications Service
// Handles Web Push API integration for real-time chat notifications

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: BufferSource;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  threadId?: string;
  messageId?: string;
}

interface PushNotificationService {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

class PushNotificationManager {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Will be set via environment
  public isSupported: boolean;

  constructor() {
    // Check if push notifications are supported
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Initialize push notifications
   */
  async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('[Push] Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[Push] Service Worker registered:', this.serviceWorkerRegistration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return true;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    console.log('[Push] Notification permission:', permission);
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('[Push] Service Worker not registered');
      return null;
    }

    if (Notification.permission !== 'granted') {
      console.error('[Push] Notification permission not granted');
      return null;
    }

    try {
      // Check for existing subscription
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();

      if (!this.pushSubscription) {
        // Create new subscription
        const subscriptionOptions: PushSubscriptionOptions = {
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
        };

        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe(subscriptionOptions);
      }

      console.log('[Push] Push subscription created:', this.pushSubscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.pushSubscription);

      return this.pushSubscription;
    } catch (error) {
      console.error('[Push] Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.pushSubscription) {
      return true;
    }

    try {
      const success = await this.pushSubscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer();
        this.pushSubscription = null;
        console.log('[Push] Successfully unsubscribed from push notifications');
      }

      return success;
    } catch (error) {
      console.error('[Push] Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<PushNotificationService> {
    const permission = Notification.permission;
    let subscription: PushSubscription | null = null;

    if (this.serviceWorkerRegistration) {
      try {
        subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      } catch (error) {
        console.error('[Push] Error getting subscription:', error);
      }
    }

    return {
      isSupported: this.isSupported,
      permission,
      subscription
    };
  }

  /**
   * Show local notification (fallback when push is not available)
   */
  showLocalNotification(payload: NotificationPayload): void {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      data: {
        url: payload.url,
        threadId: payload.threadId,
        messageId: payload.messageId
      },
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      if (payload.url) {
        window.location.href = payload.url;
      }
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    console.log('[Push] Message from Service Worker:', event.data);

    if (event.data.type === 'NOTIFICATION_CLICKED') {
      // Handle notification click
      const { url, data } = event.data;
      
      if (url && url !== window.location.pathname) {
        window.location.href = url;
      }

      // Emit custom event for app to handle
      window.dispatchEvent(new CustomEvent('pushNotificationClicked', {
        detail: { url, data }
      }));
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save push subscription');
      }

      console.log('[Push] Subscription saved to server');
    } catch (error) {
      console.error('[Push] Error saving subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications/push-subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove push subscription');
      }

      console.log('[Push] Subscription removed from server');
    } catch (error) {
      console.error('[Push] Error removing subscription from server:', error);
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Set VAPID public key (called from environment config)
   */
  setVapidKey(key: string): void {
    this.vapidPublicKey = key;
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();

// Export types
export type {
  PushNotificationService,
  NotificationPayload
};