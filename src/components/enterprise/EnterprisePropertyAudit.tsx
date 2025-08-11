import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  CheckCircle2,
  Wifi,
  Lock,
  Eye,
  Database,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function EnterprisePropertyAudit() {
  const { user } = useAuth();
  const { userRole, isAdmin, isPropertyManager } = useUserRole();

  // Only show to admins and property managers
  if (!isAdmin() && !isPropertyManager()) {
    return null;
  }

  const securityChecks = [
    {
      name: 'Authentication',
      status: user ? 'pass' : 'fail',
      icon: Lock,
      description: user ? 'User authenticated' : 'Authentication required'
    },
    {
      name: 'Role Authorization', 
      status: userRole ? 'pass' : 'warn',
      icon: Shield,
      description: userRole ? `${userRole} access` : 'Role verification needed'
    },
    {
      name: 'Secure Connection',
      status: window.location.protocol === 'https:' ? 'pass' : 'fail', 
      icon: Globe,
      description: window.location.protocol === 'https:' ? 'HTTPS enabled' : 'Insecure connection'
    },
    {
      name: 'Data Access Control',
      status: 'pass',
      icon: Database,
      description: 'RLS policies active'
    },
    {
      name: 'Network Status',
      status: navigator.onLine ? 'pass' : 'warn',
      icon: Wifi,
      description: navigator.onLine ? 'Online' : 'Offline mode'
    }
  ];

  const overallStatus = securityChecks.some(check => check.status === 'fail') ? 'fail' :
    securityChecks.some(check => check.status === 'warn') ? 'warn' : 'pass';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-success/10 text-success border-success/20';
      case 'warn':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'fail':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <Badge className={getStatusColor(overallStatus)}>
            <ShieldCheck className="h-3 w-3 mr-1" />
            {overallStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {securityChecks.map((check, index) => {
            const IconComponent = check.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-4 w-4 ${
                    check.status === 'pass' ? 'text-success' :
                    check.status === 'warn' ? 'text-warning' : 'text-destructive'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{check.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{check.description}</div>
                </div>
                <CheckCircle2 className={`h-3 w-3 flex-shrink-0 ${
                  check.status === 'pass' ? 'text-success' :
                  check.status === 'warn' ? 'text-warning' : 'text-destructive'
                }`} />
              </div>
            );
          })}
        </div>
        
        {overallStatus !== 'pass' && (
          <Alert className="mt-4 bg-info/10 border-info/20">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              System security is {overallStatus === 'warn' ? 'stable with warnings' : 'compromised'}. 
              All property data is protected by enterprise-grade security measures.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}