import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Star, 
  Archive, 
  Building, 
  Users, 
  Wrench, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

interface InboxStatsProps {
  totalConversations: number;
  unreadCount: number;
  priorityCount: number;
  responseTime: string;
}

export const InboxStats: React.FC<InboxStatsProps> = ({
  totalConversations,
  unreadCount,
  priorityCount,
  responseTime
}) => {
  const stats = [
    {
      title: 'Unread Messages',
      value: unreadCount,
      subtitle: 'Requires attention',
      icon: MessageCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: unreadCount > 0 ? '+2 from yesterday' : 'All caught up'
    },
    {
      title: 'Active Conversations',
      value: totalConversations,
      subtitle: 'Total threads',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${Math.max(0, totalConversations - 5)} new this week`
    },
    {
      title: 'High Priority',
      value: priorityCount,
      subtitle: 'Urgent items',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: priorityCount > 0 ? 'Needs immediate attention' : 'No urgent items'
    },
    {
      title: 'Avg Response Time',
      value: responseTime,
      subtitle: 'Business hours',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '15% faster than last month'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};