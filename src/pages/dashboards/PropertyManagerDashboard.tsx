import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Phone,
  MessageSquare,
  Eye,
  PlusCircle,
  ClipboardList,
  Home,
  Receipt,
  Bell,
  Activity,
  BarChart3,
  ArrowUpRight,
  UserCheck,
  FileText,
  Shield
} from "lucide-react";
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { useTenants } from "@/hooks/queries/useTenants";
import { useConversations } from "@/hooks/queries/useConversations";
import { useAllPropertyActivity } from "@/hooks/useAllPropertyActivity";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export function PropertyManagerDashboard() {
  // Fetch real data
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  const { data: tenants = [] } = useTenants();
  const { data: conversations = [] } = useConversations();
  const { activities: recentActivity = [] } = useAllPropertyActivity();

  // Calculate operational metrics
  const totalProperties = propertyMetrics?.totalProperties || 0;
  const totalTenants = tenants.length;
  const occupancyRate = propertyMetrics?.totalProperties ? Math.round((propertyMetrics.occupiedUnits / propertyMetrics.totalProperties) * 100) : 0;
  const monthlyRent = propertyMetrics?.totalRent || 0;
  
  // Operational alerts
  const urgentMaintenance = maintenanceRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;
  const inProgressMaintenance = maintenanceRequests.filter(r => r.status === 'in_progress').length;
  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  
  // Upcoming tasks
  const upcomingInspections = tenants.filter(tenant => {
    // Mock inspection dates - in real app, would come from inspection scheduling
    return Math.random() > 0.8; // Simulate some upcoming inspections
  }).slice(0, 3);

  // Recent tenant communications
  const recentCommunications = conversations.slice(0, 3).map(conv => ({
    id: conv.id,
    tenant: conv.title || 'Unknown',
    message: typeof conv.last_message === 'string' ? conv.last_message : 'No recent messages',
    time: conv.last_message_at ? format(new Date(conv.last_message_at), 'MMM dd, h:mm a') : 'No date',
    unread: conv.unread_count || 0
  }));

  // Today's tasks (derived from maintenance and activity)
  const todaysTasks = [
    ...maintenanceRequests.filter(r => r.status === 'pending').slice(0, 2).map(r => ({
      id: r.id,
      type: 'maintenance',
      description: r.title,
      property: r.property?.address || 'Unknown Property',
      priority: r.priority,
      time: 'Due today'
    })),
    ...upcomingInspections.map((tenant, index) => ({
      id: `inspection-${index}`,
      type: 'inspection',
      description: 'Property inspection',
      property: tenant.property?.address || 'Unknown Property',
      priority: 'medium',
      time: '2:00 PM'
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage daily operations and tenant relations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/maintenance">
            <Button variant="outline" size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </Button>
          </Link>
          <Link to="/tenants">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Tenants
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

      {/* Operational Metrics */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/properties">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties Managed</CardTitle>
                <Building className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {occupancyRate}% occupied
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/tenants">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <UserCheck className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTenants}</div>
                <p className="text-xs text-muted-foreground">
                  Tenant relations
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/maintenance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingMaintenance + inProgressMaintenance}</div>
                <p className="text-xs text-muted-foreground">
                  {urgentMaintenance} urgent
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/finances">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Collections</CardTitle>
                <Receipt className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${monthlyRent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Rent management
                </p>
              </CardContent>
            </Link>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      {/* Priority Alerts */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            Priority Alerts
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
                  Handle now →
                </Link>
              </div>
            )}
            
            {unreadMessages > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Tenant Messages</span>
                </div>
                <p className="text-2xl font-bold text-primary">{unreadMessages}</p>
                <Link to="/messages" className="text-sm text-primary hover:underline">
                  Respond →
                </Link>
              </div>
            )}

            {occupancyRate < 95 && (
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Vacancy Alert</span>
                </div>
                <p className="text-2xl font-bold text-warning">{100 - occupancyRate}%</p>
                <Link to="/properties" className="text-sm text-warning hover:underline">
                  Review units →
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Today's Tasks
              </div>
              <Badge variant="outline">{todaysTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysTasks.length > 0 ? (
                todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {task.type === 'maintenance' ? (
                        <Wrench className="h-4 w-4 text-warning" />
                      ) : (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{task.description}</p>
                        <p className="text-xs text-muted-foreground">{task.property}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{task.time}</p>
                      <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Communications
              </div>
              <Link to="/messages" className="text-sm text-primary hover:underline">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCommunications.length > 0 ? (
                recentCommunications.map((comm) => (
                  <Link 
                    key={comm.id} 
                    to="/messages" 
                    className="block transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{comm.tenant}</p>
                          {comm.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {comm.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{comm.message}</p>
                        <p className="text-xs text-muted-foreground">{comm.time}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent messages
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
            <Link to="/maintenance">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Schedule Maintenance</span>
              </Button>
            </Link>
            <Link to="/tenants">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Phone className="h-6 w-6" />
                <span className="text-sm">Contact Tenant</span>
              </Button>
            </Link>
            <Link to="/property-check">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="text-sm">Property Inspection</span>
              </Button>
            </Link>
            <Link to="/finances">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Receipt className="h-6 w-6" />
                <span className="text-sm">Process Payment</span>
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Collect Rent</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}