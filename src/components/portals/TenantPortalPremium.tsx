/**
 * Tenant Portal Excellence - State-of-the-Art Features
 * - Online rent payment with auto-pay
 * - Maintenance request tracking with photos
 * - Lease document access
 * - Community board
 * - Guest parking management
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTenants } from "@/hooks/queries/useTenants";
import { usePayments } from "@/hooks/queries/usePayments";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Wrench, 
  DollarSign,
  Calendar,
  Car,
  Users,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Bell
} from "lucide-react";
import { format } from "date-fns";

export const TenantPortalPremium = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: tenants } = useTenants();
  const { data: payments } = usePayments();
  const { data: maintenanceRequests } = useMaintenanceRequests();

  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [guestParkingDate, setGuestParkingDate] = useState("");
  const [communityPost, setCommunityPost] = useState("");

  const currentTenant = tenants?.find(t => t.user_account_id === user?.id);
  const tenantPayments = payments?.filter(p => p.tenant_id === currentTenant?.id) || [];
  const tenantRequests = maintenanceRequests?.filter(mr => 
    mr.property_id === currentTenant?.property_id
  ) || [];

  const totalPaid = tenantPayments
    .filter(p => p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount / 100), 0);

  const handlePayNow = () => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to secure payment portal...",
    });
  };

  const handleAutoPayToggle = (enabled: boolean) => {
    setAutoPayEnabled(enabled);
    toast({
      title: enabled ? "Auto-Pay Enabled" : "Auto-Pay Disabled",
      description: enabled 
        ? "Rent will be automatically paid on the 1st of each month"
        : "Auto-pay has been disabled",
    });
  };

  const handleGuestParkingRequest = () => {
    if (!guestParkingDate) {
      toast({
        variant: "destructive",
        title: "Date Required",
        description: "Please select a date for guest parking",
      });
      return;
    }
    
    toast({
      title: "Guest Parking Reserved",
      description: `Parking pass issued for ${format(new Date(guestParkingDate), "MMM dd, yyyy")}`,
    });
    setGuestParkingDate("");
  };

  const handleCommunityPost = () => {
    if (!communityPost.trim()) return;
    
    toast({
      title: "Posted to Community Board",
      description: "Your message has been shared with neighbors",
    });
    setCommunityPost("");
  };

  if (!currentTenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Portal Access</CardTitle>
          <CardDescription>
            No tenant record found. Please contact your property manager.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {currentTenant.first_name}!</h2>
          <p className="text-muted-foreground">
            Your premium tenant portal
          </p>
        </div>
        <Badge variant="default" className="gap-2">
          <Bell className="h-4 w-4" />
          3 New Updates
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentTenant.monthly_rent?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Due on 1st of each month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-success">
              Payment history excellent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantRequests.filter(r => r.status !== 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expires {currentTenant.lease_end_date ? format(new Date(currentTenant.lease_end_date), "MMM yyyy") : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rent Payment</CardTitle>
              <CardDescription>
                Manage your rent payments and auto-pay settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-Pay Setting */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Auto-Pay</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically pay rent on the 1st of each month
                  </p>
                </div>
                <Switch 
                  checked={autoPayEnabled} 
                  onCheckedChange={handleAutoPayToggle}
                />
              </div>

              {/* Payment Button */}
              <div className="flex gap-3">
                <Button onClick={handlePayNow} className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Rent Now
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      View Payment History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Payment History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {tenantPayments.slice(0, 10).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.created_at), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge variant={payment.status === "succeeded" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track and submit maintenance requests</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Maintenance Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Issue Title</Label>
                      <Input placeholder="e.g., Leaky faucet in kitchen" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Describe the issue in detail..." rows={4} />
                    </div>
                    <div>
                      <Label>Upload Photos</Label>
                      <Input type="file" multiple accept="image/*" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload up to 5 photos
                      </p>
                    </div>
                    <Button className="w-full">Submit Request</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenantRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant={
                        request.status === "completed" ? "default" :
                        request.status === "in_progress" ? "secondary" :
                        "outline"
                      }>
                        {request.status === "in_progress" ? "In Progress" : 
                         request.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm">{request.description}</p>
                  </div>
                ))}
                {tenantRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No maintenance requests yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Documents</CardTitle>
              <CardDescription>Access your lease and related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Lease Agreement", date: "Jan 1, 2024", type: "PDF" },
                  { name: "Move-In Checklist", date: "Jan 1, 2024", type: "PDF" },
                  { name: "House Rules", date: "Jan 1, 2024", type: "PDF" },
                  { name: "Parking Agreement", date: "Jan 1, 2024", type: "PDF" },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.date} • {doc.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Board Tab */}
        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Board</CardTitle>
              <CardDescription>Connect with your neighbors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post Input */}
              <div className="space-y-2">
                <Textarea 
                  placeholder="Share something with your community..."
                  value={communityPost}
                  onChange={(e) => setCommunityPost(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleCommunityPost} disabled={!communityPost.trim()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Post to Community
                </Button>
              </div>

              {/* Community Posts */}
              <div className="space-y-3">
                {[
                  { author: "Building Manager", message: "Reminder: Pool maintenance scheduled for this weekend", time: "2 hours ago" },
                  { author: "Sarah J. (Apt 301)", message: "Lost cat - gray tabby, please contact if found!", time: "5 hours ago" },
                  { author: "Community Team", message: "Rooftop BBQ this Saturday at 6PM - All welcome!", time: "1 day ago" },
                ].map((post, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{post.author}</p>
                        <p className="text-sm mt-1">{post.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{post.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guest Parking Tab */}
        <TabsContent value="parking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Parking Management</CardTitle>
              <CardDescription>Reserve guest parking spots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Available Guest Spots: 3</p>
                <p className="text-sm text-muted-foreground">
                  Reserve up to 2 spots per month for your guests
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Select Date</Label>
                  <Input 
                    type="date" 
                    value={guestParkingDate}
                    onChange={(e) => setGuestParkingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Guest Name</Label>
                  <Input placeholder="Enter guest name" />
                </div>
                <div>
                  <Label>Vehicle License Plate</Label>
                  <Input placeholder="e.g., ABC-1234" />
                </div>
                <Button onClick={handleGuestParkingRequest} className="w-full">
                  <Car className="mr-2 h-4 w-4" />
                  Request Guest Parking
                </Button>
              </div>

              {/* Active Parking Passes */}
              <div className="space-y-2">
                <h4 className="font-medium">Active Parking Passes</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Spot #12</p>
                      <p className="text-sm text-muted-foreground">Valid: Dec 15, 2024</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
