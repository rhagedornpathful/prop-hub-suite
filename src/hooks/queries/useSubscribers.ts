import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  updated_at: string;
  created_at: string;
}

export interface SubscriberInsert {
  user_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed?: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscriber = (userId?: string) => {
  return useQuery({
    queryKey: ['subscriber', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Temporarily return null until migration is applied
      console.log('Subscriber query - migration pending for user:', userId);
      return null as Subscriber | null;
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
};

export const useCreateOrUpdateSubscriber = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subscriber: SubscriberInsert) => {
      console.log('Subscriber upsert requested:', subscriber);
      return { id: 'mock-id', ...subscriber };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber'] });
      toast({
        title: "Migration Pending",
        description: "Subscriber features will be available after database migration is applied",
      });
    },
  });
};