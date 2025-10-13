import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConnectionStatus as Status } from '@/hooks/useRealtimeConnection';

interface ConnectionStatusProps {
  status: Status;
  reconnectAttempts?: number;
  onReconnect?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  reconnectAttempts = 0,
  onReconnect,
}) => {
  if (status === 'connected') {
    return (
      <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Connected</span>
      </Badge>
    );
  }

  if (status === 'connecting') {
    return (
      <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Connecting...</span>
      </Badge>
    );
  }

  if (status === 'error' || status === 'disconnected') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1 cursor-pointer hover:bg-red-100",
          "bg-red-50 text-red-700 border-red-200"
        )}
        onClick={onReconnect}
      >
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">
          {reconnectAttempts > 0 
            ? `Reconnecting (${reconnectAttempts})...` 
            : 'Disconnected - Click to reconnect'}
        </span>
      </Badge>
    );
  }

  return null;
};
