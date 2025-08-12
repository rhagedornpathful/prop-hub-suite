import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  Eye,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const activityTypeColors = {
  maintenance: "bg-orange-100 text-orange-800 border-orange-200",
  property_check: "bg-blue-100 text-blue-800 border-blue-200", 
  payment: "bg-green-100 text-green-800 border-green-200",
  home_check: "bg-purple-100 text-purple-800 border-purple-200"
};

const activityTypeIcons = {
  maintenance: Wrench,
  property_check: CheckCircle,
  payment: DollarSign,
  home_check: Eye
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  'in-progress': "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  due: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  active: "bg-blue-100 text-blue-800 border-blue-200"
};

interface ActivityDetailDialogProps {
  activity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailDialog({ activity, open, onOpenChange }: ActivityDetailDialogProps) {
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    if (activity && open) {
      // Generate activity log based on activity type and metadata
      generateActivityLog(activity);
    }
  }, [activity, open]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!open || !activity) return;
      if (activity.type !== 'property_check' && activity.type !== 'home_check') {
        setReport(null);
        return;
      }
      try {
        setReportLoading(true);
        setReportError(null);
        const table = activity.type === 'property_check' ? 'property_check_sessions' : 'home_check_sessions';
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', activity.id)
          .maybeSingle();
        if (error) throw error;
        let checklist = data?.checklist_data as any;
        if (typeof checklist === 'string') {
          try { checklist = JSON.parse(checklist); } catch {}
        }
        setReport(data ? { ...data, checklist_data: checklist } : null);
      } catch (e: any) {
        setReportError(e?.message || 'Failed to load report');
        setReport(null);
      } finally {
        setReportLoading(false);
      }
    };
    fetchReport();
  }, [activity, open]);

  const generateActivityLog = (activity: any) => {
    const log: any[] = [];
    
    // Initial creation
    log.push({
      timestamp: activity.date,
      event: "Created",
      description: `${activity.type.replace('_', ' ')} was created`,
      type: "created"
    });

    // Add type-specific events based on metadata and status
    if (activity.type === 'maintenance') {
      if (activity.metadata?.assigned_to) {
        log.push({
          timestamp: activity.metadata.assigned_at || activity.date,
          event: "Assigned",
          description: `Assigned to ${activity.metadata.assigned_to_name || 'team member'}`,
          type: "assignment"
        });
      }
      if (activity.metadata?.scheduled_date) {
        log.push({
          timestamp: activity.metadata.scheduled_date,
          event: "Scheduled",
          description: `Scheduled for ${format(new Date(activity.metadata.scheduled_date), 'MMM d, yyyy')}`,
          type: "scheduling"
        });
      }
      if (activity.status === 'in-progress' && activity.metadata?.started_at) {
        log.push({
          timestamp: activity.metadata.started_at,
          event: "Started",
          description: "Work started on maintenance request",
          type: "progress"
        });
      }
      if (activity.status === 'completed' && activity.metadata?.completed_at) {
        log.push({
          timestamp: activity.metadata.completed_at,
          event: "Completed",
          description: "Maintenance request completed",
          type: "completion"
        });
      }
    } else if (activity.type === 'property_check') {
      if (activity.metadata?.scheduled_date) {
        log.push({
          timestamp: activity.metadata.scheduled_date,
          event: "Scheduled",
          description: `Property check scheduled for ${format(new Date(activity.metadata.scheduled_date), 'MMM d, yyyy')}`,
          type: "scheduling"
        });
      }
      if (activity.status === 'in-progress' && activity.metadata?.started_at) {
        log.push({
          timestamp: activity.metadata.started_at,
          event: "Started",
          description: "Property check started",
          type: "progress"
        });
      }
      if (activity.status === 'completed' && activity.metadata?.completed_at) {
        log.push({
          timestamp: activity.metadata.completed_at,
          event: "Completed",
          description: "Property check completed",
          type: "completion"
        });
      }
    } else if (activity.type === 'payment') {
      if (activity.metadata?.due_date) {
        log.push({
          timestamp: activity.metadata.due_date,
          event: "Due Date",
          description: `Payment due date: ${format(new Date(activity.metadata.due_date), 'MMM d, yyyy')}`,
          type: "scheduling"
        });
      }
      if (activity.status === 'paid' && activity.metadata?.paid_at) {
        log.push({
          timestamp: activity.metadata.paid_at,
          event: "Paid",
          description: "Payment received",
          type: "completion"
        });
      }
    }

    // Sort by timestamp
    log.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    setActivityLog(log);
  };

  const getActivityIcon = (type: string) => {
    const IconComponent = activityTypeIcons[type as keyof typeof activityTypeIcons] || AlertCircle;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    return (
      <Badge variant="outline" className={cn("text-xs", statusColors[status as keyof typeof statusColors])}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'assignment': return <User className="w-4 h-4 text-purple-500" />;
      case 'scheduling': return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completion': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const pretty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getActivityIcon(activity.type)}
              <span className="capitalize">{activity.type.replace('_', ' ')}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-lg font-semibold">{activity.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(activity.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={cn(
                      activity.metadata?.priority === 'high' ? 'border-red-200 text-red-800' :
                      activity.metadata?.priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
                      'border-green-200 text-green-800'
                    )}>
                      {activity.metadata?.priority || 'Normal'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="mt-1 text-sm">{format(new Date(activity.date), 'MMM d, yyyy h:mm a')}</div>
                </div>
                {activity.amount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <div className="mt-1 text-sm font-medium">${activity.amount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {activity.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">{activity.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{activity.metadata?.property_address || 'No property specified'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((logEntry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(logEntry.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{logEntry.event}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(logEntry.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{logEntry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(activity.type === 'property_check' || activity.type === 'home_check') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Check Report</CardTitle>
              </CardHeader>
              <CardContent>
                {reportLoading ? (
                  <div className="text-sm text-muted-foreground">Loading report...</div>
                ) : reportError ? (
                  <div className="text-sm text-destructive">Failed to load report: {reportError}</div>
                ) : report ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.started_at && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Started</label>
                          <div className="mt-1 text-sm">{format(new Date(report.started_at), 'MMM d, yyyy h:mm a')}</div>
                        </div>
                      )}
                      {report.completed_at && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Completed</label>
                          <div className="mt-1 text-sm">{format(new Date(report.completed_at), 'MMM d, yyyy h:mm a')}</div>
                        </div>
                      )}
                      {report.duration_minutes != null && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Duration</label>
                          <div className="mt-1 text-sm">{report.duration_minutes} min</div>
                        </div>
                      )}
                      {report.weather && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Weather</label>
                          <div className="mt-1 text-sm">{report.weather}</div>
                        </div>
                      )}
                      {typeof report.location_verified === 'boolean' && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location Verified</label>
                          <div className="mt-1 text-sm">{report.location_verified ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                    </div>

                    {report.checklist_data && typeof report.checklist_data === 'object' ? (
                      <div className="space-y-6">
                        {Object.entries(report.checklist_data).map(([sectionKey, items]) => (
                          <div key={sectionKey as string}>
                            <h3 className="text-sm font-semibold mb-2">{pretty(sectionKey as string)}</h3>
                            <div className="space-y-3">
                              {(items as any[]).map((item: any, idx: number) => (
                                <div key={item.id ?? idx} className="rounded-md border p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">{item.item || item.name || `Item ${idx + 1}`}</div>
                                    <Badge variant="outline" className={cn(item.completed ? "border-green-200 text-green-800" : "border-yellow-200 text-yellow-800")}> 
                                      {item.completed ? 'Completed' : 'Pending'}
                                    </Badge>
                                  </div>
                                  {item.notes && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{item.notes}</p>}
                                  {Array.isArray(item.photos) && item.photos.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {item.photos.map((url: string, i: number) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer">
                                          <img src={url} alt={`Check photo ${i + 1} - ${pretty(sectionKey as string)}`} loading="lazy" className="h-16 w-24 object-cover rounded-md border" />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No checklist items recorded.</div>
                    )}

                    {report.general_notes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">General Notes</label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{report.general_notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No report found for this check.</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          {(activity.metadata?.assigned_to || activity.metadata?.vendor_name || activity.metadata?.notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activity.metadata?.assigned_to && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <div className="mt-1 text-sm">{activity.metadata.assigned_to_name || activity.metadata.assigned_to}</div>
                  </div>
                )}
                
                {activity.metadata?.vendor_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                    <div className="mt-1 text-sm">{activity.metadata.vendor_name}</div>
                  </div>
                )}

                {activity.metadata?.estimated_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
                    <div className="mt-1 text-sm">${activity.metadata.estimated_cost.toLocaleString()}</div>
                  </div>
                )}

                {activity.metadata?.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{activity.metadata.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}