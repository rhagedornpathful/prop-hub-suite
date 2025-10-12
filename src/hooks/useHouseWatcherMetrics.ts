import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useHouseWatcherMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['house-watcher-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week

      // Get assigned properties
      const { data: assignedProperties, error: propertiesError } = await supabase
        .from('house_watching')
        .select(`
          *,
          properties:property_id (
            id,
            address,
            city,
            state,
            property_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      const propertyIds = assignedProperties?.map(p => p.property_id?.toString()).filter(Boolean) || [];

      // Get today's checks
      const { data: todayChecks } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today);

      // Get this week's checks
      const { data: weekChecks } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', weekStart.toISOString().split('T')[0])
        .lte('scheduled_date', weekEnd.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      // Get recent completed checks (last 10)
      const { data: recentChecks } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      // Get pending maintenance requests I created
      const { data: maintenanceRequests } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      // Calculate metrics
      const totalProperties = assignedProperties?.length || 0;
      const checksScheduledToday = todayChecks?.filter(c => c.status === 'scheduled').length || 0;
      const checksCompletedToday = todayChecks?.filter(c => c.status === 'completed').length || 0;
      
      // Find next check due
      const upcomingChecks = weekChecks?.filter(c => 
        c.status === 'scheduled' && 
        new Date(c.scheduled_date) >= new Date(today)
      ) || [];
      const nextCheck = upcomingChecks[0] || null;

      // This year's completed checks
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { data: yearChecks } = await supabase
        .from('home_check_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', yearStart);

      const totalChecksThisYear = yearChecks?.length || 0;

      // Properties needing attention (overdue checks)
      const propertiesNeedingAttention = assignedProperties?.filter(p => {
        if (!p.next_check_date) return false;
        return new Date(p.next_check_date) < new Date(today);
      }) || [];

      return {
        assignedProperties: assignedProperties || [],
        totalProperties,
        checksScheduledToday,
        checksCompletedToday,
        nextCheck,
        weekChecks: weekChecks || [],
        recentChecks: recentChecks || [],
        maintenanceRequests: maintenanceRequests || [],
        totalChecksThisYear,
        propertiesNeedingAttention: propertiesNeedingAttention.length,
      };
    },
    enabled: !!user,
  });
}
