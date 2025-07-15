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
  FileText,
  MessageSquare,
  Eye,
  PlusCircle,
  Settings,
  Home,
  CreditCard,
  Bell,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useHouseWatchingMetrics } from "@/hooks/queries/useHouseWatching";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { usePropertyOwners } from "@/hooks/queries/usePropertyOwners";
import { useTenants } from "@/hooks/queries/useTenants";
import { useConversations } from "@/hooks/queries/useConversations";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { useAllPropertyActivity } from "@/hooks/useAllPropertyActivity";
import { Link } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";

export function AdminDashboard() {
  // Fetch real data from all sources
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: houseWatchingMetrics } = useHouseWatchingMetrics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  const { data: propertyOwners = [] } = usePropertyOwners();
  const { data: tenants = [] } = useTenants();
  const { data: conversations = [] } = useConversations();
  const { activities: recentActivity = [] } = useAllPropertyActivity();

  // Calculate real metrics
  const totalProperties = (propertyMetrics?.totalProperties || 0) + (houseWatchingMetrics?.totalClients || 0);
  const totalOwners = propertyOwners.length;
  const totalTenants = tenants.length;
  const monthlyRevenue = (propertyMetrics?.totalRent || 0) + (houseWatchingMetrics?.totalRevenue || 0);
  const occupancyRate = propertyMetrics?.totalProperties ? Math.round((propertyMetrics.occupiedUnits / propertyMetrics.totalProperties) * 100) : 0;
  
  // Critical alerts
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;
  const urgentMaintenance = maintenanceRequests.filter(r => r.priority === 'urgent').length;
  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  
  // Upcoming lease expirations (calculate from tenant data)
  const upcomingExpirations = tenants.filter(tenant => {
    if (!tenant.lease_end_date) return false;
    const endDate = new Date(tenant.lease_end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 90;
  }).map(tenant => {
    const endDate = new Date(tenant.lease_end_date!);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      property: tenant.property?.address || 'Unknown Address',
      tenant: `${tenant.first_name} ${tenant.last_name}`,
      expiresAt: format(endDate, 'MMM dd, yyyy'),
      daysLeft
    };
  });

  // Recent activity from real data
  const recentActivities = recentActivity.slice(0, 5).map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.description || activity.title,
    time: format(new Date(activity.date), 'MMM dd, h:mm a'),
    property: activity.metadata?.property_address || 'Unknown Property'
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your property portfolio and operations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/properties">
            <Button variant="outline" size="sm">
              <Building className="h-4 w-4 mr-2" />
              Properties
            </Button>
          </Link>
          <Link to="/maintenance">
            <Button variant="outline" size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/properties">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProperties}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-success" />
                  {propertyMetrics?.totalProperties || 0} rental + {houseWatchingMetrics?.totalClients || 0} watching
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/property-owners">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Property Owners</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOwners}</div>
                <p className="text-xs text-muted-foreground">Active accounts</p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/tenants">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Home className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTenants}</div>
                <p className="text-xs text-muted-foreground">{occupancyRate}% occupancy rate</p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/finances">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  Combined services
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      {/* Critical Alerts */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentMaintenance > 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Urgent Maintenance</span>
                </div>
                <p className="text-2xl font-bold text-destructive">{urgentMaintenance}</p>
                <Link to="/maintenance" className="text-sm text-destructive hover:underline">
                  View requests →
                </Link>
              </div>
            )}
            
            {pendingMaintenance > 0 && (
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Pending Maintenance</span>
                </div>
                <p className="text-2xl font-bold text-warning">{pendingMaintenance}</p>
                <Link to="/maintenance" className="text-sm text-warning hover:underline">
                  Manage requests →
                </Link>
              </div>
            )}

            {unreadMessages > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Unread Messages</span>
                </div>
                <p className="text-2xl font-bold text-primary">{unreadMessages}</p>
                <Link to="/messages" className="text-sm text-primary hover:underline">
                  View messages →
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </div>
              <Link to="/activity" className="text-sm text-primary hover:underline">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    to="/activity" 
                    className="block transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.property}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Lease Expirations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Lease Expirations
              </div>
              <Link to="/tenants" className="text-sm text-primary hover:underline">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExpirations.length > 0 ? (
                upcomingExpirations.slice(0, 3).map((lease, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming expirations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/properties">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Building className="h-6 w-6" />
                <span className="text-sm">Add Property</span>
              </Button>
            </Link>
            <Link to="/tenants">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Tenant</span>
              </Button>
            </Link>
            <Link to="/maintenance">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Schedule Maintenance</span>
              </Button>
            </Link>
            <Link to="/finances">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Record Payment</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}