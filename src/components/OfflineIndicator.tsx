import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, pendingActions } = useOfflineSync();

  if (isOnline && pendingActions === 0) return null;

  return (
    <div className={cn(
      "fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-300",
      !isOnline ? "animate-in slide-in-from-top" : "animate-out slide-out-to-top"
    )}>
      <Alert variant={isOnline ? "default" : "destructive"} className="shadow-lg border-2">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-success" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <AlertDescription className="font-medium">
            {isOnline ? (
              <span className="text-success">Back online. {pendingActions > 0 && `Syncing ${pendingActions} pending action${pendingActions > 1 ? 's' : ''}...`}</span>
            ) : (
              <span>You're offline. Changes will sync when connection is restored.</span>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
