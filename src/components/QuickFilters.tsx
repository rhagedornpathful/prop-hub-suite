import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface QuickFilter {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  onFilterChange: (filterId: string, values: string[]) => void;
  activeFilters: Record<string, string[]>;
}

export function QuickFilters({ filters, onFilterChange, activeFilters }: QuickFiltersProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const handleToggle = (filterId: string, value: string, multiple: boolean) => {
    const current = activeFilters[filterId] || [];
    
    if (multiple) {
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      onFilterChange(filterId, newValues);
    } else {
      const newValues = current.includes(value) ? [] : [value];
      onFilterChange(filterId, newValues);
      setOpenFilter(null);
    }
  };

  const clearFilter = (filterId: string) => {
    onFilterChange(filterId, []);
  };

  const getActiveCount = (filterId: string) => {
    return (activeFilters[filterId] || []).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const activeCount = getActiveCount(filter.id);
        const hasActive = activeCount > 0;

        return (
          <Popover
            key={filter.id}
            open={openFilter === filter.id}
            onOpenChange={(open) => setOpenFilter(open ? filter.id : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant={hasActive ? 'default' : 'outline'}
                size="sm"
                className="h-8"
              >
                {filter.label}
                {hasActive && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-popover" align="start">
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-medium">{filter.label}</span>
                  {hasActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(filter.id)}
                      className="h-auto px-2 py-0.5 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="border-t" />
                {filter.options.map((option) => {
                  const isActive = (activeFilters[filter.id] || []).includes(option.value);
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleToggle(filter.id, option.value, filter.multiple || false)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isActive && <Check className="w-4 h-4" />}
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {option.count !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5">
                          {option.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
      
      {Object.keys(activeFilters).some(key => activeFilters[key].length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            filters.forEach(filter => onFilterChange(filter.id, []));
          }}
          className="h-8"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}
