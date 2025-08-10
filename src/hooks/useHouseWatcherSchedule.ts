import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, addDays } from 'date-fns';

interface ScheduledCheck {
  id: string;
  property_address: string;
  check_frequency: string;
  next_check_date: string;
  status: string;
  special_instructions: string;
  monthly_fee: number;
  owner_name: string;
  emergency_contact: string;
  last_check_date: string | null;
  property_id: string;
}

export const useHouseWatcherSchedule = (currentWeek: Date) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduledCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      // Get house watcher record
      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!houseWatcher) {
        setSchedule([]);
        return;
      }

      // Get assigned properties with house watching details
      const { data: assignments } = await supabase
        .from('house_watcher_properties')
        .select(`
          property_id,
          notes,
          properties!inner (
            id,
            address,
            city,
            state
          )
        `)
        .eq('house_watcher_id', houseWatcher.id);

      if (!assignments) {
        setSchedule([]);
        return;
      }

      const propertyIds = assignments.map(a => a.property_id);

      // Get house watching records for these properties
      const { data: watchingData } = await supabase
        .from('house_watching')
        .select('*')
        .in('property_address', assignments.map(a => a.properties.address));

      const scheduleItems: ScheduledCheck[] = [];

      watchingData?.forEach(watching => {
        if (watching.next_check_date) {
          const checkDate = parseISO(watching.next_check_date);
          if (isWithinInterval(checkDate, { start: weekStart, end: weekEnd })) {
            const assignment = assignments.find(a => a.properties.address === watching.property_address);
            scheduleItems.push({
              id: watching.id,
              property_address: watching.property_address,
              check_frequency: watching.check_frequency || 'weekly',
              next_check_date: watching.next_check_date,
              status: watching.status || 'active',
              special_instructions: watching.special_instructions || '',
              monthly_fee: watching.monthly_fee || 0,
              owner_name: watching.owner_name || '',
              emergency_contact: watching.emergency_contact || '',
              last_check_date: watching.last_check_date,
              property_id: assignment?.property_id || watching.id
            });
          }
        }
      });

      setSchedule(scheduleItems);
    } catch (error: any) {
      toast({
        title: "Error Loading Schedule",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNextCheckDate = async (watchingId: string, completedDate: Date) => {
    try {
      const { data: watching } = await supabase
        .from('house_watching')
        .select('check_frequency')
        .eq('id', watchingId)
        .single();

      if (!watching) return;

      let nextDate = new Date(completedDate);
      
      switch (watching.check_frequency) {
        case 'daily':
          nextDate = addDays(completedDate, 1);
          break;
        case 'weekly':
          nextDate = addDays(completedDate, 7);
          break;
        case 'bi-weekly':
          nextDate = addDays(completedDate, 14);
          break;
        case 'monthly':
          nextDate = addDays(completedDate, 30);
          break;
        default:
          nextDate = addDays(completedDate, 7);
      }

      await supabase
        .from('house_watching')
        .update({
          last_check_date: completedDate.toISOString().split('T')[0],
          next_check_date: nextDate.toISOString().split('T')[0]
        })
        .eq('id', watchingId);

      // Refresh schedule
      loadSchedule();
    } catch (error: any) {
      toast({
        title: "Error Updating Schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [user, currentWeek]);

  return {
    schedule,
    loading,
    loadSchedule,
    updateNextCheckDate
  };
};