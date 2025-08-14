import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Eye, Camera, FileText, Home, DollarSign, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, isPast, differenceInDays, addDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useHouseWatcherSchedule } from '@/hooks/useHouseWatcherSchedule';
import { useHouseWatcherNotifications } from '@/hooks/useHouseWatcherNotifications';
import { HouseWatcherMobileNavigation } from '@/components/HouseWatcherMobileNavigation';
import { DashboardSkeleton } from '@/components/HouseWatcherLoadingStates';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface ScheduledCheck {
  id: string;
  property_address: string;
  check_frequency: string;
  next_check_date: string;
  status: string;
  special_instructions: string;
  monthly_fee: number;
  owner_name: string;
  emergency_contact: string;
  property_id: string;
}

const HouseWatcherHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isViewingAs } = useUserRole();
  const { isMobile } = useMobileDetection();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const { schedule: weeklySchedule, loading, updateNextCheckDate } = useHouseWatcherSchedule(currentWeek);
  const { sendCheckReminder, notifyCheckCompleted } = useHouseWatcherNotifications();

  // Check for due reminders
  useEffect(() => {
    weeklySchedule.forEach(check => {
      if (isPast(new Date(check.next_check_date)) || isToday(new Date(check.next_check_date))) {
        sendCheckReminder(check.property_address, check.next_check_date);
      }
    });
  }, [weeklySchedule]);

  const startHomeCheck = async (propertyId: string, propertyAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('home_check_sessions')
        .insert({
          property_id: propertyId,
          user_id: user?.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Home Check Started",
        description: "You can now begin documenting your home inspection.",
      });

      navigate(`/house-watcher/check/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error Starting Check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const completeCheck = async (watchingId: string, propertyAddress: string) => {
    try {
      await updateNextCheckDate(watchingId, new Date());
      await notifyCheckCompleted(propertyAddress, watchingId);
    } catch (error: any) {
      toast({
        title: "Error Completing Check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCheckPriority = (nextCheckDate: string) => {
    const checkDate = new Date(nextCheckDate);
    const now = new Date();
    
    if (isPast(checkDate)) {
      return { priority: 'overdue', color: 'destructive', label: 'Overdue', icon: AlertTriangle };
    } else if (isToday(checkDate)) {
      return { priority: 'today', color: 'default', label: 'Due Today', icon: Sun };
    } else if (isTomorrow(checkDate)) {
      return { priority: 'tomorrow', color: 'secondary', label: 'Due Tomorrow', icon: Moon };
    } else {
      return { priority: 'upcoming', color: 'outline', label: 'Upcoming', icon: Clock };
    }
  };

  const getDayOfWeek = (dateString: string) => {
    return format(new Date(dateString), 'EEEE');
  };

  const getFormattedDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd');
  };

  const sortedSchedule = weeklySchedule.sort((a, b) => {
    const dateA = new Date(a.next_check_date);
    const dateB = new Date(b.next_check_date);
    return dateA.getTime() - dateB.getTime();
  });

  const groupedByDay = sortedSchedule.reduce((acc, check) => {
    const day = getDayOfWeek(check.next_check_date);
    if (!acc[day]) acc[day] = [];
    acc[day].push(check);
    return acc;
  }, {} as Record<string, ScheduledCheck[]>);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <>
        <DashboardSkeleton />
        {isMobile && <HouseWatcherMobileNavigation />}
      </>
    );
  }

  return (
    <div className={`space-y-8 ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">
            Week of {format(startOfWeek(currentWeek), 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))} 
            variant="outline"
          >
            Previous Week
          </Button>
          <Button 
            onClick={() => setCurrentWeek(new Date())} 
            variant="outline"
          >
            This Week
          </Button>
          <Button 
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))} 
            variant="outline"
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Week Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedSchedule.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {sortedSchedule.filter(c => isPast(new Date(c.next_check_date))).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Sun className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedSchedule.filter(c => isToday(new Date(c.next_check_date))).length}
            </div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sortedSchedule.map(c => c.property_address)).size}
            </div>
            <p className="text-xs text-muted-foreground">Properties watching</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate('/house-watcher-properties')} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            View My Properties
          </Button>
          {/* Removed admin-only links from house watcher portal */}
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Daily Schedule</h2>
        
        {weekDays.map(day => {
          const dayChecks = groupedByDay[day] || [];
          return (
            <Card key={day} className={dayChecks.length > 0 ? "border-l-4 border-l-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{day}</h3>
                  <Badge variant="secondary">{dayChecks.length} checks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {dayChecks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No checks scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {dayChecks.map((check) => {
                      const priority = getCheckPriority(check.next_check_date);
                      const PriorityIcon = priority.icon;
                      
                      return (
                        <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                            <PriorityIcon className={`h-5 w-5 ${
                              priority.priority === 'overdue' ? 'text-destructive' :
                              priority.priority === 'today' ? 'text-yellow-500' :
                              'text-muted-foreground'
                            }`} />
                            <div>
                              <h4 className="font-semibold">{check.property_address}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getFormattedDate(check.next_check_date)} • {check.check_frequency}
                              </p>
                              {check.special_instructions && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <strong>Note:</strong> {check.special_instructions}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={priority.color as any}>{priority.label}</Badge>
                            <Button 
                              size="sm"
                              onClick={() => startHomeCheck(check.property_id, check.property_address)}
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Start Check
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {isMobile && <HouseWatcherMobileNavigation />}
    </div>
  );
};

export default HouseWatcherHome;