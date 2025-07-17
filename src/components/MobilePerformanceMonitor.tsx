import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobilePerformance } from '@/hooks/useMobilePerformance';
import { Smartphone, Monitor, Wifi, Zap, Eye, Settings } from 'lucide-react';

export function MobilePerformanceMonitor() {
  const {
    config,
    optimizations,
    isCommonMobileViewport,
    isMobileViewport,
    isSmallMobile,
    shouldReduceAnimations,
    shouldLimitItems,
    getGridColumns
  } = useMobilePerformance();

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mobile Performance Monitor</h2>
        <p className="text-muted-foreground">
          Real-time mobile optimization status and device capabilities
        </p>
      </div>

      {/* Device Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span>Viewport Width:</span>
              <Badge variant={isMobileViewport ? 'default' : 'secondary'}>
                {config.viewportWidth}px
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Is Mobile:</span>
              <Badge variant={config.isMobile ? 'default' : 'secondary'}>
                {config.isMobile ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Small Mobile:</span>
              <Badge variant={isSmallMobile ? 'destructive' : 'secondary'}>
                {isSmallMobile ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Common Size:</span>
              <Badge variant={isCommonMobileViewport() ? 'default' : 'outline'}>
                {isCommonMobileViewport() ? 'Standard' : 'Custom'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Low-End Device:</span>
              <Badge variant={config.isLowEndDevice ? 'destructive' : 'default'}>
                {config.isLowEndDevice ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Grid Columns:</span>
              <Badge variant="outline">
                {getGridColumns(4)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Reduced Animations:
              </span>
              <Badge variant={shouldReduceAnimations ? 'default' : 'outline'}>
                {shouldReduceAnimations ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Limited Items:
              </span>
              <Badge variant={shouldLimitItems ? 'default' : 'outline'}>
                {shouldLimitItems ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Deferred Loading:
              </span>
              <Badge variant={optimizations.deferNonCritical ? 'default' : 'outline'}>
                {optimizations.deferNonCritical ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Optimized Images:
              </span>
              <Badge variant={optimizations.useOptimizedImages ? 'default' : 'outline'}>
                {optimizations.useOptimizedImages ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Network & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span>Connection Speed:</span>
              <Badge 
                variant={
                  config.connectionSpeed === 'slow' ? 'destructive' : 
                  config.connectionSpeed === 'medium' ? 'secondary' : 'default'
                }
              >
                {config.connectionSpeed.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Prefers Reduced Motion:</span>
              <Badge variant={config.prefersReducedMotion ? 'default' : 'outline'}>
                {config.prefersReducedMotion ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Hardware Cores:</span>
              <Badge variant="outline">
                {navigator.hardwareConcurrency || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewport Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Common Mobile Viewport Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[320, 375, 390, 414, 428].map(width => {
              const isCurrentWidth = Math.abs(config.viewportWidth - width) <= 10;
              return (
                <div key={width} className="text-center p-3 border rounded-lg">
                  <div className="text-sm font-medium">{width}px</div>
                  <Badge 
                    variant={isCurrentWidth ? 'default' : 'outline'}
                    className="mt-1"
                  >
                    {isCurrentWidth ? 'Current' : 'Test'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {(isSmallMobile || config.isLowEndDevice || config.connectionSpeed === 'slow') && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Recommendations:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {isSmallMobile && <li>• Small viewport detected - limiting grid columns and content</li>}
              {config.isLowEndDevice && <li>• Low-end device detected - reducing animations and effects</li>}
              {config.connectionSpeed === 'slow' && <li>• Slow connection - deferring non-critical content</li>}
              {shouldReduceAnimations && <li>• Animations reduced for better performance</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}