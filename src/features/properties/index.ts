// Properties feature module exports
export { default as PropertiesPage } from '@/pages/Properties';
export { default as PropertyDetailPage } from '@/pages/PropertyDetail';

// Re-export hooks
export { useProperties } from '@/hooks/queries/useProperties';
export { useDeleteProperty } from '@/hooks/useDeleteProperty';

// Re-export components
export { PropertyCard } from '@/components/PropertyCard';
export { PropertyList } from '@/components/PropertyList';
export { AddPropertyDialog } from '@/components/AddPropertyDialog';
export { EditPropertyDialog } from '@/components/EditPropertyDialog';
export { PropertyDetailsDialog } from '@/components/PropertyDetailsDialog';
