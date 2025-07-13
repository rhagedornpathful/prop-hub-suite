import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  Camera, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Search,
  Filter,
  Menu,
  Home,
  Wrench,
  Calendar,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  property: string;
  created_date: string;
  due_date?: string;
  assigned_to?: string;
}

const MobileMaintenanceView = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - in real app, this would come from your data source
  const requests: MaintenanceRequest[] = [
    {
      id: "1",
      title: "Leaky Kitchen Faucet",
      description: "Kitchen faucet dripping constantly",
      priority: "medium",
      status: "pending",
      property: "123 Main St, Apt 2B",
      created_date: "2024-01-15",
      due_date: "2024-01-20"
    },
    {
      id: "2",
      title: "AC Not Working",
      description: "Air conditioning unit not cooling",
      priority: "high",
      status: "in-progress",
      property: "456 Oak Ave, Unit 5",
      created_date: "2024-01-14",
      assigned_to: "John Smith - HVAC"
    },
    {
      id: "3",
      title: "Burnt Out Light Bulb",
      description: "Hallway light bulb needs replacement",
      priority: "low",
      status: "completed",
      property: "789 Pine Rd, #1A",
      created_date: "2024-01-10"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateRequest = () => {
    toast({
      title: "Request Submitted",
      description: "Your maintenance request has been submitted successfully.",
    });
    setIsCreateOpen(false);
  };

  const QuickCreateForm = () => (
    <div className="space-y-4 p-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Issue Title</label>
        <Input placeholder="Brief description of the issue" />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Property</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prop1">123 Main St, Apt 2B</SelectItem>
            <SelectItem value="prop2">456 Oak Ave, Unit 5</SelectItem>
            <SelectItem value="prop3">789 Pine Rd, #1A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Priority</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea placeholder="Detailed description of the issue" rows={3} />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          <Camera className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
        <Button variant="outline" className="flex-1">
          <MapPin className="h-4 w-4 mr-2" />
          Location
        </Button>
      </div>

      <Button onClick={handleCreateRequest} className="w-full">
        Submit Request
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Maintenance</h1>
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Create Maintenance Request</SheetTitle>
              </SheetHeader>
              <QuickCreateForm />
            </SheetContent>
          </Sheet>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[120px] z-40 bg-background border-b">
          <TabsList className="w-full grid grid-cols-4 mx-4 my-2">
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="requests" className="space-y-4 mt-0">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.property}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(request.priority)} className="ml-2">
                      {request.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-3">{request.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('-', ' ')}
                      </Badge>
                      {request.assigned_to && (
                        <span className="text-xs text-muted-foreground">
                          Assigned to {request.assigned_to}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {request.due_date ? `Due ${request.due_date}` : request.created_date}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Camera className="h-4 w-4 mr-1" />
                      Photo
                    </Button>
                    <Button size="sm" className="flex-1">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">HVAC Inspection</p>
                      <p className="text-xs text-muted-foreground">456 Oak Ave, Unit 5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Jan 18</p>
                      <p className="text-xs text-muted-foreground">2:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Plumbing Repair</p>
                      <p className="text-xs text-muted-foreground">123 Main St, Apt 2B</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Jan 20</p>
                      <p className="text-xs text-muted-foreground">10:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="mt-0">
            <div className="space-y-3">
              {['123 Main St, Apt 2B', '456 Oak Ave, Unit 5', '789 Pine Rd, #1A'].map((property, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{property}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 5) + 1} active requests
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Emergency Request</p>
                      <p className="text-xs text-muted-foreground">
                        New emergency maintenance request requires immediate attention
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Work Completed</p>
                      <p className="text-xs text-muted-foreground">
                        Plumbing repair at 789 Pine Rd has been completed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileMaintenanceView;