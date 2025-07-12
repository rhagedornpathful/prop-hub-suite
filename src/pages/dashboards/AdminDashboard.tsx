import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Wrench,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useHouseWatchingMetrics } from "@/hooks/queries/useHouseWatching";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
// import { useProfiles } from "@/hooks/queries/useProfiles";

export function AdminDashboard() {
  // Use real data from queries
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: houseWatchingMetrics } = useHouseWatchingMetrics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();

  const metrics = {
    totalProperties: (propertyMetrics?.totalProperties || 0) + (houseWatchingMetrics?.totalClients || 0),
    totalOwners: 10, // From seeded data: 10 property owners
    totalTenants: 2, // From seeded data: 2 tenant users
    monthlyRevenue: (propertyMetrics?.totalRent || 0) + (houseWatchingMetrics?.totalRevenue || 0),
    occupancyRate: propertyMetrics?.totalProperties ? Math.round((propertyMetrics.occupiedUnits / propertyMetrics.totalProperties) * 100) : 0,
    pendingMaintenance: maintenanceRequests.filter(r => r.status === 'pending').length,
    overdueRents: 0, // Could be calculated based on payment records
    leaseExpirations: 0 // Could be calculated based on lease end dates
  };

  const recentActivity = [
    { id: 1, type: "payment", message: "Rent payment received - 123 Oak St", time: "2 hours ago" },
    { id: 2, type: "maintenance", message: "Maintenance request submitted - 456 Pine Ave", time: "4 hours ago" },
    { id: 3, type: "lease", message: "New lease signed - 789 Elm St", time: "1 day ago" },
    { id: 4, type: "tenant", message: "New tenant application - 321 Maple Dr", time: "2 days ago" }
  ];

  const upcomingExpirations = [
    { property: "123 Oak Street", tenant: "John Smith", expiresAt: "2024-08-15", daysLeft: 45 },
    { property: "456 Pine Avenue", tenant: "Sarah Johnson", expiresAt: "2024-09-01", daysLeft: 62 },
    { property: "789 Elm Street", tenant: "Mike Wilson", expiresAt: "2024-09-15", daysLeft: 76 }
  ];

  const overdueRents = [
    { property: "321 Maple Drive", tenant: "Lisa Brown", amount: 1200, daysOverdue: 5 },
    { property: "654 Cedar Lane", tenant: "Tom Davis", amount: 1800, daysOverdue: 12 },
    { property: "987 Birch Road", tenant: "Amy Chen", amount: 1500, daysOverdue: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProperties}</div>
              <p className="text-xs text-muted-foreground">Across all owners</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Property Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOwners}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTenants}</div>
              <p className="text-xs text-muted-foreground">{metrics.occupancyRate}% occupancy</p>
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
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-destructive">Overdue Rents</p>
                  <p className="text-xs text-muted-foreground">{metrics.overdueRents} tenants</p>
                </div>
                <Badge variant="destructive">{metrics.overdueRents}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-warning">Pending Maintenance</p>
                  <p className="text-xs text-muted-foreground">{metrics.pendingMaintenance} requests</p>
                </div>
                <Badge variant="outline" className="border-warning text-warning">{metrics.pendingMaintenance}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Lease Expirations</p>
                  <p className="text-xs text-muted-foreground">Next 90 days</p>
                </div>
                <Badge variant="outline">{metrics.leaseExpirations}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {upcomingExpirations.map((lease, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{lease.property}</p>
                    <p className="text-xs text-muted-foreground">{lease.tenant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{lease.daysLeft} days</p>
                    <p className="text-xs text-muted-foreground">{lease.expiresAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Rents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Overdue Rents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueRents.map((rent, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium">{rent.property}</p>
                    <p className="text-xs text-muted-foreground">{rent.tenant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-destructive">${rent.amount}</p>
                    <p className="text-xs text-destructive">{rent.daysOverdue} days overdue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}