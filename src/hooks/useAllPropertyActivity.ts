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

      // First, fetch all properties that the user has access to
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, city, state, property_type');

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      // Create a map of property IDs to property info for quick lookup
      const propertyMap = new Map(
        propertiesData?.map(prop => [prop.id, prop]) || []
      );

      console.log('Properties accessible to user:', propertiesData?.length || 0);

      // Fetch maintenance requests without inner join
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (maintenanceError) {
        console.error('Error fetching maintenance requests:', maintenanceError);
        throw maintenanceError;
      }

      console.log('Maintenance requests found:', maintenanceData?.length || 0);

      // Add maintenance activities with property info
      if (maintenanceData) {
        activities.push(...maintenanceData
          .filter(item => propertyMap.has(item.property_id)) // Only include if user has access to property
          .map(item => {
            const property = propertyMap.get(item.property_id);
            return {
              id: item.id,
              type: 'maintenance' as const,
              title: item.title,
              description: item.description || undefined,
              date: item.created_at,
              status: item.status,
              amount: item.estimated_cost || undefined,
              metadata: {
                property_address: property?.address,
                property_city: property?.city,
                property_state: property?.state,
                property_type: property?.property_type,
                priority: item.priority,
                assigned_to: item.assigned_to,
                contractor_name: item.contractor_name,
                contractor_contact: item.contractor_contact,
                actual_cost: item.actual_cost,
                scheduled_date: item.scheduled_date,
                completed_at: item.completed_at,
                property_id: item.property_id
              }
            };
          }));
      }

      // Fetch property check sessions without inner join
      const { data: checkData, error: checkError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (checkError) {
        console.error('Error fetching property check sessions:', checkError);
        throw checkError;
      }

      console.log('Property check sessions found:', checkData?.length || 0);

      // Add property check activities with property info
      if (checkData) {
        activities.push(...checkData
          .filter(item => propertyMap.has(item.property_id)) // Only include if user has access to property
          .map(item => {
            const property = propertyMap.get(item.property_id);
            return {
              id: item.id,
              type: 'property_check' as const,
              title: `Property Check - ${item.status}`,
              description: item.general_notes || undefined,
              date: item.created_at,
              status: item.status,
              metadata: {
                property_address: property?.address,
                property_city: property?.city,
                property_state: property?.state,
                property_type: property?.property_type,
                scheduled_date: item.scheduled_date,
                scheduled_time: item.scheduled_time,
                started_at: item.started_at,
                completed_at: item.completed_at,
                duration_minutes: item.duration_minutes,
                location_verified: item.location_verified,
                checklist_data: item.checklist_data,
                property_id: item.property_id
              }
            };
          }));
      }

      // Fetch owner distributions without inner join
      const { data: distributionData, error: distributionError } = await supabase
        .from('owner_distributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (distributionError) {
        console.error('Error fetching owner distributions:', distributionError);
        throw distributionError;
      }

      console.log('Owner distributions found:', distributionData?.length || 0);

      // Add payment activities with property info
      if (distributionData) {
        activities.push(...distributionData
          .filter(item => propertyMap.has(item.property_id)) // Only include if user has access to property
          .map(item => {
            const property = propertyMap.get(item.property_id);
            return {
              id: item.id,
              type: 'payment' as const,
              title: 'Owner Distribution',
              description: item.notes || undefined,
              date: item.created_at,
              amount: Number(item.amount),
              metadata: {
                property_address: property?.address,
                property_city: property?.city,
                property_state: property?.state,
                property_type: property?.property_type,
                distribution_date: item.distribution_date,
                payment_method: item.payment_method,
                reference_number: item.reference_number,
                property_id: item.property_id
              }
            };
          }));
      }

      // Fetch maintenance status history without problematic inner joins
      const { data: statusData, error: statusError } = await supabase
        .from('maintenance_status_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (statusError) {
        console.error('Error fetching maintenance status history:', statusError);
        throw statusError;
      }

      console.log('Maintenance status history found:', statusData?.length || 0);

      // Add status change activities with property info
      if (statusData && maintenanceData) {
        // Create a map of maintenance request IDs to titles and property IDs
        const maintenanceRequestMap = new Map(
          maintenanceData.map(req => [req.id, { title: req.title, property_id: req.property_id }])
        );

        activities.push(...statusData
          .filter(item => {
            const maintenanceRequest = maintenanceRequestMap.get(item.maintenance_request_id);
            return maintenanceRequest && propertyMap.has(maintenanceRequest.property_id);
          })
          .map(item => {
            const maintenanceRequest = maintenanceRequestMap.get(item.maintenance_request_id);
            const property = maintenanceRequest ? propertyMap.get(maintenanceRequest.property_id) : null;
            
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

      console.log('Total activities after processing:', sortedActivities.length);
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