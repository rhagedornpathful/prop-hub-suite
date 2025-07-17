import { useMemo } from 'react';
import { useSearchContext } from '@/contexts/SearchContext';

// Types for searchable items
interface SearchableProperty {
  id: string;
  address: string;
  city?: string;
  state?: string;
  property_type?: string;
  status?: string;
}

interface SearchableTenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface SearchableMaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

interface SearchableHouseWatching {
  id: string;
  property_address: string;
  owner_name?: string;
  status?: string;
}

type SearchableItem = SearchableProperty | SearchableTenant | SearchableMaintenanceRequest | SearchableHouseWatching;

export function useSearch<T extends SearchableItem>(
  items: T[],
  itemType: 'properties' | 'tenants' | 'maintenance' | 'house-watching'
) {
  const { searchQuery, selectedFilters } = useSearchContext();

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply filter by category
    if (selectedFilters.length > 0) {
      if (!selectedFilters.includes(itemType)) {
        return []; // If this item type is not in selected filters, return empty
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter((item) => {
        switch (itemType) {
          case 'properties':
            const property = item as SearchableProperty;
            return (
              property.address?.toLowerCase().includes(query) ||
              property.city?.toLowerCase().includes(query) ||
              property.state?.toLowerCase().includes(query) ||
              property.property_type?.toLowerCase().includes(query) ||
              property.status?.toLowerCase().includes(query)
            );

          case 'tenants':
            const tenant = item as SearchableTenant;
            return (
              tenant.first_name?.toLowerCase().includes(query) ||
              tenant.last_name?.toLowerCase().includes(query) ||
              tenant.email?.toLowerCase().includes(query) ||
              tenant.phone?.toLowerCase().includes(query) ||
              `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(query)
            );

          case 'maintenance':
            const maintenance = item as SearchableMaintenanceRequest;
            return (
              maintenance.title?.toLowerCase().includes(query) ||
              maintenance.description?.toLowerCase().includes(query) ||
              maintenance.status?.toLowerCase().includes(query) ||
              maintenance.priority?.toLowerCase().includes(query)
            );

          case 'house-watching':
            const watching = item as SearchableHouseWatching;
            return (
              watching.property_address?.toLowerCase().includes(query) ||
              watching.owner_name?.toLowerCase().includes(query) ||
              watching.status?.toLowerCase().includes(query)
            );

          default:
            return true;
        }
      });
    }

    return filtered;
  }, [items, searchQuery, selectedFilters, itemType]);

  return {
    filteredItems,
    hasActiveSearch: searchQuery.trim().length > 0 || selectedFilters.length > 0,
    resultCount: filteredItems.length,
    totalCount: items.length,
  };
}

// Helper hook for searching across multiple data types
export function useGlobalSearch() {
  const { searchQuery, selectedFilters, isSearchActive } = useSearchContext();

  const shouldShowResults = (itemType: string) => {
    if (!isSearchActive) return true;
    if (selectedFilters.length === 0) return true;
    return selectedFilters.includes(itemType);
  };

  return {
    searchQuery,
    selectedFilters,
    isSearchActive,
    shouldShowResults,
  };
}