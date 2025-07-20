import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  Bell,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Edit,
  Play,
  Smartphone,
  Zap,
  Activity,
  Workflow
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMaintenanceRequests, useUpdateMaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { ScheduleMaintenanceDialog } from "@/components/ScheduleMaintenanceDialog";
import MaintenanceCalendar from "@/components/MaintenanceCalendar";
import MaintenanceDetailsDialog from "@/components/MaintenanceDetailsDialog";
import MaintenanceAlerts from "@/components/MaintenanceAlerts";
import MaintenanceDashboard from "@/components/MaintenanceDashboard";
import MaintenanceFilters from "@/components/MaintenanceFilters";
import VendorManagementSystem from "@/components/VendorManagementSystem";
import { AdvancedAnalyticsDashboard } from "@/components/AdvancedAnalyticsDashboard";
import OwnerPortalSystem from "@/components/OwnerPortalSystem";
import { RealTimeNotificationSystem } from "@/components/RealTimeNotificationSystem";
import MobileMaintenanceView from "@/components/mobile/MobileMaintenanceView";
import IntegrationHub from "@/components/IntegrationHub";
import AutomationWorkflows from "@/components/AutomationWorkflows";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import type { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";

const Maintenance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [showMobileView, setShowMobileView] = useState(false);

  const { data: maintenanceRequests = [], isLoading, refetch } = useMaintenanceRequests();
  const { data: profiles = [] } = useProfiles();
  const updateMaintenanceRequest = useUpdateMaintenanceRequest();

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleStartWork = (request: MaintenanceRequest) => {
    updateMaintenanceRequest.mutate({
      id: request.id,
      updates: {
        status: 'in-progress',
        started_at: new Date().toISOString()
      }
    });
  };

  const handleCompleteWork = (request: MaintenanceRequest) => {
    updateMaintenanceRequest.mutate({
      id: request.id,
      updates: {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Wrench className="w-4 h-4" />;
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatPropertyAddress = (request: MaintenanceRequest) => {
    if (!request.properties) return "Unknown Property";
    
    const { address, city, state, zip_code } = request.properties;
    let formattedAddress = address;
    
    if (city) formattedAddress += `, ${city}`;
    if (state) formattedAddress += `, ${state}`;
    if (zip_code) formattedAddress += ` ${zip_code}`;
    
    return formattedAddress;
  };

  // Apply basic filters for backward compatibility
  const basicFilteredRequests = (filteredRequests.length > 0 ? filteredRequests : maintenanceRequests).filter(order => {
    const propertyAddress = formatPropertyAddress(order);
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.contractor_name && order.contractor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mockContractors = [
    {
      id: 1,
      name: "Mike's Plumbing",
      category: "Plumbing",
      rating: 4.8,
      activeJobs: 2,
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      name: "Cool Air HVAC",
      category: "HVAC",
      rating: 4.6,
      activeJobs: 1,
      phone: "(555) 234-5678"
    },
    {
      id: 3,
      name: "Bright Electric",
      category: "Electrical",
      rating: 4.9,
      activeJobs: 0,
      phone: "(555) 345-6789"
    },
    {
      id: 4,
      name: "Fix-It Pro",
      category: "General",
      rating: 4.7,
      activeJobs: 1,
      phone: "(555) 456-7890"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading maintenance management system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" />
              Maintenance Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time work order tracking, scheduling, and analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button 
              className="bg-gradient-primary hover:bg-primary-dark flex items-center gap-2"
              onClick={() => setShowScheduleDialog(true)}
            >
              <Plus className="w-4 h-4" />
              New Work Order
            </Button>
          </div>
        </div>

        {/* Critical Alerts Section */}
        <MaintenanceAlerts 
          requests={maintenanceRequests} 
          onViewRequest={handleViewRequest}
        />

        {/* Analytics Dashboard */}
        <MaintenanceDashboard requests={maintenanceRequests} />

        {/* Advanced Filters */}
        <MaintenanceFilters 
          requests={maintenanceRequests}
          onFilterChange={setFilteredRequests}
          profiles={profiles}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="work-orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="work-orders" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="owner-portal" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Owners</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* Work Orders Tab */}
          <TabsContent value="work-orders">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Work Orders
                      <Badge variant="secondary" className="ml-2">
                        {basicFilteredRequests.length} of {maintenanceRequests.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Manage and track all maintenance requests</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Quick search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {basicFilteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-lg">No maintenance requests found</p>
                      <p className="text-muted-foreground/80 mb-6">Create your first work order to get started</p>
                      <Button 
                        className="bg-gradient-primary hover:bg-primary-dark" 
                        onClick={() => setShowScheduleDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Request
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {basicFilteredRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="group border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-white hover:to-primary/5"
                        >
                          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                            {/* Main Content */}
                            <div className="space-y-4 flex-1">
                              {/* Property Header */}
                              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-lg text-primary truncate">
                                    {formatPropertyAddress(request)}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">Property Location</p>
                                </div>
                              </div>

                              {/* Work Order Details */}
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                                  #{request.id.slice(-8)}
                                </span>
                                <h3 className="font-semibold text-xl text-foreground min-w-0 flex-1">
                                  {request.title}
                                </h3>
                                <div className="flex gap-2">
                                  <Badge className={`${getPriorityColor(request.priority)} border`}>
                                    {request.priority}
                                  </Badge>
                                  <Badge className={`${getStatusColor(request.status)} border`}>
                                    {getStatusIcon(request.status)}
                                    <span className="ml-1">{request.status}</span>
                                  </Badge>
                                </div>
                              </div>
                              
                              {request.description && (
                                <p className="text-muted-foreground text-sm">
                                  {request.description}
                                </p>
                              )}
                              
                              {/* Additional Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                {request.contractor_name && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Contractor:</span>
                                    <span className="text-foreground font-medium">
                                      {request.contractor_name}
                                    </span>
                                  </div>
                                )}
                                {request.assigned_to && request.assigned_user && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Assigned:</span>
                                    <span className="text-foreground font-medium">
                                      {request.assigned_user.first_name} {request.assigned_user.last_name}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Created:</span>
                                  <span className="text-foreground">
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {request.scheduled_date && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Scheduled:</span>
                                    <span className="text-foreground">
                                      {new Date(request.scheduled_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {request.due_date && (
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span className="text-muted-foreground">Due:</span>
                                    <span className={`font-medium ${
                                      new Date(request.due_date) < new Date() ? 'text-red-600' : 'text-foreground'
                                    }`}>
                                      {new Date(request.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Panel */}
                            <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                              {(request.estimated_cost && request.estimated_cost > 0) || 
                               (request.actual_cost && request.actual_cost > 0) ? (
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-green-600">
                                      ${(request.actual_cost || request.estimated_cost)?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-green-600">
                                      {request.actual_cost ? 'Actual' : 'Estimated'}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                              
                              <div className="flex lg:flex-col gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewRequest(request)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                                 {request.status === 'scheduled' && (
                                   <Button 
                                     size="sm"
                                     onClick={() => handleStartWork(request)}
                                     className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                   >
                                     <Play className="w-4 h-4" />
                                     Start
                                   </Button>
                                 )}
                                 {request.status === 'in-progress' && (
                                   <Button 
                                     size="sm"
                                     onClick={() => handleCompleteWork(request)}
                                     className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                   >
                                     <CheckCircle className="w-4 h-4" />
                                     Complete
                                   </Button>
                                 )}
                                 {request.status === 'pending' && (
                                   <Button 
                                     size="sm"
                                     variant="default"
                                     onClick={() => handleViewRequest(request)}
                                     className="flex items-center gap-2"
                                   >
                                     <Edit className="w-4 h-4" />
                                     Assign
                                   </Button>
                                 )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <MaintenanceCalendar />
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors">
            <VendorManagementSystem />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          {/* Owner Portal Tab */}
          <TabsContent value="owner-portal">
            <OwnerPortalSystem />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <RealTimeNotificationSystem />
          </TabsContent>

          {/* Mobile Tab */}
          <TabsContent value="mobile">
            <MobileMaintenanceView />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <IntegrationHub />
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation">
            <AutomationWorkflows />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ScheduleMaintenanceDialog 
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />
        
        <MaintenanceDetailsDialog
          request={selectedRequest}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      </div>
    </div>
  );
};

export default Maintenance;