import { useAuth } from '@/hooks/useAuth';
import { useDevAdmin } from '@/contexts/DevAdminContext';

export type UserRole = 'admin' | 'property_manager' | 'property_owner' | 'tenant' | 'house_watcher';

export interface RolePermissions {
  canManageAllProperties: boolean;
  canManageOwnProperties: boolean;
  canViewAllTenants: boolean;
  canManageOwnTenants: boolean;
  canViewAllMaintenanceRequests: boolean;
  canCreateMaintenanceRequests: boolean;
  canManageUsers: boolean;
  canViewFinancialReports: boolean;
  canManageDocuments: boolean;
  canAssignHouseWatchers: boolean;
  canViewHouseWatchingReports: boolean;
  canSubmitHouseWatchingReports: boolean;
}

export const useUserRole = () => {
  const { userRole, user, loading } = useAuth();
  const { isDevAdminActive, isDevelopment } = useDevAdmin();

  // Override role to admin if dev admin mode is active
  const effectiveRole = (isDevelopment && isDevAdminActive) ? 'admin' : userRole;

  // Helper functions to check specific roles (now use effective role)
  const isAdmin = () => effectiveRole === 'admin';
  const isPropertyManager = () => effectiveRole === 'property_manager';
  const isPropertyOwner = () => effectiveRole === 'property_owner';
  const isTenant = () => effectiveRole === 'tenant';
  const isHouseWatcher = () => effectiveRole === 'house_watcher';

  // Check if user has administrative privileges
  const hasAdminAccess = () => isAdmin() || isPropertyManager();

  // Check if user can manage properties
  const canManageProperties = () => hasAdminAccess() || isPropertyOwner();

  // Get role-based permissions (now use effective role)
  const getPermissions = (): RolePermissions => {
    switch (effectiveRole) {
      case 'admin':
        return {
          canManageAllProperties: true,
          canManageOwnProperties: true,
          canViewAllTenants: true,
          canManageOwnTenants: true,
          canViewAllMaintenanceRequests: true,
          canCreateMaintenanceRequests: true,
          canManageUsers: true,
          canViewFinancialReports: true,
          canManageDocuments: true,
          canAssignHouseWatchers: true,
          canViewHouseWatchingReports: true,
          canSubmitHouseWatchingReports: false,
        };
      case 'property_manager':
        return {
          canManageAllProperties: true,
          canManageOwnProperties: true,
          canViewAllTenants: true,
          canManageOwnTenants: true,
          canViewAllMaintenanceRequests: true,
          canCreateMaintenanceRequests: true,
          canManageUsers: false,
          canViewFinancialReports: true,
          canManageDocuments: true,
          canAssignHouseWatchers: true,
          canViewHouseWatchingReports: true,
          canSubmitHouseWatchingReports: false,
        };
      case 'property_owner':
        return {
          canManageAllProperties: false,
          canManageOwnProperties: true,
          canViewAllTenants: false,
          canManageOwnTenants: true,
          canViewAllMaintenanceRequests: false,
          canCreateMaintenanceRequests: true,
          canManageUsers: false,
          canViewFinancialReports: true,
          canManageDocuments: true,
          canAssignHouseWatchers: false,
          canViewHouseWatchingReports: false,
          canSubmitHouseWatchingReports: false,
        };
      case 'tenant':
        return {
          canManageAllProperties: false,
          canManageOwnProperties: false,
          canViewAllTenants: false,
          canManageOwnTenants: false,
          canViewAllMaintenanceRequests: false,
          canCreateMaintenanceRequests: true,
          canManageUsers: false,
          canViewFinancialReports: false,
          canManageDocuments: false,
          canAssignHouseWatchers: false,
          canViewHouseWatchingReports: false,
          canSubmitHouseWatchingReports: false,
        };
      case 'house_watcher':
        return {
          canManageAllProperties: false,
          canManageOwnProperties: false,
          canViewAllTenants: false,
          canManageOwnTenants: false,
          canViewAllMaintenanceRequests: false,
          canCreateMaintenanceRequests: true,
          canManageUsers: false,
          canViewFinancialReports: false,
          canManageDocuments: false,
          canAssignHouseWatchers: false,
          canViewHouseWatchingReports: true,
          canSubmitHouseWatchingReports: true,
        };
      default:
        return {
          canManageAllProperties: false,
          canManageOwnProperties: false,
          canViewAllTenants: false,
          canManageOwnTenants: false,
          canViewAllMaintenanceRequests: false,
          canCreateMaintenanceRequests: false,
          canManageUsers: false,
          canViewFinancialReports: false,
          canManageDocuments: false,
          canAssignHouseWatchers: false,
          canViewHouseWatchingReports: false,
          canSubmitHouseWatchingReports: false,
        };
    }
  };

  // Get user-friendly role display name (now use effective role)
  const getRoleDisplayName = (): string => {
    // Show dev admin indicator if active
    const baseRole = (() => {
      switch (effectiveRole) {
        case 'admin':
          return 'Administrator';
        case 'property_manager':
          return 'Property Manager';
        case 'property_owner':
          return 'Property Owner';
        case 'tenant':
          return 'Tenant';
        case 'house_watcher':
          return 'House Watcher';
        default:
          return 'User';
      }
    })();
    
    // Add dev admin indicator if active
    if (isDevelopment && isDevAdminActive && userRole !== 'admin') {
      return `${baseRole} (Dev Admin)`;
    }
    
    return baseRole;
  };

  // Check if user can perform a specific action on a resource
  const canPerformAction = (action: string, resource: string): boolean => {
    const permissions = getPermissions();
    
    // Examples of action checks
    if (action === 'view' && resource === 'properties') {
      return permissions.canManageAllProperties || permissions.canManageOwnProperties;
    }
    
    if (action === 'edit' && resource === 'properties') {
      return permissions.canManageAllProperties || permissions.canManageOwnProperties;
    }
    
    if (action === 'delete' && resource === 'properties') {
      return permissions.canManageAllProperties;
    }
    
    if (action === 'create' && resource === 'maintenance_request') {
      return permissions.canCreateMaintenanceRequests;
    }
    
    return false;
  };

  return {
    userRole: effectiveRole as UserRole, // Return effective role
    user,
    loading,
    isAdmin,
    isPropertyManager,
    isPropertyOwner,
    isTenant,
    isHouseWatcher,
    hasAdminAccess,
    canManageProperties,
    getPermissions,
    getRoleDisplayName,
    canPerformAction,
    permissions: getPermissions(),
  };
};