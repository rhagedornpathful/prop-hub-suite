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

      // Fetch payments (instead of owner_distributions)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      console.log('Payments found:', paymentsData?.length || 0);

      // Add payment activities with property info
      if (paymentsData) {
        activities.push(...paymentsData
          .filter(item => propertyMap.has(item.property_id)) // Only include if user has access to property
          .map(item => {
            const property = propertyMap.get(item.property_id);
            return {
              id: item.id,
              type: 'payment' as const,
              title: `Payment - ${item.payment_type}`,
              description: item.description || undefined,
              date: item.created_at,
              status: item.status,
              amount: item.amount ? item.amount / 100 : undefined, // Convert cents to dollars
              metadata: {
                property_address: property?.address,
                property_city: property?.city,
                property_state: property?.state,
                property_type: property?.property_type,
                payment_type: item.payment_type,
                payment_method: item.payment_method,
                stripe_payment_intent_id: item.stripe_payment_intent_id,
                due_date: item.due_date,
                paid_at: item.paid_at,
                property_id: item.property_id
              }
            };
          }));
      }

      // Fetch home check sessions
      const { data: homeCheckData, error: homeCheckError } = await supabase
        .from('home_check_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (homeCheckError) {
        console.error('Error fetching home check sessions:', homeCheckError);
        throw homeCheckError;
      }

      console.log('Home check sessions found:', homeCheckData?.length || 0);

      // Add home check activities with property info
      if (homeCheckData) {
        activities.push(...homeCheckData
          .filter(item => propertyMap.has(item.property_id)) // Only include if user has access to property
          .map(item => {
            const property = propertyMap.get(item.property_id);
            return {
              id: item.id,
              type: 'home_check' as const,
              title: `Home Check - ${item.status}`,
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
                weather: item.weather,
                overall_condition: item.overall_condition,
                total_issues_found: item.total_issues_found,
                photos_taken: item.photos_taken,
                checklist_data: item.checklist_data,
                property_id: item.property_id
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