import { useState, useEffect, useCallback } from 'react';

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Get service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setRegistration(reg);
          // Get existing subscription
          reg.pushManager.getSubscription().then(sub => {
            setSubscription(sub);
          });
        }
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration) {
      throw new Error('Service worker not registered');
    }

    if (permission !== 'granted') {
      await requestPermission();
    }

    // You would need to get your VAPID public key from your server
    const vapidPublicKey = 'your-vapid-public-key'; // This should come from environment
    
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      
      setSubscription(sub);
      
      // Send subscription to your server
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      });
      
      return sub;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [registration, permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Notify your server
      await fetch('/api/push-unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
  }, [subscription]);

  const showNotification = useCallback(async (options: PushNotificationOptions) => {
    if (!registration) {
      throw new Error('Service worker not registered');
    }

    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notificationOptions: any = {
      body: options.body,
      icon: options.icon || '/placeholder.svg',
      badge: options.badge || '/placeholder.svg',
      tag: options.tag,
      data: options.data,
      ...(options.actions && { actions: options.actions }),
      vibrate: [200, 100, 200],
    };

    await registration.showNotification(options.title, notificationOptions);
  }, [registration, permission]);

  return {
    permission,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}