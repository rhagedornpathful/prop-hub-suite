import { ReactNode } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

type AppRole = 'admin' | 'property_manager' | 'house_watcher' | 'client' | 'contractor' | 'tenant' | 'owner_investor' | 'leasing_agent';

interface RoleBasedWrapperProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallback?: ReactNode;
}

export const RoleBasedWrapper = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleBasedWrapperProps) => {
  const { hasRole, loading } = useUserProfile();

  if (loading) {
    return null;
  }

  const hasPermission = allowedRoles.some(role => hasRole(role));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};