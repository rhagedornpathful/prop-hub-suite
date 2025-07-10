import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, Clock, CheckCircle, AlertTriangle, Users, Search, Filter } from "lucide-react";
import { useState } from "react";

const Maintenance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockWorkOrders = [
    {
      id: "WO-001",
      title: "Leaking Kitchen Faucet",
      property: "123 Main St, Apt 4B",
      tenant: "John Smith",
      priority: "medium",
      status: "in-progress",
      assignedTo: "Mike's Plumbing",
      createdDate: "2024-07-08",
      dueDate: "2024-07-10",
      category: "Plumbing",
      description: "Kitchen faucet has been dripping for 3 days",
      estimatedCost: 150
    },
    {
      id: "WO-002",
      title: "Air Conditioning Not Working",
      property: "456 Oak Ave, Unit 2A",
      tenant: "Sarah Johnson",
      priority: "high",
      status: "pending",
      assignedTo: "Cool Air HVAC",
      createdDate: "2024-07-09",
      dueDate: "2024-07-11",
      category: "HVAC",
      description: "AC unit not cooling, possible refrigerant leak",
      estimatedCost: 400
    },
    {
      id: "WO-003",
      title: "Bathroom Light Fixture Replacement",
      property: "789 Pine St, Apt 1C",
      tenant: "Mike Wilson",
      priority: "low",
      status: "completed",
      assignedTo: "Bright Electric",
      createdDate: "2024-07-05",
      dueDate: "2024-07-07",
      category: "Electrical",
      description: "Replace broken light fixture in main bathroom",
      estimatedCost: 80
    },
    {
      id: "WO-004",
      title: "Garbage Disposal Jam",
      property: "123 Main St, Apt 4B",
      tenant: "John Smith",
      priority: "medium",
      status: "scheduled",
      assignedTo: "Fix-It Pro",
      createdDate: "2024-07-09",
      dueDate: "2024-07-12",
      category: "Plumbing",
      description: "Garbage disposal is jammed and not turning on",
      estimatedCost: 120
    }
  ];

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
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const filteredWorkOrders = mockWorkOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
                <p className="text-muted-foreground mt-1">Track work orders, contractors, and maintenance schedules</p>
              </div>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
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
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <p className="text-xs text-muted-foreground">2 in progress, 1 scheduled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <p className="text-xs text-muted-foreground">Waiting assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
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
                      {filteredWorkOrders.map((order) => (
                        <div key={order.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                                <h3 className="font-semibold text-foreground">{order.title}</h3>
                                <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1">{order.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.description}</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Property: </span>
                                  <span className="text-foreground">{order.property}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tenant: </span>
                                  <span className="text-foreground">{order.tenant}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Assigned to: </span>
                                  <span className="text-foreground">{order.assignedTo}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Category: </span>
                                  <span className="text-foreground">{order.category}</span>
                                </div>
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>Created: {new Date(order.createdDate).toLocaleDateString()}</span>
                                <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-lg font-semibold text-foreground">${order.estimatedCost}</div>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Maintenance;