import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeMetrics {
  activeConnections: number;
  lastUpdateTime: Date;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export function useRealTimeAdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeConnections: 0,
    lastUpdateTime: new Date(),
    connectionStatus: 'disconnected'
  });

  const [channels, setChannels] = useState<any[]>([]);

  // Handle real-time updates for properties
  const setupPropertiesChannel = useCallback(() => {
    const channel = supabase
      .channel('admin-properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Properties updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['propertyMetrics'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Property Added",
              description: `Property ${payload.new.address} has been added to the system.`,
            });
          }
        }
      )
      .subscribe();

    return channel;
  }, [queryClient, toast]);

  // Handle real-time updates for maintenance requests
  const setupMaintenanceChannel = useCallback(() => {
    const channel = supabase
      .channel('admin-maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Maintenance updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
          
          if (payload.eventType === 'INSERT' && payload.new.priority === 'urgent') {
            toast({
              title: "Urgent Maintenance Request",
              description: `New urgent request: ${payload.new.title}`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return channel;
  }, [queryClient, toast]);

  // Handle real-time updates for payments
  const setupPaymentsChannel = useCallback(() => {
    const channel = supabase
      .channel('admin-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payments updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['businessSummary'] });
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast({
              title: "Payment Received",
              description: `Payment of $${(payload.new.amount / 100).toFixed(2)} has been processed.`,
            });
          }
        }
      )
      .subscribe();

    return channel;
  }, [queryClient, toast]);

  // Handle real-time updates for tenants
  const setupTenantsChannel = useCallback(() => {
    const channel = supabase
      .channel('admin-tenants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants'
        },
        (payload) => {
          console.log('Tenants updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Tenant Added",
              description: `${payload.new.first_name} ${payload.new.last_name} has been added as a tenant.`,
            });
          }
        }
      )
      .subscribe();

    return channel;
  }, [queryClient, toast]);

  // Setup all real-time channels
  useEffect(() => {
    const activeChannels = [
      setupPropertiesChannel(),
      setupMaintenanceChannel(),
      setupPaymentsChannel(),
      setupTenantsChannel(),
    ];

    setChannels(activeChannels);
    setMetrics(prev => ({
      ...prev,
      activeConnections: activeChannels.length,
      connectionStatus: 'connected',
      lastUpdateTime: new Date()
    }));

    // Handle connection status
    const handleConnectionChange = (status: 'connected' | 'disconnected') => {
      setMetrics(prev => ({
        ...prev,
        connectionStatus: status,
        lastUpdateTime: new Date()
      }));

      if (status === 'disconnected') {
        // Removed disruptive connection-lost toast per user request
        // Previously showed a destructive toast here
      } else if (status === 'connected') {
        // Removed connection restored toast as well
      }
    };

    // Monitor connection status
    activeChannels.forEach(channel => {
      channel.on('system', { event: 'connected' }, () => handleConnectionChange('connected'));
      channel.on('system', { event: 'disconnected' }, () => handleConnectionChange('disconnected'));
    });

    return () => {
      activeChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setChannels([]);
      setMetrics(prev => ({
        ...prev,
        activeConnections: 0,
        connectionStatus: 'disconnected'
      }));
    };
  }, [setupPropertiesChannel, setupMaintenanceChannel, setupPaymentsChannel, setupTenantsChannel, toast]);

  // Manual refresh function
  const refreshAllData = useCallback(() => {
    const queries = [
      'properties',
      'propertyMetrics',
      'maintenanceRequests',
      'payments',
      'tenants',
      'businessSummary',
      'houseWatchingMetrics'
    ];

    queries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    });

    setMetrics(prev => ({
      ...prev,
      lastUpdateTime: new Date()
    }));

    toast({
      title: "Data Refreshed",
      description: "All dashboard data has been updated.",
    });
  }, [queryClient, toast]);

  return {
    metrics,
    refreshAllData,
    isConnected: metrics.connectionStatus === 'connected',
    activeChannels: channels.length,
  };
}