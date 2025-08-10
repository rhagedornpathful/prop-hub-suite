import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek } from 'date-fns';

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
}

export const usePropertyManagerSchedule = (currentWeek: Date) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduledCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWeeklySchedule();
    }
  }, [user, currentWeek]);

  const loadWeeklySchedule = async () => {
    try {
      setLoading(true);
      
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      // Get properties managed by this property manager
      const { data: assignments, error: assignmentsError } = await supabase
        .from('property_manager_assignments')
        .select(`
          property_id,
          properties!inner (
            id,
            address,
            city,
            state
          )
        `)
        .eq('manager_user_id', user?.id);

      if (assignmentsError) throw assignmentsError;

      // Mock schedule data for demonstration
      // In a real app, you'd have a property_check_schedules table
      const mockSchedule: ScheduledCheck[] = (assignments || []).flatMap((assignment, index) => {
        const property = assignment.properties;
        const checkDates = [];
        
        // Generate some mock check dates within the week
        for (let i = 0; i < 2; i++) {
          const checkDate = new Date(weekStart);
          checkDate.setDate(checkDate.getDate() + (index * 2) + i);
          
          if (checkDate <= weekEnd) {
            checkDates.push({
              id: `${property.id}-${i}`,
              property_address: `${property.address}, ${property.city}, ${property.state}`,
              check_frequency: 'weekly',
              next_check_date: checkDate.toISOString(),
              status: 'scheduled',
              special_instructions: `Property check for ${property.address}`,
              monthly_fee: 150,
              owner_name: 'Property Owner',
              emergency_contact: '+1 (555) 123-4567'
            });
          }
        }
        
        return checkDates;
      });

      setSchedule(mockSchedule);
    } catch (error: any) {
      console.error('Error loading schedule:', error);
      toast({
        title: "Error Loading Schedule",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNextCheckDate = async (propertyId: string, completedDate: Date) => {
    try {
      // In a real app, you'd update the next check date in the database
      // For now, we'll just update the local state
      setSchedule(prev => prev.map(check => {
        if (check.id === propertyId) {
          const nextDate = new Date(completedDate);
          nextDate.setDate(nextDate.getDate() + 7); // Next week
          return {
            ...check,
            next_check_date: nextDate.toISOString()
          };
        }
        return check;
      }));

      toast({
        title: "Check Completed",
        description: "Property check marked as completed and next check scheduled.",
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    schedule,
    loading,
    updateNextCheckDate,
    refreshSchedule: loadWeeklySchedule
  };
};