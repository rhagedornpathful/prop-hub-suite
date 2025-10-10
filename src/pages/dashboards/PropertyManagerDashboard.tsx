import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { QuickActionButton } from "@/components/dashboard/QuickActionButton";
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Wrench,
  Phone,
  MessageSquare,
  PlusCircle,
  ClipboardList,
  Home,
  Receipt,
  Bell,
  UserCheck,
  Shield
} from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { useTenants } from "@/hooks/queries/useTenants";
import { useConversations } from "@/hooks/queries/useConversations";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export function PropertyManagerDashboard() {
  const metrics = useDashboardMetrics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  const { data: tenants = [] } = useTenants();
  const { data: conversations = [] } = useConversations();
  
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
    time: formatDateTime(conv.last_message_at),
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
          <MetricCard
            title="Properties Managed"
            value={metrics.totalProperties}
            description={`${metrics.occupancyRate}% occupied`}
            icon={Building}
            link="/properties"
          />
        </AnimatedListItem>

        <AnimatedListItem>
          <MetricCard
            title="Active Tenants"
            value={metrics.totalTenants}
            description="Tenant relations"
            icon={UserCheck}
            iconColor="text-secondary"
            link="/tenants"
          />
        </AnimatedListItem>

        <AnimatedListItem>
          <MetricCard
            title="Active Maintenance"
            value={metrics.activeMaintenance}
            description={`${metrics.urgentMaintenance} urgent`}
            icon={Wrench}
            iconColor="text-warning"
            link="/maintenance"
          />
        </AnimatedListItem>

        <AnimatedListItem>
          <MetricCard
            title="Monthly Collections"
            value={formatCurrency(metrics.monthlyRent)}
            description="Rent management"
            icon={Receipt}
            iconColor="text-success"
            link="/finances"
          />
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
            {metrics.urgentMaintenance > 0 && (
              <AlertCard
                title="Urgent Maintenance"
                value={metrics.urgentMaintenance}
                icon={AlertTriangle}
                variant="destructive"
                link="/maintenance"
                linkText="Handle now →"
              />
            )}
            
            {metrics.unreadMessages > 0 && (
              <AlertCard
                title="Tenant Messages"
                value={metrics.unreadMessages}
                icon={MessageSquare}
                variant="primary"
                link="/messages"
                linkText="Respond →"
              />
            )}

            {metrics.occupancyRate < 95 && (
              <AlertCard
                title="Vacancy Alert"
                value={`${100 - metrics.occupancyRate}%`}
                icon={Home}
                variant="warning"
                link="/properties"
                linkText="Review units →"
              />
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
            <QuickActionButton label="Schedule Maintenance" icon={Wrench} link="/maintenance" />
            <QuickActionButton label="Contact Tenant" icon={Phone} link="/tenants" />
            <QuickActionButton label="Property Inspection" icon={Shield} link="/property-check" />
            <QuickActionButton label="Process Payment" icon={Receipt} link="/finances" />
            <QuickActionButton label="Collect Rent" icon={DollarSign} link="/payments" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}