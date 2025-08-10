import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Eye, Download, Filter, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface CheckHistoryItem {
  id: string;
  property_id: string;
  property_address: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  status: string;
  total_issues_found: number;
  photos_taken: number;
  general_notes: string | null;
  overall_condition: string | null;
  weather: string | null;
}

interface HouseWatcherCheckHistoryProps {
  className?: string;
}

export const HouseWatcherCheckHistory = ({ className }: HouseWatcherCheckHistoryProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<CheckHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('this_month');

  useEffect(() => {
    if (user) {
      loadCheckHistory();
    }
  }, [user, statusFilter, dateRange]);

  const loadCheckHistory = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('home_check_sessions')
        .select(`
          id,
          property_id,
          started_at,
          completed_at,
          duration_minutes,
          status,
          total_issues_found,
          photos_taken,
          general_notes,
          overall_condition,
          weather
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply date range filter
      const now = new Date();
      if (dateRange === 'this_month') {
        query = query
          .gte('started_at', startOfMonth(now).toISOString())
          .lte('started_at', endOfMonth(now).toISOString());
      } else if (dateRange === 'last_30_days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('started_at', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get property addresses for each session
      const sessionsWithAddresses = await Promise.all(
        (data || []).map(async (session) => {
          // Try to get from house_watching table first
          const { data: watchingData } = await supabase
            .from('house_watching')
            .select('property_address')
            .eq('id', session.property_id)
            .single();

          let property_address = 'Unknown Property';
          
          if (watchingData) {
            property_address = watchingData.property_address;
          } else {
            // Fallback to properties table
            const { data: propertyData } = await supabase
              .from('properties')
              .select('address')
              .eq('id', session.property_id)
              .single();
              
            if (propertyData) {
              property_address = propertyData.address;
            }
          }

          return {
            ...session,
            property_address
          };
        })
      );

      setHistory(sessionsWithAddresses);
    } catch (error: any) {
      toast({
        title: "Error Loading History",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewCheckDetails = (sessionId: string) => {
    // Navigate to check details or open modal
    window.open(`/home-check/${sessionId}`, '_blank');
  };

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Property', 'Duration', 'Status', 'Issues Found', 'Photos', 'Condition', 'Weather', 'Notes'].join(','),
      ...filteredHistory.map(item => [
        format(new Date(item.started_at), 'yyyy-MM-dd HH:mm'),
        `"${item.property_address}"`,
        item.duration_minutes || 0,
        item.status,
        item.total_issues_found || 0,
        item.photos_taken || 0,
        item.overall_condition || '',
        item.weather || '',
        `"${item.general_notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-watcher-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter(item =>
    item.property_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getConditionColor = (condition: string | null) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Check History</CardTitle>
          <Button onClick={exportHistory} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No check history found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Complete your first property check to see history here'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.property_address}</h4>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(item.started_at), 'MMM dd, yyyy HH:mm')}</span>
                      {item.duration_minutes && (
                        <span>{item.duration_minutes} minutes</span>
                      )}
                      {item.total_issues_found !== null && (
                        <span>{item.total_issues_found} issues</span>
                      )}
                      {item.photos_taken !== null && (
                        <span>{item.photos_taken} photos</span>
                      )}
                    </div>
                    {item.overall_condition && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Condition:</span>
                        <span className={`text-sm font-medium ${getConditionColor(item.overall_condition)}`}>
                          {item.overall_condition}
                        </span>
                      </div>
                    )}
                    {item.general_notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.general_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewCheckDetails(item.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};