import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";

export function useTenantMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenant-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      // Get tenant record - use explicit fields to avoid type depth issues
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, user_account_id, property_id, first_name, last_name, email, phone, monthly_rent, lease_start_date, lease_end_date')
        .eq('user_account_id', user.id)
        .maybeSingle();

      // Get property details separately
      let propertyDetails = null;
      if (tenant?.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('id, address, city, state')
          .eq('id', tenant.property_id)
          .maybeSingle();
        propertyDetails = property;
      }

      if (!tenant) {
        return {
          tenant: null,
          rentDueThisMonth: 0,
          rentPaidThisMonth: false,
          leaseEndDate: null,
          daysUntilLeaseEnd: null,
          activeMaintenanceRequests: 0,
          unreadMessages: 0,
          maintenanceRequests: [],
          rentRolls: [],
          recentActivity: [],
        };
      }

      // Get rent roll for current month
      const { data: rentRoll } = await supabase
        .from('rent_rolls')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      // Get maintenance requests for tenant's property
      const { data: maintenanceRequests } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', tenant.property_id)
        .or('user_id.eq.' + user.id)
        .order('created_at', { ascending: false });

      // Get conversations for unread messages (simplified - just count)
      const { count: unreadCount } = await supabase
        .from('conversation_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate metrics
      const rentDueThisMonth = rentRoll?.rent_amount || tenant.monthly_rent || 0;
      const rentPaidThisMonth = rentRoll?.status === 'paid' || false;
      const leaseEndDate = tenant.lease_end_date;
      const daysUntilLeaseEnd = leaseEndDate 
        ? differenceInDays(new Date(leaseEndDate), new Date())
        : null;

      const activeMaintenanceRequests = maintenanceRequests?.filter(
        m => m.status !== 'completed' && m.status !== 'cancelled'
      ).length || 0;

      const unreadMessages = unreadCount || 0; // Simplified count

      // Recent activity (payments + maintenance)
      const recentActivity = [
        ...(maintenanceRequests?.slice(0, 5).map(m => ({
          id: m.id,
          type: 'maintenance' as const,
          title: m.title,
          description: m.description,
          date: m.created_at,
          status: m.status,
        })) || []),
        ...(rentRoll && rentRoll.paid_date ? [{
          id: rentRoll.id,
          type: 'payment' as const,
          title: `Rent payment - $${rentRoll.amount_collected}`,
          description: `Payment for ${new Date(rentRoll.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          date: rentRoll.paid_date,
          status: 'paid',
        }] : []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      return {
        tenant: tenant as any,
        propertyDetails,
        rentDueThisMonth: Number(rentDueThisMonth),
        rentPaidThisMonth,
        rentDueDate: rentRoll?.due_date || null,
        leaseEndDate,
        daysUntilLeaseEnd,
        activeMaintenanceRequests,
        unreadMessages,
        maintenanceRequests: maintenanceRequests || [],
        rentRolls: rentRoll ? [rentRoll] : [],
        recentActivity,
      };
    },
    enabled: !!user,
  });
}
