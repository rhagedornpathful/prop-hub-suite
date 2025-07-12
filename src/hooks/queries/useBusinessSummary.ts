import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBusinessSummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['business-summary', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          newHouseWatchingClients: 0,
          newRentalProperties: 0,
          combinedRevenue: 0
        };
      }

      // Get current month start
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Fetch new rental properties this month
      const { data: newProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, monthly_rent')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth.toISOString());

      if (propertiesError) {
        console.error('Properties error:', propertiesError);
      }

      // Fetch new house watching clients this month
      const { data: newHouseWatching, error: houseWatchingError } = await supabase
        .from('house_watching')
        .select('id, monthly_fee')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth.toISOString());

      if (houseWatchingError) {
        console.error('House watching error:', houseWatchingError);
      }

      // Calculate combined revenue
      const propertyRevenue = newProperties?.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0) || 0;
      const houseWatchingRevenue = newHouseWatching?.reduce((sum, hw) => sum + (hw.monthly_fee || 0), 0) || 0;

      return {
        newHouseWatchingClients: newHouseWatching?.length || 0,
        newRentalProperties: newProperties?.length || 0,
        combinedRevenue: propertyRevenue + houseWatchingRevenue
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
  });
};