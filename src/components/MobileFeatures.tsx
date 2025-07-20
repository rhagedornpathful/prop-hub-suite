import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

export const MobileFeatures: React.FC = () => {
  const {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  } = usePushNotifications();

  const {
    isOnline,
    pendingActions,
    cacheForOffline,
    processPendingActions,
  } = useOfflineSync();

  const handleEnableNotifications = async () => {
    try {
      await requestPermission();
      if (permission === 'granted') {
        await subscribe();
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await unsubscribe();
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await showNotification({
        title: 'Test Notification',
        body: 'This is a test notification from PropHub Suite',
        tag: 'test',
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Failed to show notification:', error);
      toast.error('Failed to show notification');
    }
  };

  const handleCacheData = async () => {
    try {
      await cacheForOffline([
        ['properties'],
        ['maintenance-requests'],
        ['tenants'],
        ['messages']
      ]);
      toast.success('Critical data cached for offline access');
    } catch (error) {
      console.error('Failed to cache data:', error);
      toast.error('Failed to cache data');
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Not Set</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Progressive Web App Status</span>
          </CardTitle>
          <CardDescription>
            Install PropHub Suite as a mobile app for better performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Service Worker</div>
              <Badge variant={isSupported ? "secondary" : "outline"}>
                {isSupported ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div>
              <div className="font-medium">Offline Ready</div>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>
            Get instant alerts for urgent maintenance requests and messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Permission Status</div>
              {getPermissionBadge()}
            </div>
            <div className="space-y-1">
              <div className="font-medium">Subscription</div>
              <Badge variant={isSubscribed ? "secondary" : "outline"}>
                {isSubscribed ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex space-x-2">
            {!isSubscribed ? (
              <Button onClick={handleEnableNotifications} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            ) : (
              <Button onClick={handleDisableNotifications} variant="outline" size="sm">
                <BellOff className="h-4 w-4 mr-2" />
                Disable Notifications
              </Button>
            )}
            
            {isSubscribed && (
              <Button onClick={handleTestNotification} variant="outline" size="sm">
                Test Notification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span>Offline Support</span>
          </CardTitle>
          <CardDescription>
            Access cached data and sync when back online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Connection Status</div>
              <Badge variant={isOnline ? "secondary" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div>
              <div className="font-medium">Pending Actions</div>
              <Badge variant={pendingActions > 0 ? "secondary" : "outline"}>
                {pendingActions} queued
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex space-x-2">
            <Button onClick={handleCacheData} variant="outline" size="sm">
              Cache Critical Data
            </Button>
            {pendingActions > 0 && (
              <Button onClick={processPendingActions} size="sm">
                Sync Pending ({pendingActions})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};