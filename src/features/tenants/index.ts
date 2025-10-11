// Tenants feature module exports
export { default as TenantsPage } from '@/pages/Tenants';

// Re-export hooks
export { useTenants } from '@/hooks/queries/useTenants';
export { useDeleteTenant } from '@/hooks/useDeleteTenant';

// Re-export components  
export { AddTenantDialog } from '@/components/AddTenantDialog';
