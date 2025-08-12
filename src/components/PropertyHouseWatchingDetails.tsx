import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Eye, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  Plus,
  Timer
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isPast, isFuture } from "date-fns";
import { ScheduleHomeCheckDialog } from "@/components/ScheduleHomeCheckDialog";

interface PropertyHouseWatchingDetailsProps {
  propertyId: string;
  propertyAddress?: string;
}

interface HouseWatchingRecord {
  id: string;
  property_address: string;
  start_date: string;
  check_frequency: string;
  monthly_fee: number;
  status: string;
  next_check_date: string | null;
  last_check_date: string | null;
  notes?: string;
}

interface HomeCheckSession {
  id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function PropertyHouseWatchingDetails({ propertyId, propertyAddress }: PropertyHouseWatchingDetailsProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Fetch house watching record for this property
  const { data: houseWatchingData, isLoading: isHouseWatchingLoading } = useQuery({
    queryKey: ['house-watching-property', propertyId, propertyAddress],
    queryFn: async () => {
      if (!propertyAddress) return null;
      
      const { data, error } = await supabase
        .from('house_watching')
        .select('*')
        .eq('property_address', propertyAddress)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data as HouseWatchingRecord | null;
    },
    enabled: !!propertyAddress,
  });

  // Fetch home check sessions for this property
  const { data: homeCheckSessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['home-check-sessions-property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as HomeCheckSession[];
    },
    enabled: !!propertyId,
  });

  if (isHouseWatchingLoading || isSessionsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!houseWatchingData) {
    return (
      <div className="text-center py-8">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No House Watching Service</h3>
        <p className="text-muted-foreground mb-4">
          This property is not currently enrolled in house watching services.
        </p>
        <p className="text-sm text-muted-foreground">
          Assign a house watching service package to enable scheduled property checks.
        </p>
      </div>
    );
  }

  const getCheckStatus = () => {
    if (!houseWatchingData.next_check_date) return { status: 'unscheduled', color: 'bg-muted' };
    
    const nextCheck = new Date(houseWatchingData.next_check_date);
    if (isPast(nextCheck)) return { status: 'overdue', color: 'bg-destructive' };
    if (isToday(nextCheck)) return { status: 'today', color: 'bg-warning' };
    return { status: 'scheduled', color: 'bg-success' };
  };

  const checkStatus = getCheckStatus();

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'bi_weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return frequency;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* House Watching Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            House Watching Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Check Frequency */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Check Frequency</p>
                <p className="text-lg font-bold">{getFrequencyDisplay(houseWatchingData.check_frequency)}</p>
              </div>
            </div>

            {/* Monthly Fee */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Monthly Fee</p>
                <p className="text-lg font-bold text-success">
                  ${houseWatchingData.monthly_fee}
                </p>
              </div>
            </div>

            {/* Service Status */}
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${checkStatus.color}/20 rounded-full flex items-center justify-center`}>
                <CheckCircle className={`h-5 w-5 ${checkStatus.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Service Status</p>
                <Badge className={checkStatus.color}>
                  {houseWatchingData.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Next Check */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next Check</p>
                  <p className={`text-lg font-bold ${
                    checkStatus.status === 'overdue' ? 'text-destructive' :
                    checkStatus.status === 'today' ? 'text-warning' :
                    'text-foreground'
                  }`}>
                    {houseWatchingData.next_check_date 
                      ? format(new Date(houseWatchingData.next_check_date), 'PPP')
                      : 'Not scheduled'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsScheduleDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Check
              </Button>
            </div>
          </div>

          {/* Last Check */}
          {houseWatchingData.last_check_date && (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Last Check</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(houseWatchingData.last_check_date), 'PPP')}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {houseWatchingData.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Notes</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {houseWatchingData.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Home Check Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Home Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {homeCheckSessions.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No home checks recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {homeCheckSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getSessionStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {session.scheduled_date 
                          ? `Scheduled: ${format(new Date(session.scheduled_date), 'MMM d, yyyy')}`
                          : `Created: ${format(new Date(session.created_at), 'MMM d, yyyy')}`
                        }
                      </p>
                      {session.scheduled_time && (
                        <p className="text-xs text-muted-foreground">
                          {session.scheduled_time}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {session.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {format(new Date(session.completed_at), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      {propertyAddress && (
        <ScheduleHomeCheckDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          propertyId={propertyId}
          propertyAddress={propertyAddress}
        />
      )}
    </div>
  );
}