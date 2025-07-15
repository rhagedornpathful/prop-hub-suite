import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePerformanceMonitor } from "@/lib/performance";
import { config } from "@/lib/config";

export const SimplePerformanceMonitor: React.FC = () => {
  const { getMetrics } = usePerformanceMonitor();
  const metrics = getMetrics();

  const getMetricColor = (metric: string, value: number) => {
    if (metric === 'lcp') return value > 2500 ? 'destructive' : value > 1500 ? 'secondary' : 'default';
    if (metric === 'fid') return value > 100 ? 'destructive' : value > 50 ? 'secondary' : 'default';
    if (metric === 'cls') return value > 0.25 ? 'destructive' : value > 0.1 ? 'secondary' : 'default';
    return 'default';
  };

  if (!config.isDevelopment || Object.keys(metrics).length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm">Performance Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(metrics).map(([key, value]) => {
          const numValue = typeof value === 'number' ? value : 0;
          return (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm font-medium">{key}</span>
              <Badge variant={getMetricColor(key, numValue)}>
                {key.includes('render') ? `${numValue.toFixed(2)}ms` : numValue.toFixed(2)}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};