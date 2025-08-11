import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  cacheHitRate: number;
  memoryUsage: number;
  renderTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryCount: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    cacheHitRate: 95,
    memoryUsage: 45,
    renderTime: 0,
  });

  useEffect(() => {
    // Simulate performance monitoring
    const startTime = performance.now();
    
    const interval = setInterval(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        queryCount: prev.queryCount + Math.floor(Math.random() * 3),
        averageQueryTime: 150 + Math.random() * 100,
        slowQueries: Math.floor(Math.random() * 2),
        cacheHitRate: 90 + Math.random() * 10,
        memoryUsage: 40 + Math.random() * 20,
        renderTime: renderTime > 16 ? renderTime : prev.renderTime,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (value: number, threshold: number, inverted = false) => {
    const isGood = inverted ? value < threshold : value > threshold;
    return isGood ? 'good' : 'warning';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Query Count</span>
              <Badge variant="secondary">{metrics.queryCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Query Time</span>
              <div className="flex items-center gap-1">
                {getPerformanceStatus(metrics.averageQueryTime, 200, true) === 'good' ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
                <Badge variant="secondary">{metrics.averageQueryTime.toFixed(0)}ms</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Slow Queries</span>
              <div className="flex items-center gap-1">
                {metrics.slowQueries === 0 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <Badge variant={metrics.slowQueries === 0 ? "secondary" : "destructive"}>
                  {metrics.slowQueries}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Hit Rate</span>
                <span className="text-sm font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cacheHitRate} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Render Time</span>
              <div className="flex items-center gap-1">
                {metrics.renderTime < 16 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
                <Badge variant="secondary">{metrics.renderTime.toFixed(1)}ms</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        {(metrics.slowQueries > 0 || metrics.averageQueryTime > 200) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Performance Tips:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  {metrics.slowQueries > 0 && <li>• Consider optimizing slow queries or adding pagination</li>}
                  {metrics.averageQueryTime > 200 && <li>• Query response time is above optimal threshold</li>}
                  {metrics.cacheHitRate < 85 && <li>• Cache hit rate could be improved</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}