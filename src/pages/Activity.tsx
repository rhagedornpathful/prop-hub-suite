import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllPropertyActivity } from "@/hooks/useAllPropertyActivity";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Activity as ActivityIcon, 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  AlertCircle,
  Search,
  Filter,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Eye,
  Edit,
  CheckSquare,
  XCircle,
  Clock,
  User,
  Play,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const activityTypeColors = {
  maintenance: "bg-orange-100 text-orange-800 border-orange-200",
  property_check: "bg-blue-100 text-blue-800 border-blue-200", 
  payment: "bg-green-100 text-green-800 border-green-200",
  status_change: "bg-purple-100 text-purple-800 border-purple-200"
};

const activityTypeIcons = {
  maintenance: Wrench,
  property_check: CheckCircle,
  payment: DollarSign,
  status_change: AlertCircle
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
  propertyType: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
  assignedUser: string;
}

export default function Activity() {
  const navigate = useNavigate();
  const { activities, isLoading, error, refetch } = useAllPropertyActivity();
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    activityType: 'all',
    status: 'all',
    propertyType: 'all',
    dateRange: { from: undefined, to: undefined },
    assignedUser: 'all'
  });
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.activityType === 'all' || activity.type === filters.activityType;
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;
    
    const activityDate = new Date(activity.date);
    const matchesDateRange = (!filters.dateRange.from || activityDate >= filters.dateRange.from) &&
                           (!filters.dateRange.to || activityDate <= filters.dateRange.to);
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  }) || [];

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on:`, selectedActivities);
    // TODO: Implement bulk actions
  };

  const handleQuickAction = (activityId: string, action: string, activity?: any) => {
    console.log(`Performing ${action} on activity:`, activityId);
    
    if (action === 'start_property_check' && activity) {
      // Navigate to property check page with the property ID
      const propertyId = activity.metadata?.property_id;
      if (propertyId) {
        navigate(`/property-check/${propertyId}`);
      }
    } else if (action === 'view_property_check_report' && activity) {
      // Navigate to property details and open the report dialog
      const propertyId = activity.metadata?.property_id;
      if (propertyId) {
        navigate(`/properties/${propertyId}?showPropertyCheck=${activityId}`);
      }
    }
    // TODO: Implement other quick actions
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
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor all property activities across your portfolio</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor all property activities across your portfolio</p>
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Activity Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all property activities across your portfolio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{activities?.length || 0}</p>
              </div>
              <ActivityIcon className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">
                  {activities?.filter(a => a.type === 'maintenance').length || 0}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Property Checks</p>
                <p className="text-2xl font-bold">
                  {activities?.filter(a => a.type === 'property_check').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">
                  {activities?.filter(a => a.type === 'payment').length || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.activityType} onValueChange={(value) => handleFilterChange('activityType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="property_check">Property Check</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => handleFilterChange('dateRange', range)}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                activityType: 'all',
                status: 'all',
                propertyType: 'all',
                dateRange: { from: undefined, to: undefined },
                assignedUser: 'all'
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedActivities.length} activities selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('approve')}>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign')}>
                  <User className="w-4 h-4 mr-1" />
                  Assign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedActivities.length === filteredActivities.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActivities(filteredActivities.map(a => a.id));
                      } else {
                        setSelectedActivities([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivities(prev => [...prev, activity.id]);
                        } else {
                          setSelectedActivities(prev => prev.filter(id => id !== activity.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {getActivityTypeBadge(activity.type)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      {activity.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{activity.metadata?.property_address || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activity.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(activity.date), 'h:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.amount ? (
                      <span className="font-medium">${activity.amount.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {activity.type === 'property_check' && activity.status === 'in_progress' && (
                          <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'start_property_check', activity)}>
                            <Play className="w-4 h-4 mr-2" />
                            Continue Check
                          </DropdownMenuItem>
                        )}
                        {activity.type === 'property_check' && activity.status === 'completed' && (
                          <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'view_property_check_report', activity)}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                        )}
                        {activity.type === 'property_check' && (activity.status === 'pending' || activity.status === 'scheduled') && (
                          <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'start_property_check', activity)}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Check
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'view')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'edit')}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {activity.type === 'maintenance' && activity.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'approve')}>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {activity.type === 'maintenance' && !activity.metadata?.assigned_to && (
                          <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'assign')}>
                            <User className="w-4 h-4 mr-2" />
                            Assign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleQuickAction(activity.id, 'schedule')}>
                          <Clock className="w-4 h-4 mr-2" />
                          Schedule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activities found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}