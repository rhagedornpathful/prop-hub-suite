/**
 * Role Combination Constants
 * Centralized role definitions to prevent inline arrays and ensure consistency
 */

export type AppRole = 'admin' | 'property_manager' | 'owner_investor' | 'tenant' | 'house_watcher';

/**
 * Common role combinations used throughout the application
 */
export const ROLE_COMBINATIONS = {
  // Full access roles
  ALL_ROLES: ['admin', 'property_manager', 'owner_investor', 'tenant', 'house_watcher'] as AppRole[],
  
  // Administrative roles
  ADMIN_ONLY: ['admin'] as AppRole[],
  ADMIN_AND_MANAGERS: ['admin', 'property_manager'] as AppRole[],
  
  // Management roles
  PROPERTY_MANAGERS: ['admin', 'property_manager'] as AppRole[],
  
  // Property access
  PROPERTY_STAKEHOLDERS: ['admin', 'property_manager', 'owner_investor'] as AppRole[],
  
  // Financial access
  FINANCIAL_ACCESS: ['admin', 'property_manager', 'owner_investor'] as AppRole[],
  
  // Maintenance access
  MAINTENANCE_ACCESS: ['admin', 'property_manager', 'tenant', 'house_watcher'] as AppRole[],
  
  // Tenant-related access
  TENANT_MANAGEMENT: ['admin', 'property_manager', 'tenant'] as AppRole[],
  
  // House watching access
  HOUSE_WATCHING: ['admin', 'property_manager', 'house_watcher'] as AppRole[],
  
  // Owners and investors
  OWNERS_ONLY: ['owner_investor'] as AppRole[],
  OWNERS_AND_MANAGERS: ['admin', 'property_manager', 'owner_investor'] as AppRole[],
  
  // Reporting access
  REPORTS_ACCESS: ['admin', 'property_manager', 'owner_investor'] as AppRole[],
  
  // Service management
  SERVICE_MANAGEMENT: ['admin', 'property_manager'] as AppRole[],
} as const;

/**
 * Role permission checks
 */
export const hasFinancialAccess = (role: string | null): boolean => {
  return role ? ROLE_COMBINATIONS.FINANCIAL_ACCESS.includes(role as AppRole) : false;
};

export const hasAdminAccess = (role: string | null): boolean => {
  return role === 'admin';
};

export const hasPropertyManagementAccess = (role: string | null): boolean => {
  return role ? ROLE_COMBINATIONS.PROPERTY_MANAGERS.includes(role as AppRole) : false;
};

export const hasMaintenanceAccess = (role: string | null): boolean => {
  return role ? ROLE_COMBINATIONS.MAINTENANCE_ACCESS.includes(role as AppRole) : false;
};
