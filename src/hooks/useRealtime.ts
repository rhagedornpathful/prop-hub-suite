import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Properties real-time updates
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties'
      }, (payload) => {
        console.log('Properties change:', payload);
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['property-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['business-summary'] });
        
        // Show notification for changes by other users
        if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id !== user.id) {
          toast({
            title: "Property Updated",
            description: "A property has been updated by another user.",
          });
        }
      })
      .subscribe();

    // House watching real-time updates
    const houseWatchingChannel = supabase
      .channel('house-watching-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'house_watching'
      }, (payload) => {
        console.log('House watching change:', payload);
        
        queryClient.invalidateQueries({ queryKey: ['house-watching'] });
        queryClient.invalidateQueries({ queryKey: ['house-watching-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['business-summary'] });
        
        if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id !== user.id) {
          toast({
            title: "House Watching Updated",
            description: "A house watching service has been updated by another user.",
          });
        }
      })
      .subscribe();

    // Profiles real-time updates
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Profile change:', payload);
        
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        
        if (payload.eventType === 'UPDATE') {
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated.",
          });
        }
      })
      .subscribe();

    // User roles real-time updates
    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('User roles change:', payload);
        
        queryClient.invalidateQueries({ queryKey: ['user-roles', user.id] });
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "Role Added",
            description: "A new role has been assigned to you.",
          });
        } else if (payload.eventType === 'DELETE') {
          toast({
            title: "Role Removed",
            description: "A role has been removed from your account.",
          });
        }
      })
      .subscribe();

    channelsRef.current = [propertiesChannel, houseWatchingChannel, profilesChannel, rolesChannel];

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [user, queryClient, toast]);

  // Conflict resolution utility
  const resolveConflict = async (table: string, id: string, clientVersion: any, serverVersion: any) => {
    // Simple conflict resolution strategy: server wins, but notify user
    toast({
      title: "Conflict Detected",
      description: `The ${table} was modified by another user. Your changes have been overridden.`,
      variant: "destructive",
    });
    
    // Could implement more sophisticated strategies here:
    // - Last write wins
    // - Merge changes
    // - Let user choose
    
    return serverVersion;
  };

  return {
    resolveConflict,
  };
};