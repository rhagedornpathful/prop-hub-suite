import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface PropertyActivity {
  id: string;
  type: 'maintenance' | 'property_check' | 'payment' | 'status_change';
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
          date: item.created_at,
          status: item.status,
          amount: item.estimated_cost || undefined,
          metadata: {
            priority: item.priority,
            assigned_to: item.assigned_to,
            contractor_name: item.contractor_name,
            contractor_contact: item.contractor_contact,
            actual_cost: item.actual_cost,
            scheduled_date: item.scheduled_date,
            completed_at: item.completed_at
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

      // Fetch owner distributions (payments)
      const { data: distributionData, error: distributionError } = await supabase
        .from('owner_distributions')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (distributionError) throw distributionError;

      // Add payment activities
      if (distributionData) {
        activities.push(...distributionData.map(item => ({
          id: item.id,
          type: 'payment' as const,
          title: 'Owner Distribution',
          description: item.notes || undefined,
          date: item.created_at,
          amount: Number(item.amount),
          metadata: {
            distribution_date: item.distribution_date,
            payment_method: item.payment_method,
            reference_number: item.reference_number
          }
        })));
      }

      // Fetch maintenance status history
      // First get maintenance request IDs for this property
      const maintenanceRequestIds = maintenanceData?.map(req => req.id) || [];
      
      if (maintenanceRequestIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('maintenance_status_history')
          .select('*')
          .in('maintenance_request_id', maintenanceRequestIds)
          .order('changed_at', { ascending: false });

        if (statusError) throw statusError;

        // Add status change activities
        if (statusData) {
          // Create a map of maintenance request IDs to titles for quick lookup
          const maintenanceRequestMap = new Map(
            maintenanceData?.map(req => [req.id, req.title]) || []
          );

          activities.push(...statusData.map(item => ({
            id: item.id,
            type: 'status_change' as const,
            title: `Status Changed: ${maintenanceRequestMap.get(item.maintenance_request_id) || 'Maintenance Request'}`,
            description: item.notes || `Status changed from ${item.old_status} to ${item.new_status}`,
            date: item.changed_at,
            status: item.new_status,
            metadata: {
              old_status: item.old_status,
              new_status: item.new_status,
              maintenance_request_id: item.maintenance_request_id
            }
          })));
        }
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