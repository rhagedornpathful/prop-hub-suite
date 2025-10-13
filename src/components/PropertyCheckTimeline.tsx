import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, CheckCircle2, Zap, ClipboardList } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

interface PropertyCheckTimelineProps {
  checks: Tables<'property_check_sessions'>[];
  isLoading?: boolean;
}

export const PropertyCheckTimeline = ({ checks, isLoading }: PropertyCheckTimelineProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checks || checks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No property checks recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedChecks = [...checks].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDuration = (startedAt: string | null, completedAt: string | null) => {
    if (!startedAt || !completedAt) return null;
    
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedChecks.map((check) => {
            const duration = formatDuration(check.started_at, check.completed_at);
            
            return (
              <div key={check.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {check.check_type === 'quick' ? (
                      <Zap className="h-4 w-4 text-primary" />
                    ) : (
                      <ClipboardList className="h-4 w-4 text-secondary" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {check.check_type === 'quick' ? 'Quick Check' : 'Full Check'}
                        </span>
                        <Badge variant={getStatusColor(check.status)} className="text-xs">
                          {check.status}
                        </Badge>
                      </div>
                      {check.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      {check.scheduled_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Scheduled: {format(new Date(check.scheduled_date), 'PPP')}
                            {check.scheduled_time && ` at ${check.scheduled_time}`}
                          </span>
                        </div>
                      )}
                      
                      {check.started_at && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            Started: {format(new Date(check.started_at), 'PPp')}
                          </span>
                        </div>
                      )}

                      {check.completed_at && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            Completed: {format(new Date(check.completed_at), 'PPp')}
                            {duration && ` (${duration})`}
                          </span>
                        </div>
                      )}

                      {!check.started_at && !check.completed_at && check.status === 'scheduled' && (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          <span>Awaiting start</span>
                        </div>
                      )}
                    </div>

                    {check.general_notes && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                        {check.general_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
