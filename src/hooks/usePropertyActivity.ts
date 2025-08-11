import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface PropertyActivity {
  id: string;
  type: 'maintenance' | 'property_check' | 'payment' | 'home_check';
  title: string;
  description?: string;
  date: string;
  status?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

export function usePropertyActivity(propertyId: string | undefined) {
  const [activities, setActivities] = useState<PropertyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!propertyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const activities: PropertyActivity[] = [];

      // Fetch maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Add maintenance activities
      if (maintenanceData) {
        activities.push(...maintenanceData.map(item => ({
          id: item.id,
          type: 'maintenance' as const,
          title: item.title,
          description: item.description || undefined,
          date: item.scheduled_date || item.created_at, // Use scheduled_date if available, otherwise created_at
          status: item.status,
          amount: item.estimated_cost || undefined,
          metadata: {
            priority: item.priority,
            assigned_to: item.assigned_to,
            contractor_name: item.contractor_name,
            contractor_contact: item.contractor_contact,
            actual_cost: item.actual_cost,
            scheduled_date: item.scheduled_date,
            completed_at: item.completed_at,
            created_at: item.created_at // Keep created_at in metadata for reference
          }
        })));
      }

      // Fetch property check sessions
      const { data: checkData, error: checkError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (checkError) throw checkError;

      // Add property check activities
      if (checkData) {
        activities.push(...checkData.map(item => ({
          id: item.id,
          type: 'property_check' as const,
          title: `Property Check - ${item.status}`,
          description: item.general_notes || undefined,
          date: item.created_at,
          status: item.status,
          metadata: {
            scheduled_date: item.scheduled_date,
            scheduled_time: item.scheduled_time,
            started_at: item.started_at,
            completed_at: item.completed_at,
            duration_minutes: item.duration_minutes,
            location_verified: item.location_verified,
            checklist_data: item.checklist_data
          }
        })));
      }

      // Fetch payments (instead of owner_distributions)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Add payment activities
      if (paymentsData) {
        activities.push(...paymentsData.map(item => ({
          id: item.id,
          type: 'payment' as const,
          title: `Payment - ${item.payment_type}`,
          description: item.description || undefined,
          date: item.created_at,
          status: item.status,
          amount: item.amount ? item.amount / 100 : undefined, // Convert cents to dollars
          metadata: {
            payment_type: item.payment_type,
            payment_method: item.payment_method,
            stripe_payment_intent_id: item.stripe_payment_intent_id,
            due_date: item.due_date,
            paid_at: item.paid_at
          }
        })));
      }

      // Fetch home check sessions for this property
      const { data: homeCheckData, error: homeCheckError } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (homeCheckError) throw homeCheckError;

      // Add home check activities
      if (homeCheckData) {
        activities.push(...homeCheckData.map(item => ({
          id: item.id,
          type: 'home_check' as const,
          title: `Home Check - ${item.status}`,
          description: item.general_notes || undefined,
          date: item.created_at,
          status: item.status,
          metadata: {
            scheduled_date: item.scheduled_date,
            scheduled_time: item.scheduled_time,
            started_at: item.started_at,
            completed_at: item.completed_at,
            duration_minutes: item.duration_minutes,
            weather: item.weather,
            overall_condition: item.overall_condition,
            total_issues_found: item.total_issues_found,
            photos_taken: item.photos_taken,
            checklist_data: item.checklist_data
          }
        })));
      }

      // Sort all activities by date (most recent first)
      const sortedActivities = activities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching property activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [propertyId]);

  const refetch = () => {
    fetchActivities();
  };

  return {
    activities,
    isLoading,
    error,
    refetch
  };
}