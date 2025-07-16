import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserCheck,
  Home,
  Tag,
  FileText,
  TrendingUp,
  Clock,
  ArrowLeft,
  Activity,
  Wrench,
  Receipt,
  Lock,
  CheckCircle,
  AlertCircle,
  DollarSign as PaymentIcon,
  GitBranch
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { ScheduleMaintenanceDialog } from "@/components/ScheduleMaintenanceDialog";
import { PropertyCheckDetailsDialog } from "@/components/PropertyCheckDetailsDialog";
import { usePropertyActivity } from "@/hooks/usePropertyActivity";

type Property = Tables<'properties'>;
type MaintenanceRequest = Tables<'maintenance_requests'>;
type PropertyCheckSession = Tables<'property_check_sessions'>;

interface RecentActivity {
  id: string;
  type: 'maintenance' | 'inspection';
  title: string;
  date: string;
}

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isPropertyCheckDialogOpen, setIsPropertyCheckDialogOpen] = useState(false);
  const [selectedCheckSessionId, setSelectedCheckSessionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use the new comprehensive activity hook
  const { activities, isLoading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = usePropertyActivity(id);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchMaintenanceRequests();
      fetchRecentActivities();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMaintenanceRequests(data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('id, title, created_at')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (maintenanceError) throw maintenanceError;

      // Fetch property check sessions
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('property_check_sessions')
        .select('id, created_at, status')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (inspectionError) throw inspectionError;

      // Add maintenance requests to activities
      if (maintenanceData) {
        activities.push(...maintenanceData.map(item => ({
          id: item.id,
          type: 'maintenance' as const,
          title: item.title,
          date: item.created_at
        })));
      }

      // Add property inspections to activities
      if (inspectionData) {
        activities.push(...inspectionData.map(item => ({
          id: item.id,
          type: 'inspection' as const,
          title: `Property Inspection - ${item.status}`,
          date: item.created_at
        })));
      }

      // Sort by date and take top 3
      const sortedActivities = activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const handleDelete = () => {
    toast({
      title: "Delete Property",
      description: "Delete functionality coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground",
    inactive: "bg-muted text-muted-foreground",
  };

  const statusText = {
    active: "Active",
    vacant: "Vacant", 
    maintenance: "Under Maintenance",
    inactive: "Inactive",
  };

  const getDisplayAddress = () => {
    const parts = [property.street_address || property.address, property.city, property.state, property.zip_code].filter(Boolean);
    return parts.join(', ');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not set';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="ghost" onClick={() => navigate('/properties')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <h1 className="text-3xl font-bold">{property.address}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{getDisplayAddress()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[property.status as keyof typeof statusColors] || statusColors.inactive}>
            {statusText[property.status as keyof typeof statusText] || property.status}
          </Badge>
          <Badge className="bg-primary text-primary-foreground">
            <Building className="h-3 w-3 mr-1" />
            {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
          </Badge>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-medium">Recent Activity</span>
            </div>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setActiveTab("activity")}
                    className="block w-full text-left text-sm hover:bg-muted/50 p-2 rounded transition-colors"
                  >
                    <div className="font-medium truncate">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.type === 'maintenance' ? 'Maintenance' : 'Inspection'} • {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {property.estimated_value && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="font-medium">Property Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(property.estimated_value)}</p>
              <p className="text-sm text-muted-foreground">Estimated market value</p>
            </CardContent>
          </Card>
        )}
        
        {property.rent_estimate && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Home className="h-6 w-6 text-warning" />
                <span className="font-medium">Rent Estimate</span>
              </div>
              <p className="text-2xl font-bold text-warning">{formatCurrency(property.rent_estimate)}</p>
              <p className="text-sm text-muted-foreground">Market rental estimate</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-success" />
              <span className="font-medium">Monthly Income</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(property.monthly_rent)}</p>
            <p className="text-sm text-muted-foreground">
              {property.service_type === 'house_watching' ? 'Service fee' : 'Rental income'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Financials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Image */}
            <Card>
              <CardContent className="p-6">
                <div className="relative rounded-lg overflow-hidden bg-gradient-subtle border mb-4">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.address}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center">
                        <Building className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Property Specs */}
                {(property.bedrooms || property.bathrooms || property.square_feet) && (
                  <div className="grid grid-cols-3 gap-3">
                    {property.bedrooms && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Bed className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Bath className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                      </div>
                    )}
                    {property.square_feet && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Square className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.square_feet.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Sq Ft</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-md">
                          <Home className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                          <p className="text-lg font-semibold capitalize text-foreground">
                            {property.property_type?.replace('_', ' ') || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-green-100 rounded-md">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                          <p className="text-lg font-semibold capitalize text-foreground">
                            {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {property.year_built && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-purple-100 rounded-md">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Year Built</label>
                            <p className="text-lg font-semibold text-foreground">{property.year_built}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {property.square_feet && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-orange-100 rounded-md">
                            <Square className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Square Footage</label>
                            <p className="text-lg font-semibold text-foreground">
                              {property.square_feet.toLocaleString()} sq ft
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {property.gate_code && (
                      <div className="space-y-3 md:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-red-100 rounded-md">
                            <Lock className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Gate Access Code</label>
                            <p className="text-lg font-semibold font-mono bg-muted px-3 py-1.5 rounded-md inline-block">
                              {property.gate_code}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {property.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{property.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Property Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activitiesError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-medium">Error loading activities</p>
                  <p className="text-muted-foreground text-sm mb-4">{activitiesError}</p>
                  <Button onClick={refetchActivities} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Activities like maintenance requests, property checks, and payments will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case 'maintenance':
                          return <Wrench className="h-5 w-5 text-orange-600" />;
                        case 'property_check':
                          return <CheckCircle className="h-5 w-5 text-blue-600" />;
                        case 'payment':
                          return <PaymentIcon className="h-5 w-5 text-green-600" />;
                        case 'status_change':
                          return <GitBranch className="h-5 w-5 text-purple-600" />;
                        default:
                          return <Activity className="h-5 w-5 text-muted-foreground" />;
                      }
                    };

                    const getActivityColor = () => {
                      switch (activity.type) {
                        case 'maintenance':
                          return 'bg-orange-50 border-orange-200';
                        case 'property_check':
                          return 'bg-blue-50 border-blue-200';
                        case 'payment':
                          return 'bg-green-50 border-green-200';
                        case 'status_change':
                          return 'bg-purple-50 border-purple-200';
                        default:
                          return 'bg-muted/50 border-muted';
                      }
                    };

                    const getActivityType = () => {
                      switch (activity.type) {
                        case 'maintenance':
                          return 'Maintenance';
                        case 'property_check':
                          return 'Property Check';
                        case 'payment':
                          return 'Payment';
                        case 'status_change':
                          return 'Status Change';
                        default:
                          return 'Activity';
                      }
                    };

                    const isClickable = activity.type === 'property_check';
                    
                    const handleActivityClick = () => {
                      if (activity.type === 'property_check') {
                        setSelectedCheckSessionId(activity.id);
                        setIsPropertyCheckDialogOpen(true);
                      }
                    };

                    return (
                      <div 
                        key={activity.id} 
                        className={`border rounded-lg p-4 ${getActivityColor()} ${isClickable ? 'cursor-pointer hover:bg-opacity-80 transition-colors' : ''}`}
                        onClick={handleActivityClick}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-background rounded-lg border">
                            {getActivityIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground truncate">{activity.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getActivityType()}
                              </Badge>
                              {activity.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {activity.status}
                                </Badge>
                              )}
                              {isClickable && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                                  Click to view report
                                </Badge>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.type === 'maintenance' && activity.metadata?.scheduled_date && activity.metadata.scheduled_date !== activity.metadata.created_at ? (
                                  <span className="text-primary font-medium">
                                    Scheduled: {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                ) : (
                                  <span>
                                    {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </span>
                              {activity.amount && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(activity.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activities.length > 0 && (
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {activities.length} activities • Most recent first
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-5 bg-muted rounded animate-pulse w-1/3"></div>
                        <div className="h-5 bg-muted rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : maintenanceRequests.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{request.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={
                              request.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                              request.status === 'in-progress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              request.status === 'completed' ? 'bg-green-50 text-green-800 border-green-200' :
                              request.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                              'bg-muted text-muted-foreground'
                            }
                          >
                            {request.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {request.scheduled_date && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {request.estimated_cost && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>Estimated: {formatCurrency(request.estimated_cost)}</span>
                            </div>
                          )}
                          {request.actual_cost && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Receipt className="h-3 w-3" />
                              <span>Actual: {formatCurrency(request.actual_cost)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {request.contractor_name && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{request.contractor_name}</span>
                            {request.contractor_contact && (
                              <span className="text-sm text-muted-foreground">• {request.contractor_contact}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {maintenanceRequests.length} maintenance requests • Most recent first
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No maintenance requests found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first maintenance request to get started
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsMaintenanceDialogOpen(true)}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Create Maintenance Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Income</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Rent:</span>
                      <span className="font-semibold">{formatCurrency(property.monthly_rent)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Property Value</h4>
                  <div className="space-y-2">
                    {property.estimated_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Value:</span>
                        <span className="font-semibold">{formatCurrency(property.estimated_value)}</span>
                      </div>
                    )}
                    {property.rent_estimate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent Estimate:</span>
                        <span className="font-semibold">{formatCurrency(property.rent_estimate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editProperty={property}
        mode="edit"
        onPropertyAdded={() => {
          setIsEditDialogOpen(false);
          fetchPropertyDetails();
        }}
      />

      <ScheduleMaintenanceDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        propertyId={id}
        onMaintenanceScheduled={() => {
          fetchMaintenanceRequests();
          refetchActivities();
        }}
      />
      
      <PropertyCheckDetailsDialog
        open={isPropertyCheckDialogOpen}
        onOpenChange={setIsPropertyCheckDialogOpen}
        checkSessionId={selectedCheckSessionId}
      />
    </div>
  );
}

export default PropertyDetail;