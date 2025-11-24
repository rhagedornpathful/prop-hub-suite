import React, { useMemo } from 'react';
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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMessageAnalytics } from '@/hooks/useMessageAnalytics';
import { ResponseTimeMetrics } from './ResponseTimeMetrics';
import { ConversationActivityChart } from './ConversationActivityChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsMetric {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  description?: string;
}

const MessagingAnalyticsDashboardComponent: React.FC = () => {
  const { data: analytics, isLoading } = useMessageAnalytics(30);

  // Memoize metrics to prevent recalculation on every render
  const metrics: AnalyticsMetric[] = useMemo(() => [
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
      value: analytics?.avgResponseTime ? `${analytics.avgResponseTime} min` : 'N/A',
      icon: <Clock className="h-4 w-4" />,
      description: 'Average response time'
    }
  ], [analytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

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

      {analytics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Message Volume (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.messageVolumeByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <ResponseTimeMetrics 
              data={analytics.responseTimeDistribution}
              avgResponseTime={analytics.avgResponseTime}
            />
            <ConversationActivityChart 
              data={analytics.conversationActivity}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export const MessagingAnalyticsDashboard = React.memo(MessagingAnalyticsDashboardComponent);