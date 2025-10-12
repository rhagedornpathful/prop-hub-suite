import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ServiceType = 'rental' | 'house_watching' | 'both' | 'none';

export function usePropertyOwnerMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property-owner-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Get property owner record
      const { data: ownerRecord } = await supabase
        .from('property_owners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!ownerRecord) {
        return {
          serviceType: 'none' as ServiceType,
          properties: [],
          tenants: [],
          houseWatching: [],
          maintenance: [],
          rentRolls: [],
          totalProperties: 0,
          totalTenants: 0,
          monthlyIncome: 0,
          pendingMaintenance: 0,
          occupancyRate: 0,
          activeHouseWatching: 0,
          lastCheckDate: null,
          nextCheckDate: null,
          totalChecksThisYear: 0,
          portfolioValue: 0,
        };
      }

      // Get all properties owned by this user
      const { data: propertyAssociations } = await supabase
        .from('property_owner_associations')
        .select('property_id, ownership_percentage')
        .eq('property_owner_id', ownerRecord.id);

      const propertyIds = propertyAssociations?.map(p => p.property_id) || [];

      // Get properties
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      // Get tenants for these properties
      const { data: tenants } = await supabase
        .from('tenants')
        .select('*')
        .in('property_id', propertyIds);

      // Get house watching services
      const { data: houseWatching } = await supabase
        .from('house_watching')
        .select('*')
        .in('property_id', propertyIds)
        .eq('status', 'active');

      // Get maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('property_id', propertyIds);

      // Get rent rolls for income calculation
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: rentRolls } = await supabase
        .from('rent_rolls')
        .select('*')
        .in('property_id', propertyIds)
        .eq('month_year', currentMonth);

      // Get check sessions for this year
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { data: checkSessions } = await supabase
        .from('home_check_sessions')
        .select('*')
        .in('property_id', propertyIds.map(id => id.toString()))
        .eq('status', 'completed')
        .gte('completed_at', yearStart);

      // Determine service type
      const hasRental = (tenants?.length || 0) > 0;
      const hasHouseWatching = (houseWatching?.length || 0) > 0;
      let serviceType: ServiceType = 'none';
      if (hasRental && hasHouseWatching) serviceType = 'both';
      else if (hasRental) serviceType = 'rental';
      else if (hasHouseWatching) serviceType = 'house_watching';

      // Calculate metrics
      const totalProperties = properties?.length || 0;
      const totalTenants = tenants?.length || 0;
      const monthlyIncome = rentRolls?.reduce((sum, roll) => sum + Number(roll.rent_amount || 0), 0) || 0;
      const pendingMaintenance = maintenance?.filter(m => m.status === 'pending').length || 0;
      const occupancyRate = totalProperties > 0 ? (totalTenants / totalProperties) * 100 : 0;
      const activeHouseWatching = houseWatching?.length || 0;
      
      // Get last and next check dates
      const sortedChecks = houseWatching?.sort((a, b) => 
        new Date(b.last_check_date || 0).getTime() - new Date(a.last_check_date || 0).getTime()
      );
      const lastCheckDate = sortedChecks?.[0]?.last_check_date || null;
      const nextCheckDate = houseWatching?.reduce((earliest, hw) => {
        if (!hw.next_check_date) return earliest;
        if (!earliest) return hw.next_check_date;
        return new Date(hw.next_check_date) < new Date(earliest) ? hw.next_check_date : earliest;
      }, null as string | null);

      const totalChecksThisYear = checkSessions?.length || 0;

      // Estimate portfolio value (12x monthly income as simple approximation)
      const portfolioValue = monthlyIncome * 12;

      return {
        serviceType,
        properties: properties || [],
        tenants: tenants || [],
        houseWatching: houseWatching || [],
        maintenance: maintenance || [],
        rentRolls: rentRolls || [],
        totalProperties,
        totalTenants,
        monthlyIncome,
        pendingMaintenance,
        occupancyRate,
        activeHouseWatching,
        lastCheckDate,
        nextCheckDate,
        totalChecksThisYear,
        portfolioValue,
      };
    },
    enabled: !!user,
  });
}
