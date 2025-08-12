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
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFinancialSummary, useRentRolls, useOwnerStatements } from "@/hooks/queries/useOwnerFinancials";
import { useMaintenanceRequests, useUpdateMaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { useInboxConversations } from "@/hooks/queries/useInbox";

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

  // Data: financial summary, maintenance approvals, messages
  const { data: summary } = useOwnerFinancialSummary();
  const { data: maintenance = [] } = useMaintenanceRequests();
  const updateMaintenance = useUpdateMaintenanceRequest();
  const { data: inboxConversations = [] } = useInboxConversations({ filter: 'inbox', searchQuery: '' });

  const propertyIds = (summary?.properties || []).map((p: any) => p.id);

  // Owner-visible check sessions
  const { data: propertyChecks = [] } = useQuery({
    queryKey: ['owner-property-checks', propertyIds.join(',')],
    queryFn: async () => {
      if (!propertyIds.length) return [] as any[];
      const { data, error } = await supabase
        .from('property_check_sessions')
        .select('*')
        .in('property_id', propertyIds)
        .order('completed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: propertyIds.length > 0,
  });

  const { data: homeChecks = [] } = useQuery({
    queryKey: ['owner-home-checks', propertyIds.join(',')],
    queryFn: async () => {
      if (!propertyIds.length) return [] as any[];
      const { data, error } = await supabase
        .from('home_check_sessions')
        .select('*')
        .in('property_id', propertyIds)
        .order('completed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: propertyIds.length > 0,
  });

  // Map approvals from maintenance requests
  const approvalRequests: ApprovalRequest[] = (maintenance || []).map((mr: any) => ({
    id: mr.id,
    type: 'maintenance',
    title: mr.title,
    description: mr.description || '',
    amount: mr.estimated_cost || undefined,
    requestedBy: mr.assigned_user ? `${mr.assigned_user.first_name || ''} ${mr.assigned_user.last_name || ''}`.trim() : 'Property Manager',
    requestedAt: mr.created_at,
    status: (mr.owner_approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
    priority: (mr.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
    property: mr.properties?.address || 'Property',
    documents: [],
  }));

  // Build property financials from summary
  const propertyFinancials: PropertyFinancials[] = (summary?.properties || []).map((p: any) => ({
    propertyId: p.id,
    propertyName: p.address,
    monthlyRent: p.monthly_rent || 0,
    expenses: 0,
    netIncome: p.monthly_rent || 0,
    occupancyRate: 100,
    maintenanceCosts: 0,
    roi: 0,
  }));

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    await updateMaintenance.mutateAsync({
      id: requestId,
      updates: {
        owner_approval_status: action === 'approve' ? 'approved' : 'rejected',
        owner_approval_notes: notes,
      } as any,
    });
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
  const avgROI = propertyFinancials.length ? propertyFinancials.reduce((sum, prop) => sum + prop.roi, 0) / propertyFinancials.length : 0;
  const avgOccupancy = propertyFinancials.length ? propertyFinancials.reduce((sum, prop) => sum + prop.occupancyRate, 0) / propertyFinancials.length : 0;

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
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="checks">Checks</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
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

            {/* Checks Tab */}
            <TabsContent value="checks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Property Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {propertyChecks.length === 0 && (
                        <p className="text-sm text-muted-foreground">No property checks available.</p>
                      )}
                      {propertyChecks.map((c: any) => {
                        const addr = (summary?.properties || []).find((p: any) => p.id === c.property_id)?.address || c.property_id;
                        return (
                          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{addr}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.completed_at ? `Completed ${format(new Date(c.completed_at), 'MMM dd, yyyy')}` : c.started_at ? `Started ${format(new Date(c.started_at), 'MMM dd, yyyy')}` : 'Scheduled'}
                              </p>
                            </div>
                            <Badge variant="outline">{c.status}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Recent Home Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {homeChecks.length === 0 && (
                        <p className="text-sm text-muted-foreground">No home checks available.</p>
                      )}
                      {homeChecks.map((c: any) => {
                        const addr = (summary?.properties || []).find((p: any) => p.id === c.property_id)?.address || c.property_id;
                        return (
                          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{addr}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.completed_at ? `Completed ${format(new Date(c.completed_at), 'MMM dd, yyyy')}` : c.started_at ? `Started ${format(new Date(c.started_at), 'MMM dd, yyyy')}` : 'Scheduled'}
                              </p>
                            </div>
                            <Badge variant="outline">{c.status}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messages from Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inboxConversations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No messages yet.</p>
                    )}
                    {inboxConversations.slice(0, 10).map((conv: any) => (
                      <div key={conv.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{conv.title || conv.last_message?.subject || 'Conversation'}</p>
                          <p className="text-xs text-muted-foreground truncate">{conv.last_message?.content || 'No messages'}</p>
                        </div>
                        {conv.unread_count > 0 && (
                          <Badge variant="destructive">{conv.unread_count} new</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link to="/client-portal/messages">Open Messages</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                <Button asChild aria-label="View property details">
                  <Link to="/client-portal/properties">View Property Details</Link>
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
                <Button asChild aria-label="Go to Reports">
                  <Link to="/client-portal/reports">Generate Reports</Link>
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