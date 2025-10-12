import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyActivity } from './usePropertyActivity';

interface FetchActivitiesOptions {
  limit?: number;
  offset?: number;
  type?: string;
  status?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export const fetchOptimizedActivities = async (options: FetchActivitiesOptions = {}) => {
  const {
    limit = 100,
    offset = 0,
    type,
    status,
    priority,
    dateFrom,
    dateTo,
    search
  } = options;

  const activities: PropertyActivity[] = [];

  // Fetch properties with only needed fields
  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .select('id, address, city, state, property_type');

  if (propertiesError) throw propertiesError;

  const propertyMap = new Map(
    propertiesData?.map(prop => [prop.id, prop]) || []
  );

  // Parallel fetch with Promise.all for better performance
  const queries = [];

  // Only fetch activity types if no filter or if filter matches
  if (!type || type === 'all' || type === 'maintenance') {
    queries.push(
      supabase
        .from('maintenance_requests')
        .select('id, property_id, title, description, created_at, status, estimated_cost, priority, assigned_to, contractor_name, contractor_contact, actual_cost, scheduled_date, completed_at')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }

  if (!type || type === 'all' || type === 'property_check') {
    queries.push(
      supabase
        .from('property_check_sessions')
        .select('id, property_id, created_at, status, general_notes, scheduled_date, scheduled_time, started_at, completed_at, duration_minutes, location_verified, checklist_data')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }

  if (!type || type === 'all' || type === 'payment') {
    queries.push(
      supabase
        .from('payments')
        .select('id, property_id, created_at, status, amount, payment_type, payment_method, stripe_payment_intent_id, due_date, paid_at, description')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }

  if (!type || type === 'all' || type === 'home_check') {
    queries.push(
      supabase
        .from('home_check_sessions')
        .select('id, property_id, created_at, status, general_notes, scheduled_date, scheduled_time, started_at, completed_at, duration_minutes, weather, overall_condition, total_issues_found, photos_taken, checklist_data')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }

  // Execute all queries in parallel
  const [
    maintenanceResult,
    checkResult,
    paymentsResult,
    homeCheckResult
  ] = await Promise.all(queries);

  // Process maintenance activities
  if (maintenanceResult.data) {
    activities.push(...maintenanceResult.data
      .filter(item => propertyMap.has(item.property_id))
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

  // Process property check activities
  if (checkResult.data) {
    activities.push(...checkResult.data
      .filter(item => propertyMap.has(item.property_id))
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

  // Process payment activities
  if (paymentsResult.data) {
    activities.push(...paymentsResult.data
      .filter(item => propertyMap.has(item.property_id))
      .map(item => {
        const property = propertyMap.get(item.property_id);
        return {
          id: item.id,
          type: 'payment' as const,
          title: `Payment - ${item.payment_type}`,
          description: item.description || undefined,
          date: item.created_at,
          status: item.status,
          amount: item.amount ? item.amount / 100 : undefined,
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

  // Process home check activities
  if (homeCheckResult.data) {
    activities.push(...homeCheckResult.data
      .filter(item => propertyMap.has(item.property_id))
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

  // Client-side filtering (will be replaced by server-side later)
  let filtered = activities;

  if (status && status !== 'all') {
    filtered = filtered.filter(a => a.status === status);
  }

  if (priority && priority !== 'all') {
    filtered = filtered.filter(a => a.metadata?.priority === priority);
  }

  if (dateFrom) {
    filtered = filtered.filter(a => new Date(a.date) >= dateFrom);
  }

  if (dateTo) {
    filtered = filtered.filter(a => new Date(a.date) <= dateTo);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchLower) ||
      a.description?.toLowerCase().includes(searchLower) ||
      a.metadata?.property_address?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date (newest first)
  const sorted = filtered.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sorted;
};

export function useOptimizedActivities(options: FetchActivitiesOptions = {}) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: () => fetchOptimizedActivities(options),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}
