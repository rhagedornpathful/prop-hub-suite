import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Dashboard Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Dashboard Error
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Something went wrong while loading the admin dashboard.</p>
                  <p className="mt-2">
                    This error has been logged and will be investigated. Please try refreshing the page.
                  </p>
                </div>

                {this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Technical Details (Click to expand)
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                      <div className="text-destructive font-bold">Error:</div>
                      <div className="mb-2">{this.state.error.message}</div>
                      
                      <div className="text-destructive font-bold">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>

                      {this.state.errorInfo && (
                        <>
                          <div className="text-destructive font-bold mt-4">Component Stack:</div>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={this.handleRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for admin dashboard sections
export const DashboardSectionErrorBoundary: React.FC<{ 
  children: ReactNode; 
  sectionName: string;
}> = ({ children, sectionName }) => {
  return (
    <AdminErrorBoundary
      fallback={
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium text-destructive">
              Error loading {sectionName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This section failed to load. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      }
      onError={(error) => {
        console.error(`Error in ${sectionName}:`, error);
      }}
    >
      {children}
    </AdminErrorBoundary>
  );
};