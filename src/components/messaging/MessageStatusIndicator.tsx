import React, { useEffect, useState } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageStatusIndicatorProps {
  messageId: string;
  senderId: string;
  currentUserId?: string;
}

type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  messageId,
  senderId,
  currentUserId
}) => {
  const [status, setStatus] = useState<DeliveryStatus>('sent');
  const [readCount, setReadCount] = useState(0);
  const [totalRecipients, setTotalRecipients] = useState(0);

  // Only show status for messages sent by current user
  if (senderId !== currentUserId) return null;

  useEffect(() => {
    fetchDeliveryStatus();

    // Subscribe to delivery updates
    const channel = supabase
      .channel(`delivery:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_deliveries',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          fetchDeliveryStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchDeliveryStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('message_deliveries')
        .select('read_at')
        .eq('message_id', messageId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setStatus('sent');
        return;
      }

      const readMessages = data.filter(d => d.read_at !== null);
      setReadCount(readMessages.length);
      setTotalRecipients(data.length);

      if (readMessages.length === data.length) {
        setStatus('read');
      } else if (readMessages.length > 0) {
        setStatus('delivered');
      } else {
        setStatus('delivered');
      }
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      setStatus('failed');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Message sent';
      case 'delivered':
        return `Delivered to ${totalRecipients} recipient${totalRecipients > 1 ? 's' : ''}`;
      case 'read':
        return `Read by ${readCount}/${totalRecipients} recipient${totalRecipients > 1 ? 's' : ''}`;
      case 'failed':
        return 'Failed to send';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            {getStatusIcon()}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
