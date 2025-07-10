import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNotifications() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationCount();
    
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'maintenance_requests'
      }, () => {
        fetchNotificationCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotificationCount = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setNotificationCount(0);
        return;
      }

      // Count urgent maintenance requests, overdue tasks, etc.
      const { data: urgentMaintenance, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('priority', 'urgent')
        .eq('status', 'pending');

      if (maintenanceError) {
        console.error('Error fetching notifications:', maintenanceError);
        return;
      }

      // For now, just count urgent maintenance requests
      // In the future, you could add more notification sources
      setNotificationCount(urgentMaintenance?.length || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  return { notificationCount, loading, refetch: fetchNotificationCount };
}