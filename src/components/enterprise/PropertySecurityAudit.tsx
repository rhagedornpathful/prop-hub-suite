import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  level: 'low' | 'medium' | 'high' | 'critical';
}

interface PropertySecurityAuditProps {
  propertyId?: string;
  onSecurityIssue?: (issue: SecurityCheck) => void;
}

export function PropertySecurityAudit({ propertyId, onSecurityIssue }: PropertySecurityAuditProps) {
  const { user } = useAuth();
  const { userRole, isAdmin, isPropertyManager } = useUserRole();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);

  // Security checks configuration
  const runSecurityAudit = async () => {
    setIsRunning(true);
    const checks: SecurityCheck[] = [];

    try {
      // Authentication check
      checks.push({
        id: 'auth',
        name: 'User Authentication',
        status: user ? 'pass' : 'fail',
        message: user ? 'User is properly authenticated' : 'User authentication failed',
        level: user ? 'low' : 'critical'
      });

      // Role-based access check
      checks.push({
        id: 'rbac',
        name: 'Role-Based Access Control',
        status: userRole ? 'pass' : 'warn',
        message: userRole ? `User has ${userRole} role` : 'User role not properly configured',
        level: userRole ? 'low' : 'high'
      });

      // Property access authorization
      if (propertyId) {
        // Check if user has access to this specific property
        const hasPropertyAccess = isAdmin() || isPropertyManager() || 
          await checkPropertyAccess(propertyId);
        
        checks.push({
          id: 'property_access',
          name: 'Property Access Authorization',
          status: hasPropertyAccess ? 'pass' : 'fail',
          message: hasPropertyAccess ? 'User authorized for property access' : 'Unauthorized property access attempt',
          level: hasPropertyAccess ? 'low' : 'critical'
        });
      }

      // Data encryption check
      checks.push({
        id: 'encryption',
        name: 'Data Transmission Security',
        status: window.location.protocol === 'https:' ? 'pass' : 'fail',
        message: window.location.protocol === 'https:' ? 'Secure HTTPS connection' : 'Insecure HTTP connection detected',
        level: window.location.protocol === 'https:' ? 'low' : 'critical'
      });

      // Session security
      const sessionAge = user?.last_sign_in_at ? 
        Date.now() - new Date(user.last_sign_in_at).getTime() : 0;
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      
      checks.push({
        id: 'session',
        name: 'Session Security',
        status: sessionAge < maxSessionAge ? 'pass' : 'warn',
        message: sessionAge < maxSessionAge ? 'Session is valid' : 'Session is getting old, consider re-authentication',
        level: sessionAge < maxSessionAge ? 'low' : 'medium'
      });

      // Sensitive data exposure check
      const hasSensitiveDataInUrl = window.location.href.includes('password') || 
        window.location.href.includes('token') || 
        window.location.href.includes('key');
        
      checks.push({
        id: 'data_exposure',
        name: 'Sensitive Data Exposure',
        status: hasSensitiveDataInUrl ? 'fail' : 'pass',
        message: hasSensitiveDataInUrl ? 'Sensitive data detected in URL' : 'No sensitive data in URL',
        level: hasSensitiveDataInUrl ? 'high' : 'low'
      });

      setSecurityChecks(checks);
      setLastAudit(new Date());

      // Notify about critical issues
      const criticalIssues = checks.filter(check => 
        check.status === 'fail' && check.level === 'critical'
      );
      
      criticalIssues.forEach(issue => {
        onSecurityIssue?.(issue);
      });

    } catch (error) {
      console.error('Security audit failed:', error);
      checks.push({
        id: 'audit_error',
        name: 'Security Audit',
        status: 'fail',
        message: 'Security audit could not be completed',
        level: 'high'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Check if user has access to specific property
  const checkPropertyAccess = async (propertyId: string): Promise<boolean> => {
    try {
      // This would typically check against your property access rules
      // For now, we'll use a simple role-based check
      return isAdmin() || isPropertyManager();
    } catch (error) {
      console.error('Property access check failed:', error);
      return false;
    }
  };

  // Run audit on component mount and property change
  useEffect(() => {
    runSecurityAudit();
  }, [propertyId, user, userRole]);

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'fail':
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-success/10 text-success border-success/20';
      case 'warn':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'fail':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getLevelColor = (level: SecurityCheck['level']) => {
    switch (level) {
      case 'low':
        return 'bg-muted text-muted-foreground';
      case 'medium':
        return 'bg-info/10 text-info border-info/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const overallStatus = securityChecks.some(check => check.status === 'fail') ? 'fail' :
    securityChecks.some(check => check.status === 'warn') ? 'warn' : 'pass';

  // Only show to admins and property managers
  if (!isAdmin() && !isPropertyManager()) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus === 'pass' && <ShieldCheck className="h-3 w-3 mr-1" />}
              {overallStatus === 'warn' && <ShieldAlert className="h-3 w-3 mr-1" />}
              {overallStatus === 'fail' && <ShieldAlert className="h-3 w-3 mr-1" />}
              {overallStatus.toUpperCase()}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={runSecurityAudit}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Audit'}
            </Button>
          </div>
        </div>
        {lastAudit && (
          <p className="text-sm text-muted-foreground">
            Last audit: {lastAudit.toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {securityChecks.map((check) => (
          <div key={check.id} className="flex items-start gap-3 p-3 rounded-lg border">
            {getStatusIcon(check.status)}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{check.name}</span>
                <Badge variant="outline" className={getLevelColor(check.level)}>
                  {check.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{check.message}</p>
            </div>
          </div>
        ))}

        {securityChecks.some(check => check.status === 'fail') && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Security issues detected. Please address critical and high-level issues immediately.
              Contact your system administrator if you need assistance.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}