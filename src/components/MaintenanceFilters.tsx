import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  CalendarIcon, 
  X, 
  Users, 
  AlertTriangle,
  DollarSign,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";

interface MaintenanceFiltersProps {
  requests: MaintenanceRequest[];
  onFilterChange: (filteredRequests: MaintenanceRequest[]) => void;
  profiles: Array<{ user_id: string; first_name: string | null; last_name: string | null; }>;
}

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  assignedTo: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  costRange: {
    min: string;
    max: string;
  };
  overdue: boolean;
  unassigned: boolean;
}

const MaintenanceFilters = ({ requests, onFilterChange, profiles }: MaintenanceFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    assignedTo: [],
    dateRange: { from: undefined, to: undefined },
    costRange: { min: '', max: '' },
    overdue: false,
    unassigned: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  ];

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...requests];

    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.contractor_name?.toLowerCase().includes(searchLower) ||
        (request.properties?.address && request.properties.address.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (newFilters.status.length > 0) {
      filtered = filtered.filter(request => newFilters.status.includes(request.status));
    }

    // Priority filter
    if (newFilters.priority.length > 0) {
      filtered = filtered.filter(request => newFilters.priority.includes(request.priority));
    }

    // Assigned to filter
    if (newFilters.assignedTo.length > 0) {
      filtered = filtered.filter(request => 
        request.assigned_to && newFilters.assignedTo.includes(request.assigned_to)
      );
    }

    // Date range filter
    if (newFilters.dateRange.from || newFilters.dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        const fromMatch = !newFilters.dateRange.from || requestDate >= newFilters.dateRange.from;
        const toMatch = !newFilters.dateRange.to || requestDate <= newFilters.dateRange.to;
        return fromMatch && toMatch;
      });
    }

    // Cost range filter
    if (newFilters.costRange.min || newFilters.costRange.max) {
      filtered = filtered.filter(request => {
        const cost = request.estimated_cost || request.actual_cost || 0;
        const minMatch = !newFilters.costRange.min || cost >= parseFloat(newFilters.costRange.min);
        const maxMatch = !newFilters.costRange.max || cost <= parseFloat(newFilters.costRange.max);
        return minMatch && maxMatch;
      });
    }

    // Overdue filter
    if (newFilters.overdue) {
      filtered = filtered.filter(request => 
        request.due_date && 
        new Date(request.due_date) < new Date() && 
        request.status !== 'completed'
      );
    }

    // Unassigned filter
    if (newFilters.unassigned) {
      filtered = filtered.filter(request => !request.assigned_to);
    }

    onFilterChange(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'assignedTo', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      status: [],
      priority: [],
      assignedTo: [],
      dateRange: { from: undefined, to: undefined },
      costRange: { min: '', max: '' },
      overdue: false,
      unassigned: false,
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.status.length;
    count += filters.priority.length;
    count += filters.assignedTo.length;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.costRange.min || filters.costRange.max) count++;
    if (filters.overdue) count++;
    if (filters.unassigned) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders, properties, contractors..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.overdue ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('overdue', !filters.overdue)}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Overdue
          </Button>
          <Button
            variant={filters.unassigned ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('unassigned', !filters.unassigned)}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Unassigned
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('status', option.value)}
                    />
                    <Label 
                      htmlFor={`status-${option.value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Badge className={cn("text-xs", option.color)}>
                        {option.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Priority</Label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priority.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                    />
                    <Label 
                      htmlFor={`priority-${option.value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Badge className={cn("text-xs", option.color)}>
                        {option.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned To Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Assigned To</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {profiles.map((profile) => (
                  <div key={profile.user_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assigned-${profile.user_id}`}
                      checked={filters.assignedTo.includes(profile.user_id)}
                      onCheckedChange={() => toggleArrayFilter('assignedTo', profile.user_id)}
                    />
                    <Label 
                      htmlFor={`assigned-${profile.user_id}`}
                      className="cursor-pointer text-sm"
                    >
                      {profile.first_name} {profile.last_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Cost Range Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Cost Range</Label>
              <div className="flex gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.costRange.min}
                    onChange={(e) => updateFilter('costRange', { ...filters.costRange, min: e.target.value })}
                    className="pl-8 text-sm"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.costRange.max}
                    onChange={(e) => updateFilter('costRange', { ...filters.costRange, max: e.target.value })}
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceFilters;