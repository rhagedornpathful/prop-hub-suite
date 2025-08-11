import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllPropertyActivity } from "@/hooks/useAllPropertyActivity";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActivityDetailDialog } from "@/components/ActivityDetailDialog";
import { 
  Activity as ActivityIcon, 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  AlertCircle,
  Filter,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  User2,
  MapPin,
  Eye,
  Clock
} from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const activityTypeColors = {
  maintenance: "bg-orange-100 text-orange-800 border-orange-200",
  property_check: "bg-blue-100 text-blue-800 border-blue-200", 
  payment: "bg-green-100 text-green-800 border-green-200",
  home_check: "bg-purple-100 text-purple-800 border-purple-200"
};

const activityTypeIcons = {
  maintenance: Wrench,
  property_check: CheckCircle,
  payment: DollarSign,
  home_check: Eye
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  'in-progress': "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200"
};

interface ActivityFilters {
  search: string;
  activityType: string;
  status: string;
  priority: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
}

export default function Activity() {
  const navigate = useNavigate();
  const { activities, isLoading, error, refetch } = useAllPropertyActivity();
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    activityType: 'all',
    status: 'all',
    priority: 'all',
    dateRange: { from: undefined, to: undefined }
  });
  
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = !filters.search || 
      activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.metadata?.property_address?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.activityType === 'all' || activity.type === filters.activityType;
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;
    const matchesPriority = filters.priority === 'all' || activity.metadata?.priority === filters.priority;
    
    const activityDate = new Date(activity.date);
    const matchesDateRange = (!filters.dateRange.from || activityDate >= filters.dateRange.from) &&
                           (!filters.dateRange.to || activityDate <= filters.dateRange.to);
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDateRange;
  }) || [];

  // Sort activities by date (newest first)
  const sortedActivities = filteredActivities.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };

  const getActivityMetrics = () => {
    const total = filteredActivities.length;
    const pending = filteredActivities.filter(a => a.status === 'pending').length;
    const inProgress = filteredActivities.filter(a => a.status === 'in-progress' || a.status === 'scheduled').length;
    const overdue = filteredActivities.filter(a => {
      const dueDate = a.metadata?.due_date || a.metadata?.scheduled_date;
      return dueDate && new Date(dueDate) < new Date() && !['completed', 'paid', 'cancelled'].includes(a.status);
    }).length;

    return { total, pending, inProgress, overdue };
  };

  const metrics = getActivityMetrics();

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) return null;
    return (
      <Badge variant="outline" className={cn(
        "text-xs",
        priority === 'high' ? 'border-red-200 text-red-800' :
        priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
        'border-green-200 text-green-800'
      )}>
        {priority}
      </Badge>
    );
  };

  const getRelativeDate = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();
    
    if (isToday(activityDate)) {
      return `Today, ${format(activityDate, 'h:mm a')}`;
    } else if (isYesterday(activityDate)) {
      return `Yesterday, ${format(activityDate, 'h:mm a')}`;
    } else {
      const daysDiff = differenceInDays(now, activityDate);
      if (daysDiff <= 7) {
        return `${daysDiff} days ago`;
      } else {
        return format(activityDate, 'MMM d, yyyy');
      }
    }
  };

  const getActivityIcon = (type: string) => {
    const IconComponent = activityTypeIcons[type as keyof typeof activityTypeIcons] || ActivityIcon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    return (
      <Badge variant="outline" className={cn("text-xs", statusColors[status as keyof typeof statusColors])}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getActivityTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className={cn("text-xs", activityTypeColors[type as keyof typeof activityTypeColors])}>
        {getActivityIcon(type)}
        <span className="ml-1">{type.replace('_', ' ')}</span>
      </Badge>
    );
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
              <p>Error loading activities: {error}</p>
              <Button onClick={refetch} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 bg-gradient-subtle min-h-screen">
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
        <CardHeader>
          <CardTitle className="text-primary font-display">Recent Activities ({sortedActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActivities.map((activity) => (
                <TableRow 
                  key={activity.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleActivityClick(activity)}
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityTypeBadge(activity.type)}
                        </div>
                        <div className="font-medium text-sm">{activity.title}</div>
                        {activity.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{activity.metadata?.property_address || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activity.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(activity.metadata?.priority)}
                  </TableCell>
                  <TableCell>
                    {activity.metadata?.assigned_to_name ? (
                      <div className="flex items-center gap-1 text-sm">
                        <User2 className="w-3 h-3 text-muted-foreground" />
                        <span>{activity.metadata.assigned_to_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getRelativeDate(activity.date)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activities found matching your filters</p>
            </div>
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