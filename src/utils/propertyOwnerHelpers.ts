import type { Tables } from "@/integrations/supabase/types";

export type PropertyOwner = Tables<'property_owners'> & {
  property_count?: number;
};

export const PAYMENT_METHODS = [
  'check',
  'direct_deposit',
  'wire_transfer',
  'ach'
] as const;

export const getOwnerDisplayName = (owner: PropertyOwner): string => {
  return owner.company_name || `${owner.first_name} ${owner.last_name}`;
};

export const getOwnerInitials = (owner: PropertyOwner): string => {
  if (owner.company_name) {
    return owner.company_name.charAt(0).toUpperCase();
  }
  return `${owner.first_name.charAt(0)}${owner.last_name.charAt(0)}`.toUpperCase();
};

export const formatPaymentMethod = (method: string): string => {
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export type SortField = 'name' | 'property_count' | 'created_at' | 'email';
export type SortOrder = 'asc' | 'desc';

export const sortOwners = (
  owners: PropertyOwner[],
  field: SortField,
  order: SortOrder
): PropertyOwner[] => {
  return [...owners].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (field) {
      case 'name':
        aVal = getOwnerDisplayName(a).toLowerCase();
        bVal = getOwnerDisplayName(b).toLowerCase();
        break;
      case 'property_count':
        aVal = a.property_count || 0;
        bVal = b.property_count || 0;
        break;
      case 'created_at':
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
        break;
      case 'email':
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};
