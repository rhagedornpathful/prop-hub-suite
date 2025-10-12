import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';

export interface MaintenanceRequest {
  id: string;
  user_id: string;
  property_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contractor_name: string | null;
  contractor_contact: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  scheduled_date: string | null;
  due_date: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  completion_notes: string | null;
  is_recurring: boolean;
  recurrence_interval: string | null;
  parent_request_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  properties?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  };
  assigned_user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface MaintenanceStatusHistory {
  id: string;
  maintenance_request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
  notes: string | null;
  created_at: string;
}

export interface MaintenanceCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduled_date: string | null;
  due_date: string | null;
  assigned_to: string | null;
  property_id: string;
  property_address: string;
  assigned_to_name: string | null;
}

export const useMaintenanceRequests = () => {
  const { user, activeRole, actualRole } = useAuth();

  return useQuery({
    queryKey: ['maintenance-requests', user?.id, activeRole],
    queryFn: async () => {
      if (!user) return [];
      
      const effectiveRole = activeRole || actualRole;

      // Build query
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties (
            id,
            address,
            city,
            state,
            zip_code
          )
        `);

      // Filter by role - property owners only see maintenance for their properties
      if (effectiveRole === 'owner_investor') {
        // Get properties where user is associated as owner
        const { data: ownerData } = await supabase
          .from('property_owners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ownerData) {
          const { data: associations } = await supabase
            .from('property_owner_associations')
            .select('property_id')
            .eq('property_owner_id', ownerData.id);

          const propertyIds = associations?.map(a => a.property_id) || [];
          
          if (propertyIds.length === 0) {
            return [];
          }

          query = query.in('property_id', propertyIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
};

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestData: Omit<MaintenanceRequest, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'properties'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...requestData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceRequest> }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          properties (
            id,
            address,
            city,
            state,
            zip_code
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });
};

export const useMaintenanceStatusHistory = (requestId: string) => {
  return useQuery({
    queryKey: ['maintenance-status-history', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_status_history')
        .select('*')
        .eq('maintenance_request_id', requestId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!requestId,
  });
};

export const useMaintenanceCalendarEvents = () => {
  const { user, activeRole, actualRole } = useAuth();

  return useQuery({
    queryKey: ['maintenance-calendar-events', user?.id, activeRole],
    queryFn: async () => {
      if (!user) return [];

      const effectiveRole = activeRole || actualRole;

      // Build query
      let query = supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          scheduled_date,
          due_date,
          assigned_to,
          property_id,
          properties!inner (
            address,
            city,
            state,
            zip_code
          )
        `)
        .not('scheduled_date', 'is', null);

      // Filter by role - property owners only see maintenance for their properties
      if (effectiveRole === 'owner_investor') {
        const { data: ownerData } = await supabase
          .from('property_owners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ownerData) {
          const { data: associations } = await supabase
            .from('property_owner_associations')
            .select('property_id')
            .eq('property_owner_id', ownerData.id);

          const propertyIds = associations?.map(a => a.property_id) || [];
          
          if (propertyIds.length === 0) {
            return [];
          }

          query = query.in('property_id', propertyIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        scheduled_date: item.scheduled_date,
        due_date: item.due_date,
        assigned_to: item.assigned_to,
        property_id: item.property_id,
        property_address: `${item.properties.address}${item.properties.city ? `, ${item.properties.city}` : ''}${item.properties.state ? `, ${item.properties.state}` : ''}`,
        assigned_to_name: null
      })) as MaintenanceCalendarEvent[];
    },
    enabled: !!user,
  });
};

export const useAssignMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, assignedTo }: { requestId: string; assignedTo: string }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_to: assignedTo,
          assigned_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-calendar-events'] });
      toast({
        title: "Success",
        description: "Maintenance request assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign maintenance request",
        variant: "destructive",
      });
    },
  });
};