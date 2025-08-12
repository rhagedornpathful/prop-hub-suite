import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  Users, 
  AlertTriangle, 
  MessageSquare,
  Phone,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Battery,
  Wifi,
  Signal,
  MapPin,
  DollarSign
} from 'lucide-react';
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { useTenants } from "@/hooks/queries/useTenants";
import { useConversations } from "@/hooks/queries/useConversations";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import MobileBottomNavigation from '@/components/mobile/MobileBottomNavigation';

const PropertyManagerPhoneDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch real data
  const { data: propertyMetrics, isLoading: metricsLoading } = usePropertyMetrics();
  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useMaintenanceRequests();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate operational metrics
  const totalProperties = propertyMetrics?.totalProperties || 0;
  const totalTenants = tenants.length;
  const monthlyRent = propertyMetrics?.totalRent || 0;
  
  // Critical alerts
  const urgentMaintenance = maintenanceRequests.filter(r => 
    r.priority === 'urgent' && r.status !== 'completed'
  );
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending');
  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  
  // Today's critical tasks
  const todaysTasks = [
    ...urgentMaintenance.slice(0, 3).map(r => ({
      id: r.id,
      type: 'urgent',
      title: r.title,
      property: r.property?.address || 'Unknown Property',
      priority: 'urgent',
      icon: AlertTriangle,
      action: () => navigate(`/maintenance/${r.id}`)
    })),
    ...pendingMaintenance.slice(0, 2).map(r => ({
      id: r.id,
      type: 'maintenance',
      title: r.title,
      property: r.property?.address || 'Unknown Property',
      priority: 'medium',
      icon: Wrench,
      action: () => navigate(`/maintenance/${r.id}`)
    }))
  ];

  const recentMessages = conversations.slice(0, 3).map(conv => ({
    id: conv.id,
    tenant: conv.title || 'Unknown',
    message: typeof conv.last_message === 'string' ? conv.last_message : 'No recent messages',
    time: conv.last_message_at ? format(new Date(conv.last_message_at), 'h:mm a') : '',
    unread: conv.unread_count || 0
  }));

  const isLoading = metricsLoading || maintenanceLoading || tenantsLoading || conversationsLoading;

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Contact",
      description: "Connecting to emergency service...",
    });
  };

  const handleQuickCall = () => {
    toast({
      title: "Calling Office",
      description: "Connecting to main office...",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="h-40 bg-muted rounded-2xl"></div>
        </div>
        <MobileBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Phone Status Bar Simulation */}
      <div className="bg-card px-4 py-2 flex items-center justify-between text-xs safe-area-pt">
        <div className="flex items-center gap-1">
          <span className="font-medium">{format(currentTime, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Field Manager</h1>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, 'EEEE, MMM dd')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-destructive">{urgentMaintenance.length}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Critical Alerts */}
        {(urgentMaintenance.length > 0 || unreadMessages > 0) && (
          <Card className="border-0 shadow-lg bg-gradient-warning text-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentMaintenance.length > 0 && (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Urgent Maintenance</span>
                    <Badge variant="secondary" className="bg-destructive text-white">
                      {urgentMaintenance.length}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => navigate('/maintenance')}
                    className="w-full bg-white text-destructive hover:bg-white/90 font-semibold rounded-xl min-h-[48px]"
                  >
                    <Wrench className="h-5 w-5 mr-2" />
                    Handle Now
                  </Button>
                </div>
              )}
              
              {unreadMessages > 0 && (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Tenant Messages</span>
                    <Badge variant="secondary" className="bg-primary text-white">
                      {unreadMessages}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => navigate('/messages')}
                    className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-xl min-h-[48px]"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Respond
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-gradient-primary text-white">
            <CardContent className="p-4 text-center">
              <Building className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalProperties}</div>
              <div className="text-sm opacity-90">Properties</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-secondary text-white">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalTenants}</div>
              <div className="text-sm opacity-90">Tenants</div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency & Quick Actions */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Emergency & Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="destructive" 
                className="h-20 flex flex-col gap-2 rounded-xl font-semibold"
                onClick={handleEmergencyCall}
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm">Emergency</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={handleQuickCall}
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm font-medium">Call Office</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Priority Tasks */}
        {todaysTasks.length > 0 && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysTasks.slice(0, 4).map((task) => {
                  const Icon = task.icon;
                  return (
                    <div 
                      key={task.id} 
                      className="p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={task.action}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          task.priority === 'urgent' 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">{task.property}</p>
                        </div>
                        <Badge 
                          variant={task.priority === 'urgent' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Messages
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/messages')}
                  className="text-primary"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => navigate('/messages')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{msg.tenant}</h4>
                          {msg.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {msg.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {msg.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Field Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 rounded-xl"
                onClick={() => navigate('/maintenance')}
              >
                <Wrench className="h-5 w-5" />
                <span className="text-xs font-medium">Maintenance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 rounded-xl"
                onClick={() => navigate('/property-check')}
              >
                <Building className="h-5 w-5" />
                <span className="text-xs font-medium">Property Check</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 rounded-xl"
                onClick={() => navigate('/tenants')}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">Tenants</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 rounded-xl"
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(() => {
                      toast({
                        title: "Location verified",
                        description: "GPS location confirmed"
                      });
                    });
                  }
                }}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-medium">GPS Check</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileBottomNavigation />
    </div>
  );
};

export default PropertyManagerPhoneDashboard;