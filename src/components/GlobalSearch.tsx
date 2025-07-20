import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Users, Wrench, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/queries/useProperties';
import { useTenants } from '@/hooks/queries/useTenants';
import { useMaintenanceRequests } from '@/hooks/queries/useMaintenanceRequests';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'property' | 'tenant' | 'maintenance' | 'document';
  icon: React.ComponentType<any>;
  action: () => void;
  relevance: number;
}

interface GlobalSearchProps {
  isExpanded?: boolean;
  onExpand?: (expanded: boolean) => void;
  className?: string;
}

export const GlobalSearch = ({ 
  isExpanded = false, 
  onExpand,
  className 
}: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  
  const { data: propertiesData } = useProperties();
  const { data: tenants = [] } = useTenants();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  
  const properties = Array.isArray(propertiesData) ? propertiesData : propertiesData?.properties || [];

  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return [];
    }

    const results: SearchResult[] = [];
    const searchLower = debouncedQuery.toLowerCase();

    // Search properties
    properties.forEach((property) => {
      const searchableText = [
        property.address,
        property.city,
        property.state,
        property.property_type,
        property.description
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        const relevance = property.address?.toLowerCase().includes(searchLower) ? 10 : 5;
        results.push({
          id: `property-${property.id}`,
          title: property.address || 'Unknown Address',
          subtitle: `${property.city}, ${property.state} • ${property.property_type}`,
          type: 'property',
          icon: Building,
          action: () => navigate(`/property/${property.id}`),
          relevance
        });
      }
    });

    // Search tenants
    tenants.forEach((tenant) => {
      const searchableText = [
        tenant.first_name,
        tenant.last_name,
        tenant.email,
        tenant.phone
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        const relevance = `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchLower) ? 10 : 5;
        results.push({
          id: `tenant-${tenant.id}`,
          title: `${tenant.first_name} ${tenant.last_name}`,
          subtitle: tenant.email || tenant.phone || 'Tenant',
          type: 'tenant',
          icon: Users,
          action: () => navigate(`/tenants?highlight=${tenant.id}`),
          relevance
        });
      }
    });

    // Search maintenance requests
    maintenanceRequests.forEach((request) => {
      const searchableText = [
        request.title,
        request.description,
        request.category,
        request.priority,
        request.status
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        const relevance = request.title?.toLowerCase().includes(searchLower) ? 10 : 5;
        results.push({
          id: `maintenance-${request.id}`,
          title: request.title || 'Maintenance Request',
          subtitle: `${request.category} • ${request.priority} priority`,
          type: 'maintenance',
          icon: Wrench,
          action: () => navigate(`/maintenance?highlight=${request.id}`),
          relevance
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }, [debouncedQuery, properties, tenants, maintenanceRequests, navigate]);

  useEffect(() => {
    setShowResults(isExpanded && query.length >= 2 && searchResults.length > 0);
  }, [isExpanded, query, searchResults]);

  const handleInputFocus = () => {
    if (!isExpanded && onExpand) {
      onExpand(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    if (onExpand) {
      onExpand(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    result.action();
    setQuery('');
    setShowResults(false);
    if (onExpand) {
      onExpand(false);
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'property': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'tenant': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'maintenance': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'document': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search properties, tenants, maintenance..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-9 pr-10"
          aria-label="Global search"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="p-2 space-y-1" role="listbox" aria-label="Search results">
                {searchResults.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors text-left"
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{result.title}</p>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getTypeColor(result.type))}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            
            {searchResults.length === 0 && query.length >= 2 && (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try searching with different keywords</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};