import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Users,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Globe,
  Filter,
  MoreHorizontal,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'maintenance' | 'approval' | 'system' | 'tenant' | 'financial';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  relatedId?: string;
  userId: string;
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
}

interface NotificationRule {
  id: string;
  type: string;
  condition: string;
  channels: string[];
  enabled: boolean;
  priority: string;
}

const RealTimeNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    email: true,
    sms: false,
    doNotDisturb: false,
    quietHours: { start: '22:00', end: '07:00' }
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "maintenance",
      title: "Urgent Repair Request",
      message: "HVAC system failure in Unit 3A - tenant reports no heating",
      priority: "urgent",
      timestamp: new Date().toISOString(),
      read: false,
      actionRequired: true,
      relatedId: "maint-001",
      userId: "user-1",
      channels: ['email', 'sms', 'push', 'inApp']
    },
    {
      id: "2",
      type: "approval",
      title: "Expense Approval Required",
      message: "Landscaping service invoice for $850 requires owner approval",
      priority: "medium",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      actionRequired: true,
      relatedId: "approval-002",
      userId: "user-1",
      channels: ['email', 'inApp']
    },
    {
      id: "3",
      type: "tenant",
      title: "New Tenant Application",
      message: "Sarah Johnson submitted application for Unit 2B",
      priority: "medium",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionRequired: true,
      relatedId: "tenant-003",
      userId: "user-1",
      channels: ['email', 'inApp']
    },
    {
      id: "4",
      type: "system",
      title: "Maintenance Scheduled",
      message: "HVAC inspection scheduled for Building A - January 15th",
      priority: "low",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionRequired: false,
      userId: "user-1",
      channels: ['inApp']
    },
    {
      id: "5",
      type: "financial",
      title: "Monthly Report Ready",
      message: "December financial report is available for review",
      priority: "low",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionRequired: false,
      userId: "user-1",
      channels: ['email', 'inApp']
    }
  ];

  const notificationRules: NotificationRule[] = [
    {
      id: "1",
      type: "maintenance",
      condition: "priority >= urgent",
      channels: ['email', 'sms', 'push'],
      enabled: true,
      priority: "urgent"
    },
    {
      id: "2",
      type: "approval",
      condition: "amount > 500",
      channels: ['email', 'push'],
      enabled: true,
      priority: "medium"
    },
    {
      id: "3",
      type: "tenant",
      condition: "new_application",
      channels: ['email'],
      enabled: true,
      priority: "medium"
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['maintenance', 'approval', 'system', 'tenant'][Math.floor(Math.random() * 4)] as any,
          title: "New Notification",
          message: "This is a simulated real-time notification",
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: Math.random() > 0.5,
          userId: "user-1",
          channels: ['inApp']
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        if (notificationSettings.enabled) {
          toast(newNotification.title, {
            description: newNotification.message,
          });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [notificationSettings.enabled]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance": return <Settings className="w-4 h-4" />;
      case "approval": return <CheckCircle className="w-4 h-4" />;
      case "system": return <Globe className="w-4 h-4" />;
      case "tenant": return <Users className="w-4 h-4" />;
      case "financial": return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilters.length === 0) return true;
    return activeFilters.includes(notification.type) || activeFilters.includes(notification.priority);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Real-Time Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage notifications, alerts, and communication preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              >
                {notificationSettings.enabled ? (
                  <Bell className="w-4 h-4 mr-2" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-2" />
                )}
                {notificationSettings.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilters.includes('urgent') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilters(prev =>
                    prev.includes('urgent')
                      ? prev.filter(f => f !== 'urgent')
                      : [...prev, 'urgent']
                  )}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </Button>
                <Button
                  variant={activeFilters.includes('maintenance') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilters(prev =>
                    prev.includes('maintenance')
                      ? prev.filter(f => f !== 'maintenance')
                      : [...prev, 'maintenance']
                  )}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Maintenance
                </Button>
                <Button
                  variant={activeFilters.includes('approval') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilters(prev =>
                    prev.includes('approval')
                      ? prev.filter(f => f !== 'approval')
                      : [...prev, 'approval']
                  )}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approvals
                </Button>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilters([])}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No notifications match your filters</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${
                        !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                                  {notification.title}
                                </h4>
                                <Badge className={`${getPriorityColor(notification.priority)} border text-xs`}>
                                  {notification.priority}
                                </Badge>
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{format(new Date(notification.timestamp), "MMM dd, h:mm a")}</span>
                                <div className="flex items-center gap-1">
                                  {notification.channels.includes('email') && <Mail className="w-3 h-3" />}
                                  {notification.channels.includes('sms') && <Smartphone className="w-3 h-3" />}
                                  {notification.channels.includes('push') && <Bell className="w-3 h-3" />}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {notification.actionRequired && (
                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <Button size="sm">
                              Take Action
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Notifications</Label>
                        <p className="text-xs text-muted-foreground">Master toggle for all notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, enabled: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound Notifications</Label>
                        <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sound}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, sound: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Desktop Notifications</Label>
                        <p className="text-xs text-muted-foreground">Show browser notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.desktop}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, desktop: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive urgent notifications via SMS</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Do Not Disturb</Label>
                        <p className="text-xs text-muted-foreground">Silence non-urgent notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.doNotDisturb}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, doNotDisturb: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Rules</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure automated notification rules based on conditions
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notificationRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold capitalize">{rule.type} Notifications</h4>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{rule.priority}</Badge>
                            <div className="flex gap-1">
                              {rule.channels.map((channel) => (
                                <Badge key={channel} variant="secondary" className="text-xs">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Switch checked={rule.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeNotificationSystem;