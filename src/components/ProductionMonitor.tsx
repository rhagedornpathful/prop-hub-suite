import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Monitor, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { config } from '@/lib/config';
import { errorReporter } from '@/lib/errorReporting';

interface PerformanceMetrics {
  memoryUsage: number;
  loadTime: number;
  errorRate: number;
  userSessions: number;
  lastUpdated: Date;
}

export function ProductionMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    errorRate: 0,
    userSessions: 0,
    lastUpdated: new Date(),
  });

  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Memory usage (if available)
      const memoryUsage = (performance as any).memory 
        ? Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100)
        : 0;

      // Load time from Navigation Timing API
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;

      // Error rate from error reporter
      const errorStats = errorReporter.getErrorStats();
      const errorRate = errorStats.total > 0 ? (errorStats.severityCounts.high || 0) / errorStats.total * 100 : 0;

      // Mock user sessions (in real app, this would come from analytics)
      const userSessions = Math.floor(Math.random() * 50) + 10;

      setMetrics({
        memoryUsage,
        loadTime: Math.round(loadTime),
        errorRate: Math.round(errorRate),
        userSessions,
        lastUpdated: new Date(),
      });

      // Generate alerts based on metrics
      const newAlerts: string[] = [];
      if (memoryUsage > 80) newAlerts.push('High memory usage detected');
      if (loadTime > 3000) newAlerts.push('Slow page load times');
      if (errorRate > 5) newAlerts.push('High error rate detected');
      
      setAlerts(newAlerts);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Only show in production with monitoring enabled
  if (!config.isProduction || !config.features.performanceMonitoring) {
    return null;
  }

  const getMemoryStatus = (usage: number) => {
    if (usage > 80) return { color: 'text-red-500', status: 'Critical' };
    if (usage > 60) return { color: 'text-yellow-500', status: 'Warning' };
    return { color: 'text-green-500', status: 'Good' };
  };

  const getLoadTimeStatus = (time: number) => {
    if (time > 3000) return { color: 'text-red-500', status: 'Slow' };
    if (time > 1500) return { color: 'text-yellow-500', status: 'Moderate' };
    return { color: 'text-green-500', status: 'Fast' };
  };

  return (
    <div className="fixed top-4 left-4 z-50 w-80 space-y-2">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Production Monitor
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Last updated: {metrics.lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {/* Memory Usage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span>Memory Usage</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getMemoryStatus(metrics.memoryUsage).color}`}
              >
                {getMemoryStatus(metrics.memoryUsage).status}
              </Badge>
            </div>
            <Progress value={metrics.memoryUsage} className="h-1" />
            <div className="text-right text-gray-400">{metrics.memoryUsage}%</div>
          </div>

          {/* Load Time */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Load Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={getLoadTimeStatus(metrics.loadTime).color}>
                {metrics.loadTime}ms
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getLoadTimeStatus(metrics.loadTime).color}`}
              >
                {getLoadTimeStatus(metrics.loadTime).status}
              </Badge>
            </div>
          </div>

          {/* Error Rate */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Error Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={metrics.errorRate > 5 ? 'text-red-500' : 'text-green-500'}>
                {metrics.errorRate}%
              </span>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="flex justify-between items-center">
            <span>Active Sessions</span>
            <span className="text-blue-400">{metrics.userSessions}</span>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center gap-1 text-red-400 mb-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="font-medium">Alerts</span>
              </div>
              {alerts.map((alert, index) => (
                <div key={index} className="text-xs text-red-300">
                  • {alert}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}