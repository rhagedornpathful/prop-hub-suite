import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: readonly string[];
  fallbackPath?: string;
}

export const RoleBasedAccess = ({ 
  children, 
  allowedRoles, 
  fallbackPath,
}: RoleBasedAccessProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole && !allowedRoles.includes(userRole) && !allowedRoles.includes('*')) {
      const roleFallback = (() => {
        switch (userRole) {
          case 'admin':
            return '/admin/overview';
          case 'house_watcher':
            return '/house-watcher/dashboard';
          case 'tenant':
            return '/';
          case 'owner_investor':
            return '/properties';
          default:
            return '/';
        }
      })();
      const target = fallbackPath || roleFallback;
      navigate(target, { replace: true });
    }
  }, [userRole, allowedRoles, fallbackPath, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // handled by ProtectedRoute
  }

  if (!userRole || (!allowedRoles.includes(userRole) && !allowedRoles.includes('*'))) {
    // Quietly redirect handled in useEffect; render nothing to avoid layout clashes on mobile portals
    return null;
  }

  return <>{children}</>;
};

// Higher-order component for easy route protection
export const withRoleAccess = (allowedRoles: readonly string[], fallbackPath?: string) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => (
      <RoleBasedAccess allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
        <WrappedComponent {...props} />
      </RoleBasedAccess>
    );
  };
};

// Role constants for easy reference
export const ROLES = {
  ADMIN: 'admin',
  PROPERTY_OWNER: 'property_owner',
  TENANT: 'tenant',
  HOUSE_WATCHER: 'house_watcher'
} as const;

// Common role combinations
export const ROLE_COMBINATIONS = {
  ADMIN_ONLY: [ROLES.ADMIN],
  PROPERTY_MANAGEMENT: [ROLES.ADMIN, ROLES.PROPERTY_OWNER],
  TENANT_PORTAL: [ROLES.ADMIN, ROLES.TENANT],
  HOUSE_WATCHING: [ROLES.ADMIN, ROLES.HOUSE_WATCHER],
  ALL_ROLES: [ROLES.ADMIN, ROLES.PROPERTY_OWNER, ROLES.TENANT, ROLES.HOUSE_WATCHER]
} as const;