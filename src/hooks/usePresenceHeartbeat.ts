import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceState {
  user_id: string;
  online_at: string;
  status?: 'active' | 'idle' | 'away';
}

export const usePresenceHeartbeat = (channelName: string, enabled = true) => {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const idleTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const updatePresence = async (status: 'active' | 'idle' | 'away') => {
    if (!channelRef.current || !user) return;

    const presenceState: PresenceState = {
      user_id: user.id,
      online_at: new Date().toISOString(),
      status,
    };

    await channelRef.current.track(presenceState);
  };

  const resetIdleTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Mark as active
    updatePresence('active');

    // Set idle after 5 minutes of inactivity
    idleTimeoutRef.current = setTimeout(() => {
      updatePresence('idle');
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    if (!enabled || !user) return;

    // Subscribe to presence channel
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence sync:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
          
          // Initial presence update
          await updatePresence('active');
          
          // Set up heartbeat - update every 30 seconds
          heartbeatIntervalRef.current = setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivityRef.current;
            const currentStatus = timeSinceActivity > 5 * 60 * 1000 ? 'idle' : 'active';
            updatePresence(currentStatus);
          }, 30000);
        }
      });

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    // Initial activity
    resetIdleTimer();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        resetIdleTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [channelName, enabled, user]);

  return { updatePresence, resetIdleTimer };
};
