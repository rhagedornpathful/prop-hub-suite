import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, Clock, CheckCircle, AlertTriangle, Users, Search, Filter, MapPin, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { ScheduleMaintenanceDialog } from "@/components/ScheduleMaintenanceDialog";

const Maintenance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const { data: maintenanceRequests = [], isLoading, refetch } = useMaintenanceRequests();

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

  const formatPropertyAddress = (request: any) => {
    if (!request.properties) return "Unknown Property";
    
    const { address, city, state, zip_code } = request.properties;
    let formattedAddress = address;
    
    if (city) formattedAddress += `, ${city}`;
    if (state) formattedAddress += `, ${state}`;
    if (zip_code) formattedAddress += ` ${zip_code}`;
    
    return formattedAddress;
  };

  const filteredWorkOrders = maintenanceRequests.filter(order => {
    const propertyAddress = formatPropertyAddress(order);
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.contractor_name && order.contractor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from real data
  const activeCount = maintenanceRequests.filter(r => r.status === 'in-progress' || r.status === 'scheduled').length;
  const pendingCount = maintenanceRequests.filter(r => r.status === 'pending').length;
  const completedThisMonth = maintenanceRequests.filter(r => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const createdAt = new Date(r.created_at);
    return r.status === 'completed' && createdAt >= monthStart;
  }).length;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
            <p className="text-muted-foreground mt-1">Track work orders, contractors, and maintenance schedules</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:bg-primary-dark"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
                  <Wrench className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
                  <p className="text-xs text-muted-foreground">In progress & scheduled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">Waiting assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Current month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">2.3</div>
                  <p className="text-xs text-muted-foreground">Days to completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different maintenance views */}
            <Tabs defaultValue="work-orders" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
                <TabsTrigger value="contractors">Contractors</TabsTrigger>
                <TabsTrigger value="schedule">Preventive Maintenance</TabsTrigger>
              </TabsList>

              {/* Work Orders */}
              <TabsContent value="work-orders">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Work Orders</CardTitle>
                        <CardDescription>Manage maintenance requests and work orders</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search work orders..."
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading maintenance requests...</p>
                        </div>
                      ) : filteredWorkOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No maintenance requests found.</p>
                          <Button className="mt-4" onClick={() => setShowScheduleDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Request
                          </Button>
                        </div>
                      ) : (
                        filteredWorkOrders.map((order) => (
                          <div key={order.id} className="border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="space-y-4 flex-1">
                                {/* Property Header - Most Prominent */}
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                  <MapPin className="h-5 w-5 text-primary" />
                                  <div>
                                    <h4 className="font-semibold text-lg text-primary">{formatPropertyAddress(order)}</h4>
                                    <p className="text-sm text-muted-foreground">Property Location</p>
                                  </div>
                                </div>

                                {/* Work Order Details */}
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{order.id}</span>
                                  <h3 className="font-semibold text-xl text-foreground">{order.title}</h3>
                                  <Badge className={`${getPriorityColor(order.priority)} border`}>{order.priority}</Badge>
                                  <Badge className={`${getStatusColor(order.status)} border`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{order.status}</span>
                                  </Badge>
                                </div>
                                
                                {order.description && (
                                  <p className="text-muted-foreground">{order.description}</p>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {order.contractor_name && (
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">Contractor:</span>
                                      <span className="text-foreground font-medium">{order.contractor_name}</span>
                                    </div>
                                  )}
                                  {order.contractor_contact && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Contact:</span>
                                      <span className="text-foreground">{order.contractor_contact}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {order.scheduled_date && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">Scheduled:</span>
                                      <span className="text-foreground">{new Date(order.scheduled_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right space-y-3 ml-6">
                                {order.estimated_cost && order.estimated_cost > 0 && (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <div className="text-xl font-semibold text-green-600">${order.estimated_cost}</div>
                                  </div>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contractors */}
              <TabsContent value="contractors">
                <Card>
                  <CardHeader>
                    <CardTitle>Contractors & Vendors</CardTitle>
                    <CardDescription>Manage your network of maintenance professionals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockContractors.map((contractor) => (
                        <div key={contractor.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-foreground">{contractor.name}</h3>
                              <p className="text-sm text-muted-foreground">{contractor.category}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-yellow-600">★</span>
                                  <span className="text-sm font-medium">{contractor.rating}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{contractor.phone}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <Badge variant="outline">
                                <Users className="w-3 h-3 mr-1" />
                                {contractor.activeJobs} active
                              </Badge>
                              <div>
                                <Button size="sm" variant="outline">
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preventive Maintenance */}
              <TabsContent value="schedule">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Scheduled Maintenance</CardTitle>
                      <CardDescription>Upcoming preventive maintenance tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border border-border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">HVAC Filter Replacement</h4>
                            <p className="text-sm text-muted-foreground">All Properties</p>
                          </div>
                          <Badge variant="outline">Due: Jul 15</Badge>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Fire Alarm Testing</h4>
                            <p className="text-sm text-muted-foreground">123 Main St</p>
                          </div>
                          <Badge variant="outline">Due: Jul 20</Badge>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Gutter Cleaning</h4>
                            <p className="text-sm text-muted-foreground">456 Oak Ave</p>
                          </div>
                          <Badge variant="outline">Due: Jul 25</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Calendar</CardTitle>
                      <CardDescription>Schedule new preventive maintenance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Quick Schedule Options:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline">HVAC Service</Button>
                          <Button size="sm" variant="outline">Plumbing Check</Button>
                          <Button size="sm" variant="outline">Electrical Inspection</Button>
                          <Button size="sm" variant="outline">Exterior Cleaning</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TabsContent>
        </Tabs>
        
        <ScheduleMaintenanceDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          onMaintenanceScheduled={() => {
            setShowScheduleDialog(false);
            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default Maintenance;