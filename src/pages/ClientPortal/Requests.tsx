import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Camera,
  Wrench,
  Droplets,
  Zap,
  Home,
  TreePine
} from "lucide-react";

const ClientRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("active");

  const [newRequest, setNewRequest] = useState({
    propertyId: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    preferredDate: "",
    preferredTime: ""
  });

  const [requests] = useState([
    {
      id: 1,
      propertyId: 1,
      property: "456 Oak Street",
      title: "Pool Maintenance",
      description: "Weekly pool cleaning and chemical balance check needed.",
      category: "Maintenance",
      priority: "Normal",
      status: "In Progress",
      dateCreated: "2024-01-05",
      dateUpdated: "2024-01-07",
      assignedTo: "Mike Rodriguez",
      estimatedCompletion: "2024-01-10",
      photos: [],
      notes: "Technician scheduled for Wednesday"
    },
    {
      id: 2,
      propertyId: 2,
      property: "123 Pine Avenue",
      title: "Sprinkler System Adjustment",
      description: "Sprinkler head #4 in front yard needs adjustment as noted in last inspection.",
      category: "Maintenance",
      priority: "High",
      status: "Pending",
      dateCreated: "2024-01-07",
      dateUpdated: "2024-01-07",
      assignedTo: null,
      estimatedCompletion: null,
      photos: [],
      notes: "Waiting for scheduling"
    },
    {
      id: 3,
      propertyId: 1,
      property: "456 Oak Street",
      title: "Holiday Decorations Removal",
      description: "Remove and store holiday decorations from exterior of property.",
      category: "General Service",
      priority: "Normal",
      status: "Completed",
      dateCreated: "2024-01-02",
      dateUpdated: "2024-01-04",
      assignedTo: "Sarah Chen",
      estimatedCompletion: "2024-01-04",
      photos: [],
      notes: "Decorations stored in garage"
    }
  ]);

  const properties = [
    { id: 1, address: "456 Oak Street" },
    { id: 2, address: "123 Pine Avenue" }
  ];

  const categories = [
    { value: "maintenance", label: "Maintenance", icon: Wrench },
    { value: "plumbing", label: "Plumbing", icon: Droplets },
    { value: "electrical", label: "Electrical", icon: Zap },
    { value: "landscaping", label: "Landscaping", icon: TreePine },
    { value: "general", label: "General Service", icon: Home },
    { value: "emergency", label: "Emergency", icon: AlertCircle }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
    { value: "normal", label: "Normal", color: "bg-green-100 text-green-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-success text-success-foreground";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-orange-100 text-orange-800";
      case "Cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priorities.find(p => p.label.toLowerCase() === priority.toLowerCase());
    return p ? p.color : "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "In Progress": return <Clock className="h-4 w-4" />;
      case "Pending": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    switch (selectedTab) {
      case "active": return request.status === "Pending" || request.status === "In Progress";
      case "completed": return request.status === "Completed";
      case "all": return true;
      default: return true;
    }
  });

  const handleSubmitRequest = () => {
    if (!newRequest.propertyId || !newRequest.category || !newRequest.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate request submission
    toast({
      title: "Request Submitted",
      description: "Your service request has been submitted successfully.",
    });

    setNewRequest({
      propertyId: "",
      category: "",
      priority: "",
      title: "",
      description: "",
      preferredDate: "",
      preferredTime: ""
    });
    setIsNewRequestOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`${window.location.pathname.includes('/demo') ? '/demo' : ''}/client-portal`)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Service Requests</h1>
              <p className="text-sm text-muted-foreground">Manage your property service requests</p>
            </div>
          </div>
          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Service Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property">Property *</Label>
                    <Select value={newRequest.propertyId} onValueChange={(value) => setNewRequest({...newRequest, propertyId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newRequest.category} onValueChange={(value) => setNewRequest({...newRequest, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Request Title *</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="Brief description of the request"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Provide detailed information about the service needed..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={newRequest.preferredDate}
                      onChange={(e) => setNewRequest({...newRequest, preferredDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredTime">Preferred Time</Label>
                    <Select value={newRequest.preferredTime} onValueChange={(value) => setNewRequest({...newRequest, preferredTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitRequest} className="bg-gradient-primary hover:bg-primary-dark">
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === "Pending").length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === "In Progress").length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === "Completed").length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{requests.length}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Service Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active ({requests.filter(r => r.status === "Pending" || r.status === "In Progress").length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({requests.filter(r => r.status === "Completed").length})</TabsTrigger>
                <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="border border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{request.title}</h3>
                            <Badge className={getStatusColor(request.status)} >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.property}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created: {request.dateCreated}
                            </span>
                            <span>Category: {request.category}</span>
                          </div>
                          <p className="text-foreground mb-3">{request.description}</p>
                          
                          {request.assignedTo && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>Assigned to: {request.assignedTo}</span>
                              {request.estimatedCompletion && (
                                <span>• Est. completion: {request.estimatedCompletion}</span>
                              )}
                            </div>
                          )}
                          
                          {request.notes && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-foreground"><strong>Notes:</strong> {request.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Last updated: {request.dateUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {request.status !== "Completed" && (
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedTab === "active" && "No active service requests at this time."}
                      {selectedTab === "completed" && "No completed service requests to show."}
                      {selectedTab === "all" && "No service requests have been submitted yet."}
                    </p>
                    {selectedTab === "active" && (
                      <Button onClick={() => setIsNewRequestOpen(true)} className="bg-gradient-primary hover:bg-primary-dark">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit First Request
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientRequests;