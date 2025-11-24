import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface MessageAnalyticsData {
  totalMessages: number;
  totalConversations: number;
  activeUsers: number;
  avgResponseTime: number;
  totalReactions: number;
  totalMentions: number;
  searchQueries: number;
  templateUsage: number;
  messageVolumeByDay: Array<{ date: string; count: number }>;
  topParticipants: Array<{ name: string; count: number }>;
  responseTimeDistribution: Array<{ range: string; count: number }>;
  conversationActivity: Array<{ id: string; title: string; messageCount: number }>;
}

export const useMessageAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['message-analytics', days],
    queryFn: async (): Promise<MessageAnalyticsData> => {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Get total conversations
      const { count: totalConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Get reaction stats
      const { count: totalReactions } = await supabase
        .from('message_reactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Get mention stats
      const { count: totalMentions } = await supabase
        .from('message_mentions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Get search queries
      const { data: searchData } = await supabase
        .from('message_analytics')
        .select('*')
        .eq('event_type', 'search')
        .gte('created_at', startDate);

      // Get template usage
      const { count: templateUsage } = await supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true });

      // Get messages with sender info
      const { data: messages } = await supabase
        .from('messages')
        .select('id, sender_id, created_at, conversation_id')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      // Calculate active users
      const uniqueUsers = new Set(messages?.map(m => m.sender_id) || []);
      const activeUsers = uniqueUsers.size;

      // Calculate average response time
      let totalResponseTime = 0;
      let responseCount = 0;
      const conversationMessages = messages?.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
        acc[msg.conversation_id].push(msg);
        return acc;
      }, {} as Record<string, any[]>) || {};

      Object.values(conversationMessages).forEach((convMsgs) => {
        for (let i = 1; i < convMsgs.length; i++) {
          const prevTime = new Date(convMsgs[i - 1].created_at).getTime();
          const currTime = new Date(convMsgs[i].created_at).getTime();
          totalResponseTime += (currTime - prevTime) / 1000 / 60; // minutes
          responseCount++;
        }
      });

      const avgResponseTime = responseCount > 0 
        ? Math.round(totalResponseTime / responseCount) 
        : 0;

      // Message volume by day
      const messageVolumeByDay = Array.from({ length: days }, (_, i) => {
        const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
        const count = messages?.filter(m => m.created_at.startsWith(date)).length || 0;
        return { date: format(subDays(new Date(), days - 1 - i), 'MM/dd'), count };
      });

      // Top participants
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name');

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.user_id] = `${p.first_name} ${p.last_name}`;
        return acc;
      }, {} as Record<string, string>) || {};

      const participantCounts: Record<string, number> = {};
      messages?.forEach(msg => {
        participantCounts[msg.sender_id] = (participantCounts[msg.sender_id] || 0) + 1;
      });

      const topParticipants = Object.entries(participantCounts)
        .map(([id, count]) => ({ name: profileMap[id] || 'Unknown', count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Response time distribution
      const responseTimeDistribution = [
        { range: '< 5 min', count: 0 },
        { range: '5-30 min', count: 0 },
        { range: '30-60 min', count: 0 },
        { range: '1-24 hrs', count: 0 },
        { range: '> 24 hrs', count: 0 }
      ];

      Object.values(conversationMessages).forEach((convMsgs) => {
        for (let i = 1; i < convMsgs.length; i++) {
          const prevTime = new Date(convMsgs[i - 1].created_at).getTime();
          const currTime = new Date(convMsgs[i].created_at).getTime();
          const diffMinutes = (currTime - prevTime) / 1000 / 60;
          
          if (diffMinutes < 5) responseTimeDistribution[0].count++;
          else if (diffMinutes < 30) responseTimeDistribution[1].count++;
          else if (diffMinutes < 60) responseTimeDistribution[2].count++;
          else if (diffMinutes < 1440) responseTimeDistribution[3].count++;
          else responseTimeDistribution[4].count++;
        }
      });

      // Most active conversations
      const conversationActivity = Object.entries(conversationMessages)
        .map(([id, msgs]) => ({ id, messageCount: msgs.length }))
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5);

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, title')
        .in('id', conversationActivity.map(c => c.id));

      const conversationMap = conversations?.reduce((acc, c) => {
        acc[c.id] = c.title || 'Untitled';
        return acc;
      }, {} as Record<string, string>) || {};

      const conversationActivityWithTitles = conversationActivity.map(c => ({
        id: c.id,
        title: conversationMap[c.id] || 'Untitled',
        messageCount: c.messageCount
      }));

      return {
        totalMessages: totalMessages || 0,
        totalConversations: totalConversations || 0,
        activeUsers,
        avgResponseTime,
        totalReactions: totalReactions || 0,
        totalMentions: totalMentions || 0,
        searchQueries: searchData?.length || 0,
        templateUsage: templateUsage || 0,
        messageVolumeByDay,
        topParticipants,
        responseTimeDistribution,
        conversationActivity: conversationActivityWithTitles
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - prevent constant refetching
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false, // Only fetch once per mount
  });
};
