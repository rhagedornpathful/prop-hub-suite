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
      // Get real security metrics from audit logs and user sessions
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (auditError) throw auditError;

      // Count failed login attempts in last hour
      const failedLogins = auditLogs?.filter(log => 
        log.action === 'login_failed' && 
        new Date(log.created_at) > new Date(Date.now() - 60 * 60 * 1000)
      ).length || 0;

      // Count permission changes today
      const permissionChanges = auditLogs?.filter(log => 
        log.action === 'role_updated' && 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      return [
        {
          id: '1',
          name: 'Active Sessions',
          status: 'secure',
          value: 'N/A',
          description: 'Current active user sessions (requires auth integration)',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Failed Login Attempts',
          status: failedLogins > 5 ? 'critical' : failedLogins > 0 ? 'warning' : 'secure',
          value: failedLogins.toString(),
          description: 'Failed login attempts in last hour',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Permission Changes',
          status: permissionChanges > 10 ? 'warning' : 'secure',
          value: permissionChanges.toString(),
          description: 'Role/permission changes today',
          lastChecked: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Data Export Activity',
          status: 'secure',
          value: '0',
          description: 'Large data exports in last 24h (requires implementation)',
          lastChecked: new Date().toISOString(),
        },
      ];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async (): Promise<SecurityAlert[]> => {
      // Get real security alerts from audit logs
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const alerts: SecurityAlert[] = [];
      
      // Group failed logins by IP
      const failedLogins = auditLogs?.filter(log => log.action === 'login_failed') || [];
      const loginsByIP = failedLogins.reduce((acc, log) => {
        const ip = (log.ip_address as string) || 'unknown';
        acc[ip] = (acc[ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Create alerts for IPs with multiple failures
      Object.entries(loginsByIP).forEach(([ip, count]) => {
        if (count >= 3) {
          alerts.push({
            id: `login-${ip}`,
            type: 'login_failure',
            severity: count >= 10 ? 'critical' : count >= 5 ? 'high' : 'medium',
            message: `${count} failed login attempts from IP ${ip}`,
            timestamp: new Date().toISOString(),
            resolved: false,
          });
        }
      });

      // Add permission change alerts
      const roleChanges = auditLogs?.filter(log => log.action === 'role_updated') || [];
      roleChanges.forEach(log => {
        const oldRole = typeof log.old_values === 'object' && log.old_values ? (log.old_values as any).role : 'unknown';
        const newRole = typeof log.new_values === 'object' && log.new_values ? (log.new_values as any).role : 'unknown';
        alerts.push({
          id: `role-${log.id}`,
          type: 'permission_change',
          severity: 'high',
          message: `Role change: ${oldRole} → ${newRole}`,
          timestamp: log.created_at,
          resolved: false,
        });
      });

      return alerts.slice(0, 5); // Return latest 5 alerts
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
    try {
      // Mark alert as resolved in audit logs or create resolution record
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action: 'security_alert_resolved',
          table_name: 'security_monitor',
          record_id: alertId,
          user_id: null,
          old_values: { alert_id: alertId },
          new_values: { resolved: true, resolved_at: new Date().toISOString() }
        });

      if (error) throw error;
      
      // Refresh the alerts
      window.location.reload();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
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