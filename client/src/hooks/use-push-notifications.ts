import { useState, useEffect, useCallback } from 'react';
import { pushNotificationManager, type PushNotificationService, type NotificationPayload } from '@/services/push-notifications';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showLocalNotification: (payload: NotificationPayload) => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useApp();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PushNotificationService>({
    isSupported: false,
    permission: 'default',
    subscription: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize push notifications
  useEffect(() => {
    let mounted = true;

    const initializePushNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize service worker and push manager
        const initialized = await pushNotificationManager.init();
        
        if (!initialized) {
          if (mounted) {
            setError('Push notifications not supported');
            setIsLoading(false);
          }
          return;
        }

        // Get current subscription status
        const currentStatus = await pushNotificationManager.getSubscriptionStatus();
        
        if (mounted) {
          setStatus(currentStatus);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[Push Hook] Initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize push notifications');
          setIsLoading(false);
        }
      }
    };

    initializePushNotifications();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for notification clicks
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      console.log('[Push Hook] Notification clicked:', event.detail);
      
      // You can handle navigation or other actions here
      const { url, data } = event.detail;
      
      // Show toast notification
      toast({
        title: 'Bericht geopend',
        description: 'U bent naar het gesprek geleid.',
      });
    };

    window.addEventListener('pushNotificationClicked', handleNotificationClick as EventListener);

    return () => {
      window.removeEventListener('pushNotificationClicked', handleNotificationClick as EventListener);
    };
  }, [toast]);

  // Request permission from user
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const permission = await pushNotificationManager.requestPermission();
      
      setStatus(prev => ({ ...prev, permission }));
      
      const success = permission === 'granted';
      
      if (success) {
        toast({
          title: 'Notificaties ingeschakeld',
          description: 'U ontvangt nu notificaties voor nieuwe berichten.',
        });
      } else {
        toast({
          title: 'Notificaties geweigerd',
          description: 'U kunt notificaties inschakelen via uw browserinstellingen.',
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return success;
    } catch (err) {
      console.error('[Push Hook] Permission request error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Fout bij notificaties',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, [toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Niet ingelogd',
        description: 'Log in om notificaties in te schakelen.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request permission first if not granted
      if (status.permission !== 'granted') {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          setIsLoading(false);
          return false;
        }
      }

      const subscription = await pushNotificationManager.subscribe();
      
      setStatus(prev => ({ ...prev, subscription }));
      
      const success = subscription !== null;
      
      if (success) {
        toast({
          title: 'Notificaties ingeschakeld',
          description: 'U ontvangt nu push notificaties voor nieuwe berichten.',
        });
      } else {
        throw new Error('Failed to create push subscription');
      }

      setIsLoading(false);
      return success;
    } catch (err) {
      console.error('[Push Hook] Subscribe error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Fout bij abonneren',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, [user, status.permission, requestPermission, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationManager.unsubscribe();
      
      if (success) {
        setStatus(prev => ({ ...prev, subscription: null }));
        
        toast({
          title: 'Notificaties uitgeschakeld',
          description: 'U ontvangt geen push notificaties meer.',
        });
      } else {
        throw new Error('Failed to unsubscribe from push notifications');
      }

      setIsLoading(false);
      return success;
    } catch (err) {
      console.error('[Push Hook] Unsubscribe error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Fout bij uitschakelen',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, [toast]);

  // Show local notification (fallback)
  const showLocalNotification = useCallback((payload: NotificationPayload): void => {
    if (!status.isSupported || status.permission !== 'granted') {
      // Fallback to toast notification
      toast({
        title: payload.title,
        description: payload.body,
      });
      return;
    }

    pushNotificationManager.showLocalNotification(payload);
  }, [status.isSupported, status.permission, toast]);

  return {
    isSupported: status.isSupported,
    permission: status.permission,
    isSubscribed: status.subscription !== null,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification
  };
}