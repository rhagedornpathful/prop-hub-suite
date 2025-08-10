import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationData {
  id: string;
  type: 'maintenance_request' | 'payment_update' | 'message' | 'emergency' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'away' | 'busy';
  current_page?: string;
}

export const useRealTimeNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Initialize real-time subscriptions
  useEffect(() => {
    const setupRealTime = async () => {
      // Subscribe to maintenance requests updates
      const maintenanceChannel = supabase
        .channel('maintenance-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'maintenance_requests'
          },
          (payload) => {
            console.log('Maintenance update:', payload);
            
            const record = payload.new || payload.old || {};
            const notification: NotificationData = {
              id: `maintenance-${(record as any)?.id || Date.now()}-${Date.now()}`,
              type: 'maintenance_request',
              title: 'Maintenance Update',
              message: payload.eventType === 'INSERT' 
                ? `New maintenance request: ${(record as any)?.title || 'Unknown'}`
                : payload.eventType === 'UPDATE'
                ? `Maintenance request updated: ${(record as any)?.title || 'Unknown'}`
                : `Maintenance request deleted`,
              timestamp: new Date().toISOString(),
              read: false,
              data: record
            };

            addNotification(notification);
          }
        )
        .subscribe();

      // Subscribe to payment updates
      const paymentChannel = supabase
        .channel('payment-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments'
          },
          (payload) => {
            console.log('Payment update:', payload);
            
            const paymentRecord = payload.new || payload.old || {};
            const notification: NotificationData = {
              id: `payment-${(paymentRecord as any)?.id || Date.now()}-${Date.now()}`,
              type: 'payment_update',
              title: 'Payment Update',
              message: payload.eventType === 'INSERT' 
                ? `New payment: $${((paymentRecord as any)?.amount / 100)?.toFixed(2) || '0.00'}`
                : payload.eventType === 'UPDATE'
                ? `Payment status updated: ${(paymentRecord as any)?.status || 'unknown'}`
                : `Payment deleted`,
              timestamp: new Date().toISOString(),
              read: false,
              data: paymentRecord
            };

            addNotification(notification);
          }
        )
        .subscribe();

      // Subscribe to user presence
      const presenceChannel = supabase
        .channel('user-presence')
        .on('presence', { event: 'sync' }, () => {
          const newState = presenceChannel.presenceState();
          const users = Object.keys(newState).map(userId => {
            const presence = newState[userId][0] || {};
            return {
              user_id: userId,
              online_at: (presence as any)?.online_at || new Date().toISOString(),
              status: (presence as any)?.status || 'online',
              current_page: (presence as any)?.current_page,
            } as UserPresence;
          });
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe();

      setChannel(presenceChannel);

      return () => {
        maintenanceChannel.unsubscribe();
        paymentChannel.unsubscribe();
        presenceChannel.unsubscribe();
      };
    };

    setupRealTime();
  }, []);

  // Track user presence
  const trackPresence = useCallback(async (status: 'online' | 'away' | 'busy' = 'online') => {
    if (!channel) return;

    const userStatus: UserPresence = {
      user_id: 'current-user',
      online_at: new Date().toISOString(),
      status,
      current_page: window.location.pathname,
    };

    await channel.track(userStatus);
  }, [channel]);

  // Add notification
  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only latest 50
    setUnreadCount(prev => prev + 1);

    // Show toast for important notifications
    if (notification.type === 'emergency' || notification.type === 'maintenance_request') {
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    }
  }, [toast]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Send custom notification to all connected users
  const broadcastNotification = useCallback(async (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    try {
      // In a real app, this would send through a broadcast channel or push to all users
      const customNotification: NotificationData = {
        ...notification,
        id: `custom-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      addNotification(customNotification);
      
      console.log('Broadcasting notification:', customNotification);
      
      toast({
        title: "Notification Sent",
        description: `${notification.type.toUpperCase()} notification broadcasted`,
      });
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      toast({
        title: "Broadcast Failed",
        description: "Failed to send notification to all users",
        variant: "destructive",
      });
    }
  }, [addNotification, toast]);

  return {
    notifications,
    unreadCount,
    onlineUsers,
    trackPresence,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    broadcastNotification,
  };
};