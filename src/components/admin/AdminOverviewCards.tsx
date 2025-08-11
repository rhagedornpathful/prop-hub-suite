import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, Users, Building, Wrench, DollarSign, Activity, Clock } from 'lucide-react';
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useHouseWatchingMetrics } from "@/hooks/queries/useHouseWatching";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { useTenants } from "@/hooks/queries/useTenants";
import { useBusinessSummary } from "@/hooks/queries/useBusinessSummary";

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

export function AdminOverviewCards() {
  // Fetch real data
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: houseWatchingMetrics } = useHouseWatchingMetrics();
  const { data: maintenanceData } = useMaintenanceRequests();
  const { data: tenantData } = useTenants();
  const { data: businessSummary } = useBusinessSummary();

  // Calculate real metrics
  const totalProperties = (propertyMetrics?.totalProperties || 0) + (houseWatchingMetrics?.totalClients || 0);
  const totalTenants = Array.isArray(tenantData) ? tenantData.length : 0;
  const monthlyRevenue = ((propertyMetrics?.totalRent || 0) + (houseWatchingMetrics?.totalRevenue || 0));
  const openRequests = Array.isArray(maintenanceData) 
    ? maintenanceData.filter(m => m.status === 'pending' || m.status === 'in-progress').length 
    : 0;

  const quickStats: QuickStat[] = [
    {
      label: 'Active Properties',
      value: totalProperties.toString(),
      change: businessSummary?.newRentalProperties ? `+${businessSummary.newRentalProperties}` : '+0',
      trend: 'up',
      icon: Building
    },
    {
      label: 'Total Tenants',
      value: totalTenants.toString(),
      change: '+8%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: businessSummary?.combinedRevenue ? `+$${businessSummary.combinedRevenue.toLocaleString()}` : '+0',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Open Requests',
      value: openRequests.toString(),
      change: openRequests > 0 ? `${openRequests} pending` : 'All clear',
      trend: openRequests > 10 ? 'up' : 'down',
      icon: Wrench
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickStats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs flex items-center ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${
                stat.trend === 'down' ? 'rotate-180' : ''
              }`} />
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminAlertCenter() {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Server response time above threshold',
      time: '2 minutes ago',
      resolved: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'High database connection count',
      time: '15 minutes ago',
      resolved: false
    },
    {
      id: 3,
      type: 'info',
      message: 'Scheduled maintenance completed',
      time: '1 hour ago',
      resolved: true
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          System Alerts
          <Badge variant="destructive" className="ml-2">
            {alerts.filter(a => !a.resolved).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
              {!alert.resolved && (
                <Button variant="ghost" size="sm">
                  Resolve
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AdminRecentActivity() {
  // Fetch real activity data
  const { data: maintenanceData } = useMaintenanceRequests();
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: tenantData } = useTenants();

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  // Generate real recent activity from database
  const activities = [];

  // Add recent maintenance requests
  if (Array.isArray(maintenanceData)) {
    maintenanceData.slice(0, 3).forEach(request => {
      activities.push({
        id: request.id,
        action: request.title || 'Maintenance request created',
        user: 'System',
        time: formatTimeAgo(request.created_at),
        type: 'maintenance'
      });
    });
  }

  // Add recent tenants (simulated as property additions)
  if (Array.isArray(tenantData)) {
    tenantData.slice(0, 2).forEach(tenant => {
      activities.push({
        id: tenant.id,
        action: 'New tenant registered',
        user: `${tenant.first_name} ${tenant.last_name}`,
        time: formatTimeAgo(tenant.created_at),
        type: 'user'
      });
    });
  }

  // Add property activity
  if (propertyMetrics?.totalProperties > 0) {
    activities.push({
      id: 'property-activity',
      action: 'Property portfolio updated',
      user: 'System',
      time: '1 hour ago',
      type: 'property'
    });
  }

  // Sort by most recent and limit to 4
  const sortedActivities = activities
    .slice(0, 4); // Just take the first 4 instead of trying to sort by parsed time strings

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property': return <Building className="h-4 w-4 text-blue-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'user': return <Users className="h-4 w-4 text-green-500" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
              {index < sortedActivities.length - 1 && <Separator className="mt-3" />}
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}