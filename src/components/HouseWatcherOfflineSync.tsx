import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface OfflineData {
  id: string;
  type: 'check_session' | 'photo' | 'activity';
  data: any;
  timestamp: Date;
  synced: boolean;
}

export const HouseWatcherOfflineSync = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineMode) {
        syncPendingData();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data from localStorage
    loadPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingData = () => {
    try {
      const stored = localStorage.getItem('house_watcher_offline_data');
      if (stored) {
        const data = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setPendingData(data);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const savePendingData = (data: OfflineData[]) => {
    try {
      localStorage.setItem('house_watcher_offline_data', JSON.stringify(data));
      setPendingData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const addOfflineData = (type: OfflineData['type'], data: any) => {
    const newItem: OfflineData = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date(),
      synced: false
    };

    const updated = [...pendingData, newItem];
    savePendingData(updated);
    
    toast({
      title: "Data Saved Offline",
      description: "Your changes will sync when you're back online.",
      duration: 2000
    });
  };

  const syncPendingData = async () => {
    if (!isOnline || syncing || pendingData.length === 0) return;

    setSyncing(true);
    let successCount = 0;
    let failedItems: OfflineData[] = [];

    for (const item of pendingData.filter(d => !d.synced)) {
      try {
        switch (item.type) {
          case 'check_session':
            await syncCheckSession(item);
            break;
          case 'photo':
            await syncPhoto(item);
            break;
          case 'activity':
            await syncActivity(item);
            break;
        }
        successCount++;
      } catch (error) {
        console.error('Sync error for item:', item.id, error);
        failedItems.push(item);
      }
    }

    // Mark synced items
    const updated = pendingData.map(item => 
      failedItems.find(f => f.id === item.id) ? item : { ...item, synced: true }
    );
    
    savePendingData(updated);
    setSyncing(false);

    toast({
      title: "Sync Complete",
      description: `${successCount} items synced${failedItems.length > 0 ? `, ${failedItems.length} failed` : ''}`,
      variant: failedItems.length > 0 ? "destructive" : "default"
    });
  };

  const syncCheckSession = async (item: OfflineData) => {
    const { error } = await supabase
      .from('home_check_sessions')
      .upsert(item.data);
    
    if (error) throw error;
  };

  const syncPhoto = async (item: OfflineData) => {
    // Handle photo upload to storage
    const { photo_blob, filename, session_id } = item.data;
    
    if (photo_blob) {
      const { error } = await supabase.storage
        .from('property-images')
        .upload(`house-watching/${session_id}/${filename}`, photo_blob);
      
      if (error) throw error;
    }
  };

  const syncActivity = async (item: OfflineData) => {
    const { error } = await supabase
      .from('home_check_activities')
      .insert(item.data);
    
    if (error) throw error;
  };

  const clearSyncedData = () => {
    const unsyncedData = pendingData.filter(item => !item.synced);
    savePendingData(unsyncedData);
    
    toast({
      title: "Synced Data Cleared",
      description: "Successfully synced data has been removed from local storage."
    });
  };

  const forceSyncAll = async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to sync data.",
        variant: "destructive"
      });
      return;
    }

    await syncPendingData();
  };

  const pendingCount = pendingData.filter(item => !item.synced).length;
  const syncedCount = pendingData.filter(item => item.synced).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Offline Sync
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {!isOnline && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Data will be saved locally and synced when you reconnect.
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Offline Mode</div>
            <div className="text-sm text-muted-foreground">
              Continue working without internet
            </div>
          </div>
          <Switch 
            checked={offlineMode} 
            onCheckedChange={setOfflineMode}
          />
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Sync</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-green-600">{syncedCount}</div>
            <div className="text-sm text-muted-foreground">Synced</div>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={forceSyncAll}
            disabled={!isOnline || syncing || pendingCount === 0}
            className="flex-1"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Sync Now
          </Button>
          
          {syncedCount > 0 && (
            <Button 
              onClick={clearSyncedData}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Clear Synced
            </Button>
          )}
        </div>

        {/* Pending Items List */}
        {pendingData.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium">Pending Items:</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {pendingData.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 border rounded">
                  <span>{item.type.replace('_', ' ')}</span>
                  <Badge variant={item.synced ? "default" : "secondary"}>
                    {item.synced ? "Synced" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for offline functionality
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (type: string, data: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem('house_watcher_offline_data') || '[]');
      const newItem = {
        id: crypto.randomUUID(),
        type,
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      localStorage.setItem('house_watcher_offline_data', JSON.stringify([...existing, newItem]));
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  };

  return {
    isOnline,
    offlineMode,
    saveOfflineData
  };
};