import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, Users, Building, Wrench, DollarSign, Activity, Clock } from 'lucide-react';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

export function AdminOverviewCards() {
  const quickStats: QuickStat[] = [
    {
      label: 'Active Properties',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Building
    },
    {
      label: 'Total Tenants',
      value: '2,891',
      change: '+8%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Monthly Revenue',
      value: '$425,000',
      change: '+15%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Open Requests',
      value: '47',
      change: '-23%',
      trend: 'down',
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
  const activities = [
    {
      id: 1,
      action: 'New property added',
      user: 'Sarah Johnson',
      time: '5 minutes ago',
      type: 'property'
    },
    {
      id: 2,
      action: 'Maintenance request completed',
      user: 'Mike Chen',
      time: '12 minutes ago',
      type: 'maintenance'
    },
    {
      id: 3,
      action: 'New tenant registered',
      user: 'Emma Davis',
      time: '25 minutes ago',
      type: 'user'
    },
    {
      id: 4,
      action: 'Payment processed',
      user: 'System',
      time: '1 hour ago',
      type: 'payment'
    }
  ];

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
        {activities.map((activity, index) => (
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
            {index < activities.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}