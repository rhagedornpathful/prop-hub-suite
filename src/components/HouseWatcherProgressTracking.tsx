import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Target, Award, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

interface ProgressStats {
  weekly: {
    completed: number;
    scheduled: number;
    onTime: number;
    overdue: number;
  };
  monthly: {
    completed: number;
    totalRevenue: number;
    averageDuration: number;
    issuesFound: number;
  };
  performance: {
    completionRate: number;
    onTimeRate: number;
    averageRating: number;
    totalProperties: number;
  };
}

interface HouseWatcherProgressTrackingProps {
  className?: string;
}

export const HouseWatcherProgressTracking = ({ className }: HouseWatcherProgressTrackingProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    weekly: { completed: 0, scheduled: 0, onTime: 0, overdue: 0 },
    monthly: { completed: 0, totalRevenue: 0, averageDuration: 0, issuesFound: 0 },
    performance: { completionRate: 0, onTimeRate: 0, averageRating: 0, totalProperties: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressStats();
    }
  }, [user]);

  const loadProgressStats = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get house watcher record
      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!houseWatcher) {
        setLoading(false);
        return;
      }

      // Get assigned properties
      const { data: assignments } = await supabase
        .from('house_watcher_properties')
        .select('property_id')
        .eq('house_watcher_id', houseWatcher.id);

      const totalProperties = assignments?.length || 0;

      // Get weekly check sessions
      const { data: weeklySessions } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('started_at', weekStart.toISOString())
        .lte('started_at', weekEnd.toISOString());

      // Get monthly check sessions
      const { data: monthlySessions } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('started_at', monthStart.toISOString())
        .lte('started_at', monthEnd.toISOString());

      // Get all check sessions for performance metrics
      const { data: allSessions } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', user?.id);

      // Get scheduled checks for the week
      const { data: scheduledChecks } = await supabase
        .from('house_watching')
        .select('*')
        .eq('user_id', user?.id)
        .gte('next_check_date', weekStart.toISOString().split('T')[0])
        .lte('next_check_date', weekEnd.toISOString().split('T')[0]);

      // Calculate weekly stats
      const weeklyCompleted = weeklySessions?.filter(s => s.status === 'completed').length || 0;
      const weeklyScheduled = scheduledChecks?.length || 0;
      const weeklyOnTime = weeklySessions?.filter(s => {
        if (!s.scheduled_date) return true;
        const scheduledDate = new Date(s.scheduled_date);
        const completedDate = new Date(s.started_at);
        return completedDate <= scheduledDate;
      }).length || 0;
      const weeklyOverdue = scheduledChecks?.filter(c => {
        const checkDate = new Date(c.next_check_date);
        return checkDate < now;
      }).length || 0;

      // Calculate monthly stats
      const monthlyCompleted = monthlySessions?.filter(s => s.status === 'completed').length || 0;
      const monthlyRevenue = assignments?.reduce((sum, assignment) => {
        return sum + 150; // Estimated monthly fee per property
      }, 0) || 0;
      const monthlyDurations = monthlySessions?.filter(s => s.duration_minutes).map(s => s.duration_minutes) || [];
      const averageDuration = monthlyDurations.length > 0 
        ? monthlyDurations.reduce((sum, duration) => sum + (duration || 0), 0) / monthlyDurations.length 
        : 0;
      const monthlyIssues = monthlySessions?.reduce((sum, s) => sum + (s.total_issues_found || 0), 0) || 0;

      // Calculate performance stats
      const completedSessions = allSessions?.filter(s => s.status === 'completed').length || 0;
      const totalSessions = allSessions?.length || 0;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      
      const onTimeSessions = allSessions?.filter(s => {
        if (!s.scheduled_date) return true;
        const scheduledDate = new Date(s.scheduled_date);
        const completedDate = new Date(s.started_at);
        return completedDate <= scheduledDate;
      }).length || 0;
      const onTimeRate = completedSessions > 0 ? (onTimeSessions / completedSessions) * 100 : 0;

      // Mock average rating (would come from client feedback in real app)
      const averageRating = 4.2;

      setStats({
        weekly: {
          completed: weeklyCompleted,
          scheduled: weeklyScheduled,
          onTime: weeklyOnTime,
          overdue: weeklyOverdue
        },
        monthly: {
          completed: monthlyCompleted,
          totalRevenue: monthlyRevenue,
          averageDuration: Math.round(averageDuration),
          issuesFound: monthlyIssues
        },
        performance: {
          completionRate: Math.round(completionRate),
          onTimeRate: Math.round(onTimeRate),
          averageRating,
          totalProperties
        }
      });

    } catch (error: any) {
      toast({
        title: "Error Loading Progress",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Weekly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekly.completed}</div>
            <p className="text-xs text-muted-foreground">
              Completed of {stats.weekly.scheduled} scheduled
            </p>
            <Progress 
              value={stats.weekly.scheduled > 0 ? (stats.weekly.completed / stats.weekly.scheduled) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.weekly.onTime}</div>
            <p className="text-xs text-muted-foreground">
              On-time completions
            </p>
            <div className="mt-2">
              <Badge variant="secondary">
                {stats.weekly.completed > 0 ? Math.round((stats.weekly.onTime / stats.weekly.completed) * 100) : 0}% on time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.weekly.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Checks overdue
            </p>
            {stats.weekly.overdue > 0 && (
              <div className="mt-2">
                <Badge variant="destructive">Needs attention</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthly.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Monthly earnings
            </p>
            <div className="mt-2">
              <Badge variant="outline">
                {stats.performance.totalProperties} properties
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm font-bold">{stats.performance.completionRate}%</span>
            </div>
            <Progress value={stats.performance.completionRate} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">On-Time Rate</span>
              <span className="text-sm font-bold">{stats.performance.onTimeRate}%</span>
            </div>
            <Progress value={stats.performance.onTimeRate} />

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <div className="text-2xl font-bold">{stats.monthly.completed}</div>
                <p className="text-xs text-muted-foreground">Checks completed</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.monthly.averageDuration}m</div>
                <p className="text-xs text-muted-foreground">Average duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Client Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{stats.performance.averageRating}</span>
                <span className="text-yellow-500">{getRatingStars(stats.performance.averageRating)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.monthly.issuesFound}</div>
                <p className="text-xs text-muted-foreground">Issues identified</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.performance.totalProperties}</div>
                <p className="text-xs text-muted-foreground">Properties managed</p>
              </div>
            </div>

            <div className="mt-4">
              <Badge variant="secondary" className="w-full justify-center">
                <Award className="h-4 w-4 mr-2" />
                Excellent Performance
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};