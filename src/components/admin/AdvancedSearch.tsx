import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  Building, 
  Users, 
  Wrench, 
  FileText, 
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilter {
  id: string;
  label: string;
  value: string | number;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { label: string; value: string }[];
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'property' | 'tenant' | 'maintenance' | 'document' | 'message';
  href: string;
  metadata?: Record<string, any>;
}

interface AdvancedSearchProps {
  onSearch?: (query: string, filters: SearchFilter[]) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const searchCategories = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'properties', label: 'Properties', icon: Building },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'documents', label: 'Documents', icon: FileText }
];

const filterPresets = {
  properties: [
    { id: 'status', label: 'Status', value: '', type: 'select', options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Maintenance', value: 'maintenance' }
    ]},
    { id: 'city', label: 'City', value: '', type: 'text' },
    { id: 'rent_min', label: 'Min Rent', value: 0, type: 'number' },
    { id: 'rent_max', label: 'Max Rent', value: 0, type: 'number' }
  ],
  tenants: [
    { id: 'lease_status', label: 'Lease Status', value: '', type: 'select', options: [
      { label: 'Active', value: 'active' },
      { label: 'Expired', value: 'expired' },
      { label: 'Expiring Soon', value: 'expiring' }
    ]},
    { id: 'payment_status', label: 'Payment Status', value: '', type: 'select', options: [
      { label: 'Current', value: 'current' },
      { label: 'Late', value: 'late' },
      { label: 'Delinquent', value: 'delinquent' }
    ]}
  ],
  maintenance: [
    { id: 'priority', label: 'Priority', value: '', type: 'select', options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Urgent', value: 'urgent' }
    ]},
    { id: 'status', label: 'Status', value: '', type: 'select', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Completed', value: 'completed' }
    ]},
    { id: 'date_from', label: 'From Date', value: '', type: 'date' },
    { id: 'date_to', label: 'To Date', value: '', type: 'date' }
  ]
};

// Mock search results for demonstration
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: '123 Main Street',
    subtitle: 'Single Family Home • $2,500/month',
    type: 'property',
    href: '/properties/1',
    metadata: { city: 'Austin', status: 'active' }
  },
  {
    id: '2',
    title: 'John Smith',
    subtitle: 'Tenant at 123 Main Street • Lease expires Dec 2024',
    type: 'tenant',
    href: '/tenants/2',
    metadata: { lease_status: 'active', payment_status: 'current' }
  },
  {
    id: '3',
    title: 'Plumbing Repair',
    subtitle: 'Kitchen sink leak • High Priority',
    type: 'maintenance',
    href: '/maintenance/3',
    metadata: { priority: 'high', status: 'pending' }
  }
];

export function AdvancedSearch({ onSearch, onResultSelect, placeholder = "Search properties, tenants, maintenance...", className }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Filter results based on query and category
  const filteredResults = useMemo(() => {
    if (!debouncedQuery && filters.length === 0) return [];
    
    return mockResults.filter(result => {
      // Category filter
      if (activeCategory !== 'all' && result.type !== activeCategory.slice(0, -1)) {
        return false;
      }
      
      // Text search
      if (debouncedQuery) {
        const searchText = debouncedQuery.toLowerCase();
        if (!result.title.toLowerCase().includes(searchText) && 
            !result.subtitle?.toLowerCase().includes(searchText)) {
          return false;
        }
      }
      
      // Apply filters
      for (const filter of filters) {
        if (!filter.value) continue;
        
        const metadataValue = result.metadata?.[filter.id];
        if (filter.type === 'select' && metadataValue !== filter.value) {
          return false;
        }
        if (filter.type === 'text' && !String(metadataValue || '').toLowerCase().includes(String(filter.value).toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  }, [debouncedQuery, activeCategory, filters]);

  const handleFilterChange = useCallback((filterId: string, value: string | number) => {
    setFilters(prev => {
      const existing = prev.find(f => f.id === filterId);
      if (existing) {
        if (!value) {
          return prev.filter(f => f.id !== filterId);
        }
        return prev.map(f => f.id === filterId ? { ...f, value } : f);
      } else if (value) {
        const preset = filterPresets[activeCategory as keyof typeof filterPresets]?.find(p => p.id === filterId);
        if (preset) {
          return [...prev, { ...preset, value } as SearchFilter];
        }
      }
      return prev;
    });
  }, [activeCategory]);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    setIsOpen(false);
    onResultSelect?.(result);
  }, [onResultSelect]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'property': return Building;
      case 'tenant': return Users;
      case 'maintenance': return Wrench;
      case 'document': return FileText;
      default: return Search;
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-20"
              onFocus={() => setIsOpen(true)}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {filters.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-6 w-6 p-0"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[600px] p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Search Results</CardTitle>
                {filters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-3 w-3 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {/* Category Tabs */}
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="grid grid-cols-5 h-8">
                  {searchCategories.map(category => {
                    const IconComponent = category.icon;
                    return (
                      <TabsTrigger key={category.id} value={category.id} className="text-xs px-1">
                        <IconComponent className="h-3 w-3 mr-1" />
                        {category.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {/* Filter Section */}
                {showFilters && activeCategory !== 'all' && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Filters</div>
                    <div className="grid grid-cols-2 gap-2">
                      {filterPresets[activeCategory as keyof typeof filterPresets]?.map(filter => (
                        <div key={filter.id} className="space-y-1">
                          <label className="text-xs text-muted-foreground">{filter.label}</label>
                          {filter.type === 'select' ? (
                            <select
                              className="w-full h-7 text-xs rounded border bg-background px-2"
                              value={filters.find(f => f.id === filter.id)?.value || ''}
                              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                            >
                              <option value="">All</option>
                              {filter.options?.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type={filter.type}
                              placeholder={filter.label}
                              className="h-7 text-xs"
                              value={filters.find(f => f.id === filter.id)?.value || ''}
                              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-0">
              <Command className="border-0">
                <CommandList className="max-h-60">
                  {filteredResults.length === 0 ? (
                    <CommandEmpty>
                      {debouncedQuery || filters.length > 0 ? 'No results found.' : 'Start typing to search...'}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredResults.map(result => {
                        const IconComponent = getResultIcon(result.type);
                        return (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleResultClick(result)}
                            className="flex items-center gap-3 p-3"
                          >
                            <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{result.title}</div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}