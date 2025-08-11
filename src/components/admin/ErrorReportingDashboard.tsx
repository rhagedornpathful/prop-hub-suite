import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/enhanced-icon';
import { 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Bug, 
  CheckCircle 
} from 'lucide-react';
import { errorReporter, ErrorReport } from '@/lib/errorReporting';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ErrorReportingDashboard: React.FC = () => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [stats, setStats] = useState(errorReporter.getErrorStats());

  useEffect(() => {
    // Initialize with existing errors
    setErrors(errorReporter.getRecentErrors(50));
    setStats(errorReporter.getErrorStats());

    // Subscribe to new errors
    const unsubscribe = errorReporter.subscribe((newError) => {
      setErrors(prev => [newError, ...prev.slice(0, 49)]);
      setStats(errorReporter.getErrorStats());
    });

    return unsubscribe;
  }, []);

  const filteredErrors = errors.filter(error => 
    severityFilter === 'all' || error.severity === severityFilter
  );

  const getSeverityVariant = (severity: ErrorReport['severity']) => {
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

  const getSeverityColor = (severity: ErrorReport['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'high':
        return 'text-destructive';
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const clearErrors = () => {
    errorReporter.clearErrors();
    setErrors([]);
    setStats(errorReporter.getErrorStats());
  };

  const testError = () => {
    errorReporter.report(
      new Error('Test error for dashboard demonstration'),
      { action: 'test_error', metadata: { source: 'error_dashboard' } },
      'medium'
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Icon icon={AlertCircle} size="lg" className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.severityCounts.critical || 0}
                </p>
              </div>
              <Icon icon={AlertTriangle} size="lg" className="text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.severityCounts.high || 0}
                </p>
              </div>
              <Icon icon={XCircle} size="lg" className="text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Errors</p>
                <p className="text-2xl font-bold">
                  {stats.recentErrors.length}
                </p>
              </div>
              <Icon icon={Clock} size="lg" className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Critical Errors Alert */}
      {stats.recentErrors.some(e => e.severity === 'critical') && (
        <Alert className="border-destructive">
          <Icon icon={AlertTriangle} className="text-destructive" />
          <AlertDescription>
            <strong>Critical errors detected!</strong> There are recent critical errors that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Error List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon={Bug} size="sm" />
              Error Reports
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={testError}>
                Test Error
              </Button>
              <Button variant="outline" size="sm" onClick={clearErrors}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon icon={CheckCircle} size="xl" className="mx-auto mb-2 text-success" />
              <p>No errors to display</p>
              <p className="text-sm">System is running smoothly</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Error</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Fingerprint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.slice(0, 20).map((error) => (
                    <TableRow key={`${error.fingerprint}-${error.timestamp}`}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium truncate">{error.message}</p>
                          {error.context.action && (
                            <p className="text-xs text-muted-foreground">
                              Action: {error.context.action}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(error.severity)}>
                          {error.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {error.context.route || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {error.fingerprint}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};