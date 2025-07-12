import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Search, User, Filter, ChevronDown, Settings, LogOut, Menu, Eye } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { TouchOptimized } from "@/components/mobile/TouchOptimized";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { ViewAsDropdown } from "@/components/ViewAsDropdown";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { user, signOut } = useAuth();
  const { isMobile, isTablet } = useMobileDetection();
  const { actualUserRole } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  if (isMobile) {
    return (
      <header className="bg-card border-b border-border px-4 py-4 shadow-sm animate-fade-in">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
          Skip to main content
        </a>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-xs text-muted-foreground truncate">Property overview</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Search Sheet */}
            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <SheetTrigger asChild>
                <TouchOptimized>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </TouchOptimized>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Search & Filter</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search properties, tenants..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Filter by:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {filterOptions.map((option) => (
                        <TouchOptimized key={option.id} onPress={() => handleFilterToggle(option.id)}>
                          <div className={`p-3 rounded-md border transition-all ${
                            selectedFilters.includes(option.id) 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : 'bg-card border-border'
                          }`}>
                            <span className="text-sm">{option.label}</span>
                          </div>
                        </TouchOptimized>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Notifications */}
            <TouchOptimized>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-9 w-9 p-0" 
                aria-label={`Notifications (${notificationCount} unread)`}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </TouchOptimized>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TouchOptimized>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.email ? getInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TouchOptimized>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border shadow-lg z-50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actualUserRole === 'admin' && (
                  <>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View As Mode
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {process.env.NODE_ENV === 'development' && (
                  <DropdownMenuItem onClick={() => window.location.href = '/dev-tools'}>
                    <Menu className="mr-2 h-4 w-4" />
                    Dev Tools
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border px-4 py-6 sm:px-6 lg:px-8 shadow-sm animate-fade-in">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
        Skip to main content
      </a>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="no-margin">
            <h1 className={`font-bold text-foreground ${isTablet ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your property overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties, tenants..." 
              className={`pl-10 transition-all duration-200 focus:w-72 ${isTablet ? 'w-48' : 'w-64'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search properties and tenants"
            />
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size={isTablet ? "sm" : "default"} 
                className="transition-all duration-200" 
                aria-label="Filter options"
              >
                <Filter className="h-4 w-4 mr-2" />
                {!isTablet && "Filter"}
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {selectedFilters.length}
                  </Badge>
                )}
                {!isTablet && <ChevronDown className="h-4 w-4 ml-1" />}
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
          
          {/* View As Dropdown for Admin Users */}
          {actualUserRole === 'admin' && <ViewAsDropdown />}
          
          {/* Development Role Switcher - Desktop */}
          {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
          
          {/* Notifications */}
          <Button 
            variant="outline" 
            size={isTablet ? "sm" : "default"} 
            className="relative transition-all duration-200" 
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
              <Button variant="ghost" className={`relative rounded-full ${isTablet ? 'h-8 w-8' : 'h-10 w-10'}`}>
                <Avatar className={isTablet ? "h-8 w-8" : "h-10 w-10"}>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border shadow-lg z-50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actualUserRole === 'admin' && (
                  <>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View As Mode
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {process.env.NODE_ENV === 'development' && (
                  <DropdownMenuItem onClick={() => window.location.href = '/dev-tools'}>
                    <Menu className="mr-2 h-4 w-4" />
                    Dev Tools
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}