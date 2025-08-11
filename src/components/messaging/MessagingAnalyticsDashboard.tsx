import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock,
  Search,
  Heart,
  AtSign,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AnalyticsMetric {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  description?: string;
}

export const MessagingAnalyticsDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['messaging-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      // Get message volume
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Get conversation count
      const { count: totalConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Get reaction stats
      const { count: totalReactions } = await supabase
        .from('message_reactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Get mention stats
      const { count: totalMentions } = await supabase
        .from('message_mentions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Get search queries
      const { data: searchQueries } = await supabase
        .from('message_analytics')
        .select('*')
        .eq('event_type', 'search')
        .gte('created_at', thirtyDaysAgo);

      // Get template usage
      const { count: templateUsage } = await supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true });

      // Calculate active users
      const { data: activeUsers } = await supabase
        .from('messages')
        .select('sender_id')
        .gte('created_at', thirtyDaysAgo);

      const uniqueActiveUsers = new Set(activeUsers?.map(m => m.sender_id)).size;

      return {
        totalMessages: totalMessages || 0,
        totalConversations: totalConversations || 0,
        totalReactions: totalReactions || 0,
        totalMentions: totalMentions || 0,
        searchQueries: searchQueries?.length || 0,
        templateUsage: templateUsage || 0,
        activeUsers: uniqueActiveUsers
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const metrics: AnalyticsMetric[] = [
    {
      title: 'Total Messages',
      value: analytics?.totalMessages || 0,
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Messages sent in last 30 days'
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers || 0,
      icon: <Users className="h-4 w-4" />,
      description: 'Users who sent messages'
    },
    {
      title: 'Conversations',
      value: analytics?.totalConversations || 0,
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'New conversations started'
    },
    {
      title: 'Reactions',
      value: analytics?.totalReactions || 0,
      icon: <Heart className="h-4 w-4" />,
      description: 'Message reactions added'
    },
    {
      title: 'Mentions',
      value: analytics?.totalMentions || 0,
      icon: <AtSign className="h-4 w-4" />,
      description: 'User mentions in messages'
    },
    {
      title: 'Search Queries',
      value: analytics?.searchQueries || 0,
      icon: <Search className="h-4 w-4" />,
      description: 'Message searches performed'
    },
    {
      title: 'Templates',
      value: analytics?.templateUsage || 0,
      icon: <FileText className="h-4 w-4" />,
      description: 'Active message templates'
    },
    {
      title: 'Avg Response Time',
      value: '2.3h',
      icon: <Clock className="h-4 w-4" />,
      description: 'Average response time'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messaging Analytics</h2>
          <p className="text-muted-foreground">
            Performance metrics for the last 30 days
          </p>
        </div>
        <Badge variant="outline">Last 30 Days</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.description && (
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              )}
              {metric.change && (
                <div className="flex items-center pt-1">
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Most active conversation</span>
              <Badge variant="outline">Property Discussion</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Most used template</span>
              <Badge variant="outline">Maintenance Follow-up</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Peak messaging hours</span>
              <Badge variant="outline">2-4 PM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};