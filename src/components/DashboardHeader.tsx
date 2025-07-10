import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, Filter, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
  notificationCount?: number;
}

export function DashboardHeader({ 
  onSearch, 
  onFilterChange, 
  notificationCount = 0 
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filterOptions = useMemo(() => [
    { id: "properties", label: "Properties" },
    { id: "tenants", label: "Tenants" },
    { id: "maintenance", label: "Maintenance" },
    { id: "house-watching", label: "House Watching" }
  ], []);

  // Trigger search when debounced value changes
  useMemo(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleFilterToggle = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <header className="bg-card border-b border-border p-4 shadow-sm animate-fade-in">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
        Skip to main content
      </a>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your property overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties, tenants..." 
              className="pl-10 w-64 transition-all duration-200 focus:w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search properties and tenants"
            />
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover-scale" aria-label="Filter options">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {selectedFilters.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover border shadow-lg z-50">
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleFilterToggle(option.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 border rounded ${
                      selectedFilters.includes(option.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedFilters.includes(option.id) && (
                        <div className="w-full h-full flex items-center justify-center text-primary-foreground text-xs">✓</div>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <Button 
            variant="outline" 
            size="sm" 
            className="relative hover-scale" 
            aria-label={`Notifications (${notificationCount} unread)`}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover-scale" aria-label="User menu">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover border shadow-lg z-50" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}