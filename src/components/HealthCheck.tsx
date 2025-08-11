import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, Database, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/lib/config';

interface HealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  lastChecked: Date;
}

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  const checkDatabaseHealth = async (): Promise<HealthStatus> => {
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - start;
      
      if (error) {
        return {
          name: 'Database',
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
          responseTime,
          lastChecked: new Date(),
        };
      }

      return {
        name: 'Database',
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        message: responseTime > 1000 ? 'Slow response time' : 'Connection successful',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Database',
        status: 'unhealthy',
        message: `Connection failed: ${error}`,
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    }
  };

  const checkAuthHealth = async (): Promise<HealthStatus> => {
    const start = Date.now();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const responseTime = Date.now() - start;

      return {
        name: 'Authentication',
        status: 'healthy',
        message: session ? 'User authenticated' : 'Authentication service ready',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Authentication',
        status: 'unhealthy',
        message: `Auth service error: ${error}`,
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    }
  };

  const checkNetworkHealth = async (): Promise<HealthStatus> => {
    const start = Date.now();
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const responseTime = Date.now() - start;

      return {
        name: 'Network',
        status: navigator.onLine ? 'healthy' : 'unhealthy',
        message: navigator.onLine ? 'Internet connection active' : 'No internet connection',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Network',
        status: 'unhealthy',
        message: 'Network connectivity issues',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    }
  };

  const checkPerformanceHealth = (): HealthStatus => {
    const start = performance.now();
    
    // Simulate some work
    const testArray = Array.from({ length: 10000 }, (_, i) => i);
    testArray.sort((a, b) => b - a);
    
    const responseTime = performance.now() - start;
    
    return {
      name: 'Performance',
      status: responseTime > 50 ? 'degraded' : 'healthy',
      message: responseTime > 50 ? 'Performance degraded' : 'System performing well',
      responseTime,
      lastChecked: new Date(),
    };
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      const checks = await Promise.all([
        checkDatabaseHealth(),
        checkAuthHealth(),
        checkNetworkHealth(),
        Promise.resolve(checkPerformanceHealth()),
      ]);
      
      setHealthStatus(checks);
      setLastFullCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
    
    // Run health checks every 5 minutes
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Database':
        return <Database className="h-4 w-4" />;
      case 'Authentication':
        return <Shield className="h-4 w-4" />;
      case 'Network':
        return <Wifi className="h-4 w-4" />;
      case 'Performance':
        return <Zap className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const overallStatus = healthStatus.length > 0 
    ? healthStatus.some(s => s.status === 'unhealthy') ? 'unhealthy'
      : healthStatus.some(s => s.status === 'degraded') ? 'degraded'
      : 'healthy'
    : 'unhealthy';

  if (!config.features.debugMode) {
    return null; // Only show in development
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              System Health
            </CardTitle>
            <CardDescription>
              {lastFullCheck 
                ? `Last checked: ${lastFullCheck.toLocaleTimeString()}`
                : 'Checking system health...'
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {healthStatus.map((status) => (
            <div key={status.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getServiceIcon(status.name)}
                <div>
                  <div className="font-medium">{status.name}</div>
                  <div className="text-sm text-muted-foreground">{status.message}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {status.responseTime && (
                  <div className="text-sm text-muted-foreground">
                    {status.responseTime.toFixed(0)}ms
                  </div>
                )}
                {getStatusBadge(status.status)}
              </div>
            </div>
          ))}
          
          {healthStatus.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Running initial health check...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}