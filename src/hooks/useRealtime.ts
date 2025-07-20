import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export const useRealtime = () => {
  const queryClient = useQueryClient();

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    toast({
      title: 'Real-time Update',
      description: message,
      variant: type === 'warning' ? 'destructive' : 'default',
    });
  }, []);

  useEffect(() => {
    // Listen to properties changes
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Properties change:', payload);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          
          if (payload.eventType === 'INSERT') {
            showNotification('New property added', 'success');
          } else if (payload.eventType === 'UPDATE') {
            showNotification('Property updated', 'info');
          }
        }
      )
      .subscribe();

    // Listen to maintenance requests changes
    const maintenanceChannel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Maintenance change:', payload);
          queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
          
          if (payload.eventType === 'INSERT') {
            showNotification('New maintenance request created', 'info');
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            if (newRecord?.status === 'completed') {
              showNotification('Maintenance request completed', 'success');
            } else if (newRecord?.status === 'in-progress') {
              showNotification('Maintenance request in progress', 'info');
            }
          }
        }
      )
      .subscribe();

    // Listen to tenants changes
    const tenantsChannel = supabase
      .channel('tenants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants'
        },
        (payload) => {
          console.log('Tenants change:', payload);
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
          
          if (payload.eventType === 'INSERT') {
            showNotification('New tenant added', 'success');
          }
        }
      )
      .subscribe();

    // Listen to messages for real-time chat
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(maintenanceChannel);
      supabase.removeChannel(tenantsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [queryClient, showNotification]);

  return {
    // Could return real-time connection status if needed
    isConnected: true
  };
};