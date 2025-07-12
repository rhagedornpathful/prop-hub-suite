import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Wrench,
  CheckCircle,
  Plus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PropertyOwnerDashboard() {
  const navigate = useNavigate();
  
  // Mock data - replace with actual queries based on current user
  const metrics = {
    totalProperties: 5,
    totalUnits: 8,
    occupiedUnits: 6,
    monthlyRevenue: 12800,
    occupancyRate: 75,
    pendingMaintenance: 2,
    upcomingExpirations: 1
  };

  const myProperties = [
    { 
      id: 1, 
      address: "123 Oak Street", 
      type: "Single Family", 
      rent: 2200, 
      tenant: "John Smith",
      status: "occupied",
      leaseExpires: "2024-12-15"
    },
    { 
      id: 2, 
      address: "456 Pine Avenue", 
      type: "Duplex", 
      rent: 3600, 
      tenant: "Both units occupied",
      status: "occupied",
      leaseExpires: "2024-11-30"
    },
    { 
      id: 3, 
      address: "789 Elm Street", 
      type: "Condo", 
      rent: 1800, 
      tenant: null,
      status: "vacant",
      leaseExpires: null
    }
  ];

  const recentPayments = [
    { tenant: "John Smith", property: "123 Oak Street", amount: 2200, date: "2024-07-01", status: "received" },
    { tenant: "Sarah Johnson", property: "456 Pine Avenue Unit A", amount: 1800, date: "2024-07-01", status: "received" },
    { tenant: "Mike Wilson", property: "456 Pine Avenue Unit B", amount: 1800, date: "2024-07-02", status: "received" }
  ];

  const maintenanceRequests = [
    { id: 1, property: "123 Oak Street", issue: "Leaky faucet in kitchen", priority: "medium", status: "pending", date: "2024-07-05" },
    { id: 2, property: "456 Pine Avenue", issue: "AC unit not cooling", priority: "high", status: "in-progress", date: "2024-07-03" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's an overview of your property portfolio</p>
        </div>
        <Button onClick={() => navigate('/properties')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Key Metrics */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProperties}</div>
              <p className="text-xs text-muted-foreground">{metrics.totalUnits} total units</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">{metrics.occupiedUnits} of {metrics.totalUnits} units</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingMaintenance}</div>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              My Properties
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/properties')}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{property.address}</p>
                    <p className="text-xs text-muted-foreground">{property.type}</p>
                    {property.tenant && (
                      <p className="text-xs text-muted-foreground">Tenant: {property.tenant}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${property.rent}/mo</p>
                    <Badge variant={property.status === 'occupied' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{payment.tenant}</p>
                    <p className="text-xs text-muted-foreground">{payment.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Requests
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/maintenance')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{request.issue}</p>
                    <p className="text-xs text-muted-foreground">{request.property}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={request.priority === 'high' ? 'destructive' : 'outline'}>
                      {request.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{request.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Lease Expirations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Lease Expirations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-warning/10">
                <div>
                  <p className="text-sm font-medium">456 Pine Avenue Unit A</p>
                  <p className="text-xs text-muted-foreground">Sarah Johnson</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">122 days</p>
                  <p className="text-xs text-muted-foreground">Nov 30, 2024</p>
                </div>
              </div>
              {metrics.upcomingExpirations === 1 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                  <p className="text-sm text-muted-foreground">All other leases are current</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}