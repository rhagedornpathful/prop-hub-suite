import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type AppRole = 'admin' | 'property_manager' | 'house_watcher' | 'client' | 'contractor' | 'tenant' | 'owner_investor' | 'leasing_agent';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchProfileAndRoles = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        setProfile(profileData);

        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) throw rolesError;

        setRoles(rolesData?.map(r => r.role as AppRole) || []);
      } catch (error) {
        console.error('Error fetching profile and roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = () => hasRole('admin');
  const isPropertyManager = () => hasRole('property_manager');
  const isHouseWatcher = () => hasRole('house_watcher');
  const isClient = () => hasRole('client');
  const isContractor = () => hasRole('contractor');
  const isTenant = () => hasRole('tenant');
  const isOwnerInvestor = () => hasRole('owner_investor');
  const isLeasingAgent = () => hasRole('leasing_agent');

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  };

  return {
    profile,
    roles,
    loading,
    hasRole,
    isAdmin,
    isPropertyManager,
    isHouseWatcher,
    isClient,
    isContractor,
    isTenant,
    isOwnerInvestor,
    isLeasingAgent,
    updateProfile,
  };
};