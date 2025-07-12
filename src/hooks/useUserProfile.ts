import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUserRoles, useUpdateProfile } from './queries/useProfiles';

type AppRole = 'admin' | 'property_manager' | 'house_watcher' | 'client' | 'contractor' | 'tenant' | 'owner_investor' | 'leasing_agent';

export const useUserProfile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  const updateProfileMutation = useUpdateProfile();
  
  const loading = profileLoading || rolesLoading;

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

  const updateProfile = async (updates: any) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      await updateProfileMutation.mutateAsync(updates);
      return { success: true };
    } catch (error) {
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