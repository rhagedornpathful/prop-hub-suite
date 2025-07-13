import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  DollarSign, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Home,
  Users,
  Settings,
  Bell,
  Mail,
  Phone,
  MapPin,
  Eye,
  Download,
  Filter,
  Search,
  MessageSquare,
  Wrench,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ApprovalRequest {
  id: string;
  type: 'maintenance' | 'expense' | 'tenant' | 'lease';
  title: string;
  description: string;
  amount?: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  property: string;
  documents?: string[];
}

interface PropertyFinancials {
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
  expenses: number;
  netIncome: number;
  occupancyRate: number;
  maintenanceCosts: number;
  roi: number;
}

const OwnerPortalSystem = () => {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("pending");
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    maintenanceAlerts: true,
    financialReports: true,
    tenantUpdates: false
  });

  // Mock data
  const approvalRequests: ApprovalRequest[] = [
    {
      id: "1",
      type: "maintenance",
      title: "HVAC System Repair - Unit 3A",
      description: "Air conditioning unit requires compressor replacement. Tenant has been without AC for 2 days.",
      amount: 1250,
      requestedBy: "Property Manager",
      requestedAt: "2024-01-13T09:30:00Z",
      status: "pending",
      priority: "urgent",
      property: "Sunset Apartments",
      documents: ["hvac-estimate.pdf", "tenant-complaint.pdf"]
    },
    {
      id: "2", 
      type: "expense",
      title: "Landscaping Service - Q1",
      description: "Quarterly landscaping maintenance for common areas including tree trimming and lawn care.",
      amount: 850,
      requestedBy: "Property Manager",
      requestedAt: "2024-01-12T14:15:00Z",
      status: "pending",
      priority: "medium",
      property: "Green Valley Complex"
    },
    {
      id: "3",
      type: "tenant",
      title: "New Tenant Application - Unit 2B", 
      description: "Tenant application approval for Sarah Johnson. Credit score: 720, Income: $65,000/year.",
      requestedBy: "Leasing Agent",
      requestedAt: "2024-01-11T16:45:00Z",
      status: "pending",
      priority: "medium",
      property: "Sunset Apartments"
    },
    {
      id: "4",
      type: "maintenance",
      title: "Plumbing Repair - Building B",
      description: "Main water line leak in basement. Emergency repair completed, pending approval for costs.",
      amount: 2100,
      requestedBy: "Emergency Contractor",
      requestedAt: "2024-01-10T08:20:00Z",
      status: "approved",
      priority: "urgent",
      property: "Green Valley Complex"
    }
  ];

  const propertyFinancials: PropertyFinancials[] = [
    {
      propertyId: "1",
      propertyName: "Sunset Apartments",
      monthlyRent: 15600,
      expenses: 4200,
      netIncome: 11400,
      occupancyRate: 95,
      maintenanceCosts: 1800,
      roi: 8.2
    },
    {
      propertyId: "2", 
      propertyName: "Green Valley Complex",
      monthlyRent: 22400,
      expenses: 6800,
      netIncome: 15600,
      occupancyRate: 92,
      maintenanceCosts: 2400,
      roi: 7.8
    },
    {
      propertyId: "3",
      propertyName: "Metro Heights",
      monthlyRent: 18900,
      expenses: 5100,
      netIncome: 13800,
      occupancyRate: 88,
      maintenanceCosts: 2200,
      roi: 6.9
    }
  ];

  const handleApprovalAction = (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    console.log(`${action} request ${requestId}`, notes);
    // Implementation would update the request status
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-50 border-green-200";
      case "rejected": return "text-red-600 bg-red-50 border-red-200";
      case "pending": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredRequests = approvalRequests.filter(req => 
    approvalFilter === "all" || req.status === approvalFilter
  );

  const totalIncome = propertyFinancials.reduce((sum, prop) => sum + prop.netIncome, 0);
  const totalExpenses = propertyFinancials.reduce((sum, prop) => sum + prop.expenses, 0);
  const avgROI = propertyFinancials.reduce((sum, prop) => sum + prop.roi, 0) / propertyFinancials.length;
  const avgOccupancy = propertyFinancials.reduce((sum, prop) => sum + prop.occupancyRate, 0) / propertyFinancials.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                Property Owner Portal
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive oversight and approval workflows for property management
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="1">Sunset Apartments</SelectItem>
                  <SelectItem value="2">Green Valley Complex</SelectItem>
                  <SelectItem value="3">Metro Heights</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Net Income</p>
                        <p className="text-2xl font-bold">${totalIncome.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+5.2%</span>
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average ROI</p>
                        <p className="text-2xl font-bold">{avgROI.toFixed(1)}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+0.3%</span>
                        </div>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                        <p className="text-2xl font-bold">{Math.round(avgOccupancy)}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+2.1%</span>
                        </div>
                      </div>
                      <Home className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Approvals</p>
                        <p className="text-2xl font-bold">
                          {approvalRequests.filter(r => r.status === 'pending').length}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs text-yellow-600">Action Required</span>
                        </div>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Urgent Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {approvalRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{request.title}</p>
                            <p className="text-xs text-muted-foreground">{request.property}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(request.requestedAt), "MMM dd, h:mm a")}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} border text-xs`}>
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Urgent Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {approvalRequests
                        .filter(r => r.priority === 'urgent' && r.status === 'pending')
                        .map((request) => (
                          <div key={request.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-red-900">{request.title}</h4>
                              {request.amount && (
                                <Badge variant="destructive">${request.amount}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-red-700 mb-2">{request.description}</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                Review Now
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search approval requests..." className="pl-10" />
                </div>
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              {request.type === 'maintenance' && <Wrench className="w-5 h-5 text-blue-600" />}
                              {request.type === 'expense' && <DollarSign className="w-5 h-5 text-green-600" />}
                              {request.type === 'tenant' && <Users className="w-5 h-5 text-purple-600" />}
                              {request.type === 'lease' && <FileText className="w-5 h-5 text-orange-600" />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">{request.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{request.property}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{request.requestedBy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(request.requestedAt), "MMM dd, yyyy")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={`${getPriorityColor(request.priority)} border`}>
                              {request.priority}
                            </Badge>
                            <Badge className={`${getStatusColor(request.status)} border`}>
                              {request.status}
                            </Badge>
                            {request.amount && (
                              <Badge variant="outline" className="font-mono">
                                ${request.amount.toLocaleString()}
                              </Badge>
                            )}
                          </div>

                          {request.documents && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div className="flex gap-2">
                                {request.documents.map((doc, index) => (
                                  <Button key={index} variant="outline" size="sm" className="h-6 text-xs">
                                    {doc}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprovalAction(request.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApprovalAction(request.id, 'reject')}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {propertyFinancials.map((property) => (
                  <Card key={property.propertyId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        {property.propertyName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Rent</p>
                          <p className="font-semibold">${property.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expenses</p>
                          <p className="font-semibold">${property.expenses.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Income</p>
                          <p className="font-semibold text-green-600">${property.netIncome.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-semibold">{property.roi}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Occupancy Rate</span>
                          <span>{property.occupancyRate}%</span>
                        </div>
                        <Progress value={property.occupancyRate} className="h-2" />
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Maintenance Costs</p>
                        <p className="text-sm font-medium">${property.maintenanceCosts.toLocaleString()}/month</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-6">
              <div className="text-center py-8">
                <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Property Management Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed property information and management tools
                </p>
                <Button>
                  View Property Details
                </Button>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Comprehensive Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Financial statements, tax reports, and performance analytics
                </p>
                <Button>
                  Generate Reports
                </Button>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive urgent alerts via SMS</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Alerts</Label>
                        <p className="text-xs text-muted-foreground">Urgent maintenance notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.maintenanceAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, maintenanceAlerts: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Financial Reports</Label>
                        <p className="text-xs text-muted-foreground">Monthly financial summaries</p>
                      </div>
                      <Switch
                        checked={notificationSettings.financialReports}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, financialReports: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerPortalSystem;