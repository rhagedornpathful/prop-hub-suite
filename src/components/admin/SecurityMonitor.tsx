import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/enhanced-icon';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  AlertTriangle, 
  Key, 
  Users, 
  Download 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityMetric {
  id: string;
  name: string;
  status: 'secure' | 'warning' | 'critical';
  value: string;
  description: string;
  lastChecked: string;
}

interface SecurityAlert {
  id: string;
  type: 'login_failure' | 'unusual_activity' | 'permission_change' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SecurityMonitor: React.FC = () => {
  const { data: securityMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetric[]> => {
      // Simulate security metrics - in production, this would come from your security monitoring service
      return [
        {
          id: '1',
          name: 'Active Sessions',
          status: 'secure',
          value: '12',
          description: 'Current active user sessions',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Failed Login Attempts',
          status: 'warning',
          value: '3',
          description: 'Failed login attempts in last hour',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Permission Changes',
          status: 'secure',
          value: '1',
          description: 'Role/permission changes today',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Data Export Activity',
          status: 'secure',
          value: '0',
          description: 'Large data exports in last 24h',
          lastChecked: new Date().toISOString(),
        },
      ];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async (): Promise<SecurityAlert[]> => {
      // Simulate security alerts - in production, this would come from your security monitoring service
      return [
        {
          id: '1',
          type: 'login_failure',
          severity: 'medium',
          message: 'Multiple failed login attempts from IP 192.168.1.100',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          resolved: false,
        },
        {
          id: '2',
          type: 'permission_change',
          severity: 'high',
          message: 'Admin role assigned to user john.doe@example.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          resolved: true,
        },
      ];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return 'shield-check';
      case 'warning':
        return 'shield-alert';
      case 'critical':
        return 'shield-x';
      default:
        return 'shield';
    }
  };

  const getSeverityVariant = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'high':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    // In production, this would call an API to resolve the alert
    console.log('Resolving alert:', alertId);
  };

  if (metricsLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityMetrics?.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <Icon
                    icon={getStatusIcon(metric.status) === 'shield-check' ? ShieldCheck : 
                          getStatusIcon(metric.status) === 'shield-alert' ? ShieldAlert :
                          getStatusIcon(metric.status) === 'shield-x' ? ShieldX : Shield}
                    size="lg"
                    className={getStatusColor(metric.status)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(metric.lastChecked).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon={AlertTriangle} size="sm" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!securityAlerts?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon icon={ShieldCheck} size="xl" className="mx-auto mb-2" />
              <p>No active security alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                  <AlertDescription className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Icon icon={Key} size="sm" className="mr-2" />
              Manage API Keys
            </Button>
            <Button variant="outline" className="justify-start">
              <Icon icon={Users} size="sm" className="mr-2" />
              Review User Permissions
            </Button>
            <Button variant="outline" className="justify-start">
              <Icon icon={Download} size="sm" className="mr-2" />
              Export Security Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};