import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// import { SimplePerformanceMonitor } from '@/components/SimplePerformanceMonitor';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface PropertyEnterpriseWrapperProps {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  enablePerformanceMonitoring?: boolean;
  enableOfflineSupport?: boolean;
}

export function PropertyEnterpriseWrapper({
  children,
  title = "Property Management",
  isLoading = false,
  error = null,
  onRetry,
  enablePerformanceMonitoring = true,
  enableOfflineSupport = true
}: PropertyEnterpriseWrapperProps) {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime: number;
    renderTime: number;
  } | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You're back online. Data will sync automatically.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (enableOfflineSupport) {
        toast({
          title: "Working Offline",
          description: "Changes will sync when connection is restored.",
          variant: "default",
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, enableOfflineSupport]);

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      const startTime = performance.now();
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const renderTime = performance.now() - startTime;
        
        setPerformanceMetrics({
          loadTime: entries[0]?.duration || 0,
          renderTime: renderTime
        });
      });

      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, [enablePerformanceMonitoring]);

  // Global error handling
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Property Enterprise Error:', error, errorInfo);
    
    // Send to error reporting service (Sentry, LogRocket, etc.)
    // errorReportingService.captureException(error, { extra: errorInfo });
    
    toast({
      title: "System Error",
      description: "An unexpected error occurred. Our team has been notified.",
      variant: "destructive",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Loading {title}</h3>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Unable to Load {title}</h3>
              <p className="text-sm text-muted-foreground">
                {error.message || "An unexpected error occurred while loading your data."}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {onRetry && (
                <Button onClick={onRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <div className="relative">
        {/* Offline indicator */}
        {!isOnline && enableOfflineSupport && (
          <Alert className="mb-4 bg-warning/10 border-warning/20">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You're working offline. Changes will sync when reconnected.</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection status indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
            isOnline 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-warning/10 text-warning border border-warning/20'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </div>
        </div>

        {/* Performance monitoring */}
        {enablePerformanceMonitoring && performanceMetrics && (
          <div className="fixed bottom-4 left-4 z-50 bg-muted/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
            Load: {performanceMetrics.loadTime.toFixed(1)}ms | Render: {performanceMetrics.renderTime.toFixed(1)}ms
          </div>
        )}

        {/* Main content */}
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
}