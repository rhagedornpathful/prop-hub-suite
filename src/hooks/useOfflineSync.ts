import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingActions = () => {
    try {
      const saved = localStorage.getItem('offline-actions');
      if (saved) {
        setPendingActions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('offline-actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const addPendingAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setPendingActions(prev => {
      const updated = [...prev, action];
      savePendingActions(updated);
      return updated;
    });

    return action.id;
  }, []);

  const removePendingAction = useCallback((id: string) => {
    setPendingActions(prev => {
      const updated = prev.filter(action => action.id !== id);
      savePendingActions(updated);
      return updated;
    });
  }, []);

  const processPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    for (const action of pendingActions) {
      try {
        // Process the action based on type
        await processAction(action);
        removePendingAction(action.id);
      } catch (error) {
        console.error('Error processing offline action:', error);
        
        // Increment retry count
        setPendingActions(prev => {
          const updated = prev.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 }
              : a
          );
          savePendingActions(updated);
          return updated;
        });

        // Remove action if too many retries
        if (action.retryCount >= 3) {
          removePendingAction(action.id);
        }
      }
    }
  }, [isOnline, pendingActions, removePendingAction]);

  const processAction = async (action: OfflineAction) => {
    // This would be implemented based on your specific actions
    switch (action.type) {
      case 'CREATE_MAINTENANCE_REQUEST':
        // Implementation for creating maintenance request
        break;
      case 'UPDATE_PROPERTY':
        // Implementation for updating property
        break;
      case 'SEND_MESSAGE':
        // Implementation for sending message
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  // Cache critical data for offline access
  const cacheForOffline = useCallback(async (queryKeys: string[][]) => {
    for (const queryKey of queryKeys) {
      try {
        const data = queryClient.getQueryData(queryKey);
        if (data) {
          localStorage.setItem(`cache-${queryKey.join('-')}`, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error caching data:', error);
      }
    }
  }, [queryClient]);

  const getCachedData = useCallback((queryKey: string[]) => {
    try {
      const cached = localStorage.getItem(`cache-${queryKey.join('-')}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }, []);

  return {
    isOnline,
    pendingActions: pendingActions.length,
    addPendingAction,
    cacheForOffline,
    getCachedData,
    processPendingActions,
  };
}