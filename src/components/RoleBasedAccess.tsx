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
  fallbackPath = '/' 
}: RoleBasedAccessProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole && !allowedRoles.includes(userRole) && !allowedRoles.includes('*')) {
      navigate(fallbackPath);
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
    return null; // Will be handled by ProtectedRoute
  }

  if (!userRole || (!allowedRoles.includes(userRole) && !allowedRoles.includes('*'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-warning mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Access Restricted</h3>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page. Your current role ({userRole}) 
                doesn't allow access to this section.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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