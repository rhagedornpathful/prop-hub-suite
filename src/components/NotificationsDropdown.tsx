import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Clock, AlertTriangle, CheckCircle2, X, ExternalLink } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { formatDistanceToNow, isAfter, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: 'overdue' | 'urgent' | 'behind_schedule' | 'long_running';
  title: string;
  description: string;
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
  severity: 'high' | 'medium' | 'low';
}

interface NotificationsDropdownProps {
  notificationCount: number;
  className?: string;
}

export function NotificationsDropdown({ notificationCount, className }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const { data: maintenanceRequests } = useMaintenanceRequests();
  const navigate = useNavigate();

  useEffect(() => {
    const notificationList: Notification[] = [];
    const requests = maintenanceRequests || [];

    // Overdue requests
    const overdueRequests = requests.filter(request => {
      if (dismissedIds.has(`overdue-${request.id}`)) return false;
      if (!request.due_date) return false;
      return isAfter(new Date(), new Date(request.due_date)) && request.status !== 'completed';
    });

    overdueRequests.forEach(request => {
      notificationList.push({
        id: `overdue-${request.id}`,
        type: 'overdue',
        title: `Overdue: ${request.title}`,
        description: `Due ${formatDistanceToNow(new Date(request.due_date!), { addSuffix: true })}`,
        timestamp: new Date(request.due_date!),
        actionUrl: '/maintenance',
        actionText: 'View Details',
        severity: 'high'
      });
    });

    // Urgent pending requests
    const urgentPendingRequests = requests.filter(request => {
      if (dismissedIds.has(`urgent-${request.id}`)) return false;
      return request.priority === 'urgent' && request.status === 'pending';
    });

    urgentPendingRequests.forEach(request => {
      notificationList.push({
        id: `urgent-${request.id}`,
        type: 'urgent',
        title: `Urgent: ${request.title}`,
        description: `Created ${formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}`,
        timestamp: new Date(request.created_at),
        actionUrl: '/maintenance',
        actionText: 'Assign Now',
        severity: 'high'
      });
    });

    // Behind schedule requests
    const behindScheduleRequests = requests.filter(request => {
      if (dismissedIds.has(`behind-${request.id}`)) return false;
      if (!request.scheduled_date || request.status === 'completed') return false;
      const scheduledDate = new Date(request.scheduled_date);
      const daysBehind = differenceInDays(new Date(), scheduledDate);
      return daysBehind > 0 && request.status === 'scheduled';
    });

    behindScheduleRequests.forEach(request => {
      const daysBehind = differenceInDays(new Date(), new Date(request.scheduled_date!));
      notificationList.push({
        id: `behind-${request.id}`,
        type: 'behind_schedule',
        title: `Behind Schedule: ${request.title}`,
        description: `${daysBehind} day${daysBehind > 1 ? 's' : ''} behind schedule`,
        timestamp: new Date(request.scheduled_date!),
        actionUrl: '/maintenance',
        actionText: 'Reschedule',
        severity: 'medium'
      });
    });

    // Long running requests
    const longRunningRequests = requests.filter(request => {
      if (dismissedIds.has(`long-${request.id}`)) return false;
      if (request.status !== 'in-progress' || !request.started_at) return false;
      const daysSinceStarted = differenceInDays(new Date(), new Date(request.started_at));
      return daysSinceStarted > 7;
    });

    longRunningRequests.forEach(request => {
      const daysSinceStarted = differenceInDays(new Date(), new Date(request.started_at!));
      notificationList.push({
        id: `long-${request.id}`,
        type: 'long_running',
        title: `Long Running: ${request.title}`,
        description: `In progress for ${daysSinceStarted} days`,
        timestamp: new Date(request.started_at!),
        actionUrl: '/maintenance',
        actionText: 'Check Status',
        severity: 'low'
      });
    });

    // Sort by severity and timestamp
    notificationList.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setNotifications(notificationList);
  }, [maintenanceRequests, dismissedIds]);

  const handleDismiss = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(prev => new Set(prev).add(notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'behind_schedule':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'long_running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="default" 
          className={`relative transition-all duration-200 ${className}`}
          aria-label={`Notifications (${notificationCount} unread)`}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive animate-pulse">
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-popover border shadow-lg z-50" align="end" forceMount>
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {visibleNotifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {visibleNotifications.length}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="max-h-96">
          {visibleNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {visibleNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer hover:bg-accent/50 transition-colors border-l-4 ${getSeverityColor(notification.severity)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                          {notification.actionText && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                              <ExternalLink className="h-3 w-3" />
                              <span>{notification.actionText}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDismiss(notification.id, e)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Dismiss</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {visibleNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center text-xs"
                onClick={() => navigate('/maintenance')}
              >
                View All in Maintenance
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}