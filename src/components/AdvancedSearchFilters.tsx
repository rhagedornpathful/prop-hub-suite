import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Calendar,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Building,
  DollarSign,
  Home,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import type { PropertyWithRelations } from '@/hooks/queries/useProperties';

interface FilterState {
  search: string;
  propertyType: string[];
  status: string[];
  priceRange: [number, number];
  bedroomRange: [number, number];
  bathroomRange: [number, number];
  sqftRange: [number, number];
  yearBuiltRange: [number, number];
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  amenities: string[];
  hasImages: boolean;
  hasMaintenanceIssues: boolean;
  serviceType: string[];
  ownerType: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  properties: PropertyWithRelations[];
  onFilterChange: (filteredProperties: PropertyWithRelations[]) => void;
  onSearchChange: (searchTerm: string) => void;
}

const defaultFilters: FilterState = {
  search: '',
  propertyType: [],
  status: [],
  priceRange: [0, 5000000],
  bedroomRange: [0, 10],
  bathroomRange: [0, 10],
  sqftRange: [0, 10000],
  yearBuiltRange: [1800, new Date().getFullYear()],
  location: { city: '', state: '', zipCode: '' },
  amenities: [],
  hasImages: false,
  hasMaintenanceIssues: false,
  serviceType: [],
  ownerType: [],
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  properties,
  onFilterChange,
  onSearchChange
}) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Debounce search input to reduce re-renders
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  
  const propertyTypes = ['single_family', 'condo', 'townhouse', 'duplex', 'multi_family', 'apartment'];
  const statusOptions = ['active', 'vacant', 'maintenance', 'inactive', 'archived'];
  const serviceTypes = ['property_management', 'house_watching'];
  const sortOptions = [
    { value: 'created_at', label: 'Date Added' },
    { value: 'address', label: 'Address' },
    { value: 'monthly_rent', label: 'Monthly Rent' },
    { value: 'estimated_value', label: 'Property Value' },
    { value: 'square_feet', label: 'Square Feet' },
    { value: 'year_built', label: 'Year Built' },
    { value: 'bedrooms', label: 'Bedrooms' },
    { value: 'bathrooms', label: 'Bathrooms' }
  ];

  const commonAmenities = [
    'pool', 'garage', 'fireplace', 'hardwood_floors', 'granite_countertops',
    'stainless_appliances', 'walk_in_closet', 'balcony', 'patio', 'ac', 'heating',
    'dishwasher', 'washer_dryer', 'parking'
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'search') {
      onSearchChange(value);
    }
    
    applyFilters(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const updateActiveFiltersCount = (currentFilters: FilterState) => {
    let count = 0;
    
    if (currentFilters.search) count++;
    if (currentFilters.propertyType.length > 0) count++;
    if (currentFilters.status.length > 0) count++;
    if (currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < 5000000) count++;
    if (currentFilters.bedroomRange[0] > 0 || currentFilters.bedroomRange[1] < 10) count++;
    if (currentFilters.bathroomRange[0] > 0 || currentFilters.bathroomRange[1] < 10) count++;
    if (currentFilters.sqftRange[0] > 0 || currentFilters.sqftRange[1] < 10000) count++;
    if (currentFilters.yearBuiltRange[0] > 1800 || currentFilters.yearBuiltRange[1] < new Date().getFullYear()) count++;
    if (currentFilters.location.city || currentFilters.location.state || currentFilters.location.zipCode) count++;
    if (currentFilters.amenities.length > 0) count++;
    if (currentFilters.hasImages) count++;
    if (currentFilters.hasMaintenanceIssues) count++;
    if (currentFilters.serviceType.length > 0) count++;
    if (currentFilters.ownerType.length > 0) count++;
    
    setActiveFiltersCount(count);
  };

  const applyFilters = (currentFilters: FilterState) => {
    let filtered = [...properties];

    // Text search
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(property =>
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state?.toLowerCase().includes(searchLower) ||
        property.zip_code?.toLowerCase().includes(searchLower) ||
        property.property_type?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower)
      );
    }

    // Property type filter
    if (currentFilters.propertyType.length > 0) {
      filtered = filtered.filter(property =>
        currentFilters.propertyType.includes(property.property_type || '')
      );
    }

    // Status filter
    if (currentFilters.status.length > 0) {
      filtered = filtered.filter(property =>
        currentFilters.status.includes(property.status || 'active')
      );
    }

    // Price range filter
    filtered = filtered.filter(property => {
      const price = property.monthly_rent || property.estimated_value || 0;
      return price >= currentFilters.priceRange[0] && price <= currentFilters.priceRange[1];
    });

    // Bedroom range filter
    filtered = filtered.filter(property => {
      const bedrooms = property.bedrooms || 0;
      return bedrooms >= currentFilters.bedroomRange[0] && bedrooms <= currentFilters.bedroomRange[1];
    });

    // Bathroom range filter
    filtered = filtered.filter(property => {
      const bathrooms = property.bathrooms || 0;
      return bathrooms >= currentFilters.bathroomRange[0] && bathrooms <= currentFilters.bathroomRange[1];
    });

    // Square feet range filter
    filtered = filtered.filter(property => {
      const sqft = property.square_feet || 0;
      return sqft >= currentFilters.sqftRange[0] && sqft <= currentFilters.sqftRange[1];
    });

    // Year built range filter
    filtered = filtered.filter(property => {
      const year = property.year_built || new Date().getFullYear();
      return year >= currentFilters.yearBuiltRange[0] && year <= currentFilters.yearBuiltRange[1];
    });

    // Location filters
    if (currentFilters.location.city) {
      filtered = filtered.filter(property =>
        property.city?.toLowerCase().includes(currentFilters.location.city.toLowerCase())
      );
    }
    if (currentFilters.location.state) {
      filtered = filtered.filter(property =>
        property.state?.toLowerCase().includes(currentFilters.location.state.toLowerCase())
      );
    }
    if (currentFilters.location.zipCode) {
      filtered = filtered.filter(property =>
        property.zip_code?.includes(currentFilters.location.zipCode)
      );
    }

    // Images filter
    if (currentFilters.hasImages) {
      filtered = filtered.filter(property =>
        property.images && property.images.length > 0
      );
    }

    // Maintenance issues filter
    if (currentFilters.hasMaintenanceIssues) {
      filtered = filtered.filter(property =>
        property.maintenance_requests && property.maintenance_requests.length > 0
      );
    }

    // Service type filter
    if (currentFilters.serviceType.length > 0) {
      filtered = filtered.filter(property =>
        currentFilters.serviceType.includes(property.service_type || 'property_management')
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      const aValue = a[currentFilters.sortBy as keyof PropertyWithRelations] || '';
      const bValue = b[currentFilters.sortBy as keyof PropertyWithRelations] || '';
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
    });

    onFilterChange(filtered);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onSearchChange('');
    onFilterChange(properties);
    setActiveFiltersCount(0);
  };

  const handleCheckboxChange = (filterKey: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    updateFilter(filterKey, newArray);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Always visible search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties by address, city, type..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
            aria-label="Search properties"
          />
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.hasImages ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('hasImages', !filters.hasImages)}
          >
            <Building className="h-3 w-3 mr-1" />
            Has Images
          </Button>
          <Button
            variant={filters.hasMaintenanceIssues ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('hasMaintenanceIssues', !filters.hasMaintenanceIssues)}
          >
            <Star className="h-3 w-3 mr-1" />
            Needs Attention
          </Button>
          {statusOptions.slice(0, 3).map(status => (
            <Button
              key={status}
              variant={filters.status.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => handleCheckboxChange('status', status, !filters.status.includes(status))}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Property Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="space-y-2">
                  {propertyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.propertyType.includes(type)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('propertyType', type, checked as boolean)
                        }
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('status', status, checked as boolean)
                        }
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Type</Label>
                <div className="space-y-2">
                  {serviceTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${type}`}
                        checked={filters.serviceType.includes(type)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('serviceType', type, checked as boolean)
                        }
                      />
                      <Label htmlFor={`service-${type}`} className="text-sm capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={5000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>

              {/* Bedroom Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Bedrooms: {filters.bedroomRange[0]} - {filters.bedroomRange[1]}
                </Label>
                <Slider
                  value={filters.bedroomRange}
                  onValueChange={(value) => updateFilter('bedroomRange', value as [number, number])}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="City"
                  value={filters.location.city}
                  onChange={(e) => updateFilter('location', { ...filters.location, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={filters.location.state}
                  onChange={(e) => updateFilter('location', { ...filters.location, state: e.target.value })}
                />
                <Input
                  placeholder="ZIP Code"
                  value={filters.location.zipCode}
                  onChange={(e) => updateFilter('location', { ...filters.location, zipCode: e.target.value })}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};