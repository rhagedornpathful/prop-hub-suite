import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyActivity } from './usePropertyActivity';

export function useAllPropertyActivity() {
  const [activities, setActivities] = useState<PropertyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activities: PropertyActivity[] = [];

      // Fetch maintenance requests across all properties
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties!inner(address, city, state, property_type)
        `)
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
            property_address: (item.properties as any)?.address,
            property_city: (item.properties as any)?.city,
            property_state: (item.properties as any)?.state,
            property_type: (item.properties as any)?.property_type,
            priority: item.priority,
            assigned_to: item.assigned_to,
            contractor_name: item.contractor_name,
            contractor_contact: item.contractor_contact,
            actual_cost: item.actual_cost,
            scheduled_date: item.scheduled_date,
            completed_at: item.completed_at,
            property_id: item.property_id
          }
        })));
      }

      // Fetch property check sessions across all properties
      const { data: checkData, error: checkError } = await supabase
        .from('property_check_sessions')
        .select(`
          *,
          properties!inner(address, city, state, property_type)
        `)
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
            property_address: (item.properties as any)?.address,
            property_city: (item.properties as any)?.city,
            property_state: (item.properties as any)?.state,
            property_type: (item.properties as any)?.property_type,
            scheduled_date: item.scheduled_date,
            scheduled_time: item.scheduled_time,
            started_at: item.started_at,
            completed_at: item.completed_at,
            duration_minutes: item.duration_minutes,
            location_verified: item.location_verified,
            checklist_data: item.checklist_data,
            property_id: item.property_id
          }
        })));
      }

      // Fetch owner distributions across all properties
      const { data: distributionData, error: distributionError } = await supabase
        .from('owner_distributions')
        .select(`
          *,
          properties!inner(address, city, state, property_type)
        `)
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
            property_address: (item.properties as any)?.address,
            property_city: (item.properties as any)?.city,
            property_state: (item.properties as any)?.state,
            property_type: (item.properties as any)?.property_type,
            distribution_date: item.distribution_date,
            payment_method: item.payment_method,
            reference_number: item.reference_number,
            property_id: item.property_id
          }
        })));
      }

      // Fetch maintenance status history across all properties
      const { data: statusData, error: statusError } = await supabase
        .from('maintenance_status_history')
        .select(`
          *,
          maintenance_requests!inner(
            title,
            property_id,
            properties!inner(address, city, state, property_type)
          )
        `)
        .order('changed_at', { ascending: false });

      if (statusError) throw statusError;

      // Add status change activities
      if (statusData) {
        activities.push(...statusData.map(item => {
          const maintenanceRequest = item.maintenance_requests as any;
          const property = maintenanceRequest?.properties;
          
          return {
            id: item.id,
            type: 'status_change' as const,
            title: `Status Changed: ${maintenanceRequest?.title || 'Maintenance Request'}`,
            description: item.notes || `Status changed from ${item.old_status} to ${item.new_status}`,
            date: item.changed_at,
            status: item.new_status,
            metadata: {
              property_address: property?.address,
              property_city: property?.city,
              property_state: property?.state,
              property_type: property?.property_type,
              old_status: item.old_status,
              new_status: item.new_status,
              maintenance_request_id: item.maintenance_request_id,
              property_id: maintenanceRequest?.property_id
            }
          };
        }));
      }

      // Sort all activities by date (most recent first)
      const sortedActivities = activities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching all property activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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