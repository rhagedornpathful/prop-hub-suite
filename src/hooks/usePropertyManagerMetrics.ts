import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePropertyManagerMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property-manager-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7) + '-01';
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Get assigned properties via property_manager_assignments
      const { data: assignments } = await supabase
        .from('property_manager_assignments')
        .select('property_id')
        .eq('manager_user_id', user.id);

      const propertyIds = assignments?.map(a => a.property_id) || [];

      if (propertyIds.length === 0) {
        return {
          assignedProperties: [],
          totalProperties: 0,
          occupiedUnits: 0,
          vacantUnits: 0,
          maintenanceByPriority: { high: 0, medium: 0, low: 0 },
          rentCollectionRate: 0,
          showingsThisWeek: 0,
          unreadMessages: 0,
          overdueMaintenance: [],
          vacantProperties: [],
          lateRentPayments: [],
          upcomingLeaseExpirations: [],
          weekSchedule: [],
          maintenanceRequests: [],
          recentActivity: [],
        };
      }

      // Get properties with tenant info
      const { data: properties } = await supabase
        .from('properties')
        .select(`
          *,
          tenants (
            id,
            first_name,
            last_name,
            lease_end_date,
            status
          )
        `)
        .in('id', propertyIds);

      // Get maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      // Get rent rolls for current month
      const { data: rentRolls } = await supabase
        .from('rent_rolls')
        .select('*')
        .in('property_id', propertyIds)
        .eq('month_year', currentMonth);

      // Get property tours/showings this week
      const { data: tours } = await supabase
        .from('property_tours')
        .select('*')
        .in('property_id', propertyIds)
        .gte('scheduled_date', weekStart.toISOString().split('T')[0])
        .lte('scheduled_date', weekEnd.toISOString().split('T')[0]);

      // Get conversations for unread messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner (
            user_id,
            last_read_at
          )
        `)
        .eq('conversation_participants.user_id', user.id);

      // Calculate metrics
      const totalProperties = properties?.length || 0;
      const occupiedUnits = properties?.filter(p => 
        p.tenants && p.tenants.length > 0 && p.tenants.some((t: any) => t.status === 'active')
      ).length || 0;
      const vacantUnits = totalProperties - occupiedUnits;

      // Maintenance by priority
      const activeMaintenance = maintenance?.filter(m => 
        m.status !== 'completed' && m.status !== 'cancelled'
      ) || [];
      const maintenanceByPriority = {
        high: activeMaintenance.filter(m => m.priority === 'urgent' || m.priority === 'high').length,
        medium: activeMaintenance.filter(m => m.priority === 'medium').length,
        low: activeMaintenance.filter(m => m.priority === 'low').length,
      };

      // Rent collection rate
      const totalRentDue = rentRolls?.reduce((sum, r) => sum + Number(r.rent_amount || 0), 0) || 0;
      const totalCollected = rentRolls?.reduce((sum, r) => sum + Number(r.amount_collected || 0), 0) || 0;
      const rentCollectionRate = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;

      // Showings this week
      const showingsThisWeek = tours?.length || 0;

      // Unread messages (simplified - would need more complex logic)
      const unreadMessages = conversations?.length || 0;

      // Overdue maintenance
      const overdueMaintenance = maintenance?.filter(m => 
        m.due_date && 
        new Date(m.due_date) < today && 
        m.status !== 'completed' && 
        m.status !== 'cancelled'
      ) || [];

      // Vacant properties
      const vacantProperties = properties?.filter(p => 
        !p.tenants || p.tenants.length === 0 || !p.tenants.some((t: any) => t.status === 'active')
      ) || [];

      // Late rent payments
      const lateRentPayments = rentRolls?.filter(r => 
        r.status === 'due' && 
        r.due_date && 
        new Date(r.due_date) < today
      ) || [];

      // Upcoming lease expirations
      const upcomingLeaseExpirations = properties?.flatMap(p => 
        (p.tenants || []).filter((t: any) => {
          if (!t.lease_end_date) return false;
          const leaseEnd = new Date(t.lease_end_date);
          return leaseEnd >= today && leaseEnd <= thirtyDaysFromNow;
        }).map((t: any) => ({
          ...t,
          property_address: p.address,
          property_id: p.id,
        }))
      ) || [];

      // This week's schedule (showings + maintenance)
      const weekSchedule = [
        ...(tours?.map(t => ({
          id: t.id,
          type: 'showing' as const,
          date: t.scheduled_date,
          time: t.scheduled_time,
          property_id: t.property_id,
          title: 'Property Showing',
        })) || []),
        ...(maintenance?.filter(m => 
          m.scheduled_date && 
          new Date(m.scheduled_date) >= weekStart && 
          new Date(m.scheduled_date) <= weekEnd
        ).map(m => ({
          id: m.id,
          type: 'maintenance' as const,
          date: m.scheduled_date,
          time: null,
          property_id: m.property_id,
          title: m.title,
        })) || []),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recent activity (last 10 events)
      const recentActivity = [
        ...(maintenance?.slice(0, 5).map(m => ({
          id: m.id,
          type: 'maintenance' as const,
          title: m.title,
          date: m.created_at,
          property_id: m.property_id,
        })) || []),
        ...(rentRolls?.filter(r => r.paid_date).slice(0, 5).map(r => ({
          id: r.id,
          type: 'payment' as const,
          title: `Rent payment received - $${r.amount_collected}`,
          date: r.paid_date,
          property_id: r.property_id,
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      return {
        assignedProperties: properties || [],
        totalProperties,
        occupiedUnits,
        vacantUnits,
        maintenanceByPriority,
        rentCollectionRate,
        showingsThisWeek,
        unreadMessages,
        overdueMaintenance,
        vacantProperties,
        lateRentPayments,
        upcomingLeaseExpirations,
        weekSchedule,
        maintenanceRequests: activeMaintenance,
        recentActivity,
      };
    },
    enabled: !!user,
  });
}
