import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Flame, Bell, X } from "lucide-react";
import { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { useState } from "react";
import { formatDistanceToNow, isAfter, differenceInDays } from "date-fns";

interface MaintenanceAlertsProps {
  requests: MaintenanceRequest[];
  onViewRequest: (request: MaintenanceRequest) => void;
}

const MaintenanceAlerts = ({ requests, onViewRequest }: MaintenanceAlertsProps) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Calculate overdue requests
  const overdueRequests = requests.filter(request => {
    if (dismissedAlerts.has(request.id)) return false;
    if (!request.due_date) return false;
    return isAfter(new Date(), new Date(request.due_date)) && request.status !== 'completed';
  });

  // Calculate behind schedule requests
  const behindScheduleRequests = requests.filter(request => {
    if (dismissedAlerts.has(request.id)) return false;
    if (!request.scheduled_date || request.status === 'completed') return false;
    const scheduledDate = new Date(request.scheduled_date);
    const daysBehind = differenceInDays(new Date(), scheduledDate);
    return daysBehind > 0 && request.status === 'scheduled';
  });

  // Calculate urgent pending requests
  const urgentPendingRequests = requests.filter(request => {
    if (dismissedAlerts.has(request.id)) return false;
    return request.priority === 'urgent' && request.status === 'pending';
  });

  // Calculate long-running requests (in progress for more than 7 days)
  const longRunningRequests = requests.filter(request => {
    if (dismissedAlerts.has(request.id)) return false;
    if (request.status !== 'in-progress' || !request.started_at) return false;
    const daysSinceStarted = differenceInDays(new Date(), new Date(request.started_at));
    return daysSinceStarted > 7;
  });

  const dismissAlert = (requestId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(requestId));
  };

  const totalAlerts = overdueRequests.length + behindScheduleRequests.length + 
                    urgentPendingRequests.length + longRunningRequests.length;

  if (totalAlerts === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <Bell className="w-5 h-5" />
            <span className="font-medium">All maintenance requests are on track</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Overdue Alerts */}
      {overdueRequests.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Flame className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 flex items-center justify-between">
            <span>🚨 {overdueRequests.length} Overdue Work Orders</span>
            <Badge variant="destructive" className="animate-pulse">
              CRITICAL
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-3">
            <div className="space-y-2">
              {overdueRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-white/50 rounded border border-red-200">
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{request.title}</p>
                    <p className="text-sm text-red-700">
                      Overdue by {formatDistanceToNow(new Date(request.due_date!), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onViewRequest(request)}
                    >
                      Resolve Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {overdueRequests.length > 3 && (
                <p className="text-sm text-red-600 font-medium">
                  +{overdueRequests.length - 3} more overdue requests
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Behind Schedule Alerts */}
      {behindScheduleRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-800 flex items-center justify-between">
            <span>⚠️ {behindScheduleRequests.length} Behind Schedule</span>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              ACTION NEEDED
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-3">
            <div className="space-y-2">
              {behindScheduleRequests.slice(0, 2).map((request) => {
                const daysBehind = differenceInDays(new Date(), new Date(request.scheduled_date!));
                return (
                  <div key={request.id} className="flex items-center justify-between p-2 bg-white/50 rounded border border-orange-200">
                    <div className="flex-1">
                      <p className="font-medium text-orange-900">{request.title}</p>
                      <p className="text-sm text-orange-700">
                        {daysBehind} day{daysBehind > 1 ? 's' : ''} behind schedule
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => onViewRequest(request)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {behindScheduleRequests.length > 2 && (
                <p className="text-sm text-orange-600 font-medium">
                  +{behindScheduleRequests.length - 2} more behind schedule
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Urgent Pending Alerts */}
      {urgentPendingRequests.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800 flex items-center justify-between">
            <span>🔥 {urgentPendingRequests.length} Urgent Requests Need Assignment</span>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              URGENT
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-3">
            <div className="space-y-2">
              {urgentPendingRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-white/50 rounded border border-yellow-200">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">{request.title}</p>
                    <p className="text-sm text-yellow-700">
                      Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => onViewRequest(request)}
                    >
                      Assign Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Long Running Work Alerts */}
      {longRunningRequests.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">
            📊 {longRunningRequests.length} Long-Running Work Orders
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-blue-700 mb-2">
              These requests have been in progress for over 7 days and may need attention.
            </p>
            <div className="space-y-1">
              {longRunningRequests.slice(0, 2).map((request) => {
                const daysSinceStarted = differenceInDays(new Date(), new Date(request.started_at!));
                return (
                  <div key={request.id} className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">{request.title}</span>
                    <span className="text-blue-600">{daysSinceStarted} days in progress</span>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MaintenanceAlerts;