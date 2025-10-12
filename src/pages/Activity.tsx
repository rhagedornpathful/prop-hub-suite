import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOptimizedActivities } from "@/hooks/useOptimizedActivities";
import { useDebounce } from "@/hooks/useDebounce";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActivityDetailDialog } from "@/components/ActivityDetailDialog";
import { ActivityTable, EmptyActivityState } from "@/components/activities/ActivityTable";
import { 
  Activity as ActivityIcon, 
  AlertCircle,
  Filter,
  Calendar as CalendarIcon,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Moved to activityHelpers.ts

interface ActivityFilters {
  search: string;
  activityType: string;
  status: string;
  priority: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
}

const ITEMS_PER_PAGE = 50;

export default function Activity() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    activityType: 'all',
    status: 'all',
    priority: 'all',
    dateRange: { from: undefined, to: undefined }
  });
  
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 300);

  // Use optimized React Query hook
  const { data: activities, isLoading, error, refetch } = useOptimizedActivities({
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    type: filters.activityType !== 'all' ? filters.activityType : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    priority: filters.priority !== 'all' ? filters.priority : undefined,
    dateFrom: filters.dateRange.from,
    dateTo: filters.dateRange.to,
    search: debouncedSearch
  });

  const handleFilterChange = useCallback((key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Memoized sorted activities
  const sortedActivities = useMemo(() => {
    return activities || [];
  }, [activities]);

  const handleActivityClick = useCallback((activity: any) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  }, []);

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const total = sortedActivities.length;
    const pending = sortedActivities.filter(a => a.status === 'pending').length;
    const inProgress = sortedActivities.filter(a => a.status === 'in-progress' || a.status === 'scheduled').length;
    const overdue = sortedActivities.filter(a => {
      const dueDate = a.metadata?.due_date || a.metadata?.scheduled_date;
      return dueDate && new Date(dueDate) < new Date() && !['completed', 'paid', 'cancelled'].includes(a.status);
    }).length;

    return { total, pending, inProgress, overdue };
  }, [sortedActivities]);

  // Pagination handlers
  const totalPages = Math.ceil((sortedActivities.length || 0) / ITEMS_PER_PAGE);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 bg-gradient-subtle min-h-screen">
        <div className="text-center space-y-3 py-6">
          <h1 className="text-2xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Activity Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">Monitor all property activities across your portfolio</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 bg-gradient-subtle min-h-screen">
        <div className="text-center space-y-3 py-6">
          <h1 className="text-2xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Activity Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">Monitor all property activities across your portfolio</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Error loading activities: {error.message}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 pb-24 md:pb-6 bg-gradient-subtle min-h-screen">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-2xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Activity Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-lg font-medium">
          Monitor all property activities across your portfolio
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-3 md:gap-6 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <ActivityIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{metrics.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-info/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-info">{metrics.inProgress}</p>
              </div>
              <div className="p-2 rounded-lg bg-info/10">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-destructive/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{metrics.overdue}</p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card className="border-primary/20 bg-gradient-glass backdrop-blur-sm shadow-colored">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-primary font-display">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="w-4 h-4" />
            </div>
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 mb-4">
            <Input
              placeholder="Search activities, properties, or descriptions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="h-9"
            />
            
            <div className="grid gap-3 md:grid-cols-4">
              <Select value={filters.activityType} onValueChange={(value) => handleFilterChange('activityType', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="property_check">Property Check</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="home_check">Home Check</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn(
                      "h-9 justify-start text-left font-normal min-w-0 flex-1",
                      !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          `${format(filters.dateRange.from, "MMM dd")} - ${format(filters.dateRange.to, "MMM dd")}`
                        ) : (
                          format(filters.dateRange.from, "MMM dd, y")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border border-border z-50" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => handleFilterChange('dateRange', range || { from: undefined, to: undefined })}
                    className={cn("p-3 pointer-events-auto")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-shrink-0"
                  onClick={() => setFilters({
                    search: '',
                    activityType: 'all',
                    status: 'all',
                    priority: 'all',
                    dateRange: { from: undefined, to: undefined }
                  })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Activities Table */}
      <Card className="border-primary/20 bg-gradient-glass backdrop-blur-sm shadow-colored">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary font-display">Recent Activities ({sortedActivities.length})</CardTitle>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedActivities.length > 0 ? (
            <ActivityTable 
              activities={sortedActivities}
              onActivityClick={handleActivityClick}
            />
          ) : (
            <EmptyActivityState />
          )}
        </CardContent>
      </Card>

      <ActivityDetailDialog
        activity={selectedActivity}
        open={showActivityDetail}
        onOpenChange={setShowActivityDetail}
      />
    </div>
  );
}