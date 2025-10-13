import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { InboxConversation, InboxMessage } from '@/hooks/queries/useInbox';
import { ExportConversation } from './ExportConversation';
import { PrintConversation } from './PrintConversation';

interface ConversationInsightsProps {
  conversations: InboxConversation[];
  messages: InboxMessage[];
}

export const ConversationInsights = ({ conversations, messages }: ConversationInsightsProps) => {
  // Calculate average response time
  const calculateAvgResponseTime = () => {
    const times: number[] = [];
    messages.forEach((msg, idx) => {
      if (idx > 0) {
        const prevTime = new Date(messages[idx - 1].created_at).getTime();
        const currTime = new Date(msg.created_at).getTime();
        times.push((currTime - prevTime) / 1000 / 60); // minutes
      }
    });
    const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    return Math.round(avg);
  };

  // Message volume by day
  const getMessageVolumeData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = messages.filter(m => m.created_at.startsWith(date)).length;
      return { date: date.slice(5), count };
    });
  };

  // Participant activity
  const getParticipantActivity = () => {
    const activity: Record<string, number> = {};
    messages.forEach(msg => {
      activity[msg.sender_name] = (activity[msg.sender_name] || 0) + 1;
    });
    return Object.entries(activity)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const avgResponseTime = calculateAvgResponseTime();
  const messageVolumeData = getMessageVolumeData();
  const participantData = getParticipantActivity();
  const totalMessages = messages.length;
  const activeConversations = conversations.filter(c => !c.is_archived).length;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conversation Insights</h2>
        {conversations.length > 0 && (
          <div className="flex gap-2">
            <ExportConversation 
              conversationId={conversations[0].id}
              conversationTitle={conversations[0].title || 'Conversation'}
            />
            <PrintConversation 
              conversationId={conversations[0].id}
              conversationTitle={conversations[0].title || 'Conversation'}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime} min</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConversations}</div>
            <p className="text-xs text-muted-foreground">Not archived</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantData.length}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Message Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={messageVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
