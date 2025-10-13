import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface UseRealtimeConnectionOptions {
  channelName: string;
  onStateChange?: (status: ConnectionStatus) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export const useRealtimeConnection = ({
  channelName,
  onStateChange,
  autoReconnect = true,
  maxReconnectAttempts = 5,
}: UseRealtimeConnectionOptions) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const updateStatus = (newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStateChange?.(newStatus);
  };

  const connect = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    updateStatus('connecting');

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: 'user_presence' },
      },
    });

    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          if (payload.status === 'ok') {
            updateStatus('connected');
            setReconnectAttempts(0);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          updateStatus('connected');
          setReconnectAttempts(0);
          
          if (reconnectAttempts > 0) {
            toast({
              title: 'Reconnected',
              description: 'Real-time connection restored',
              duration: 3000,
            });
          }
        } else if (status === 'CHANNEL_ERROR') {
          updateStatus('error');
          
          if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, delay);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            toast({
              title: 'Connection Failed',
              description: 'Unable to establish real-time connection. Please refresh the page.',
              variant: 'destructive',
              duration: 10000,
            });
          }
        } else if (status === 'CLOSED') {
          updateStatus('disconnected');
        }
      });

    channelRef.current = channel;
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    updateStatus('disconnected');
  };

  const reconnect = () => {
    disconnect();
    setReconnectAttempts(0);
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [channelName]);

  return {
    status,
    channel: channelRef.current,
    reconnect,
    disconnect,
    reconnectAttempts,
  };
};
