import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  Shield,
  Bed,
  Bath,
  Square,
  FileText,
  TrendingUp,
  Clock,
  ArrowLeft,
  Activity,
  Wrench,
  Lock,
  CheckCircle,
  AlertCircle,
  Camera,
  MoreHorizontal,
  ClipboardCheck,
  Home,
  UserCircle2
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { ScheduleMaintenanceDialog } from "@/components/ScheduleMaintenanceDialog";
import { PropertyCheckDetailsDialog } from "@/components/PropertyCheckDetailsDialog";
import MaintenanceDetailsDialog from "@/components/MaintenanceDetailsDialog";
import { usePropertyActivity } from "@/hooks/usePropertyActivity";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { PropertyDetailsSkeleton } from "@/components/PropertyDetailsSkeleton";
import { PropertyAssignees } from "@/components/PropertyAssignees";

type Property = Tables<'properties'>;

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
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { isMobile } = useMobileDetection();
  const [property, setProperty] = useState<Property | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<Tables<'maintenance_requests'>[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isPropertyCheckDialogOpen, setIsPropertyCheckDialogOpen] = useState(false);
  const [selectedCheckSessionId, setSelectedCheckSessionId] = useState<string>("");
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState<Tables<'maintenance_requests'> | null>(null);
  const [isMaintenanceDetailsDialogOpen, setIsMaintenanceDetailsDialogOpen] = useState(false);
  const [isStartingCheck, setIsStartingCheck] = useState(false);
  
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

  const startPropertyCheck = async () => {
    if (!id || !user?.id) return;
    
    try {
      setIsStartingCheck(true);
      const { data, error } = await supabase
        .from('property_check_sessions')
        .insert({
          property_id: id,
          user_id: user.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Property Check Started",
        description: "You can now begin documenting your property inspection.",
      });

      // Navigate to the property check page
      navigate(`/property-check/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error Starting Check",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsStartingCheck(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`${isMobile ? 'px-4 py-6' : 'container mx-auto p-6'}`}>
        <PropertyDetailsSkeleton />
      </div>
    );
  }

  if (!property) {
    return (
      <div className={`${isMobile ? 'px-4 py-6' : 'container mx-auto p-6'}`}>
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
    <div className={`${isMobile ? 'pb-20' : ''}`}>
      {/* Mobile Header */}
      {isMobile ? (
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/properties')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate flex-1 mx-3 text-ellipsis overflow-hidden">
              {property.address}
            </h1>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </header>
      ) : (
        /* Desktop Header */
        <div className="container mx-auto p-6">
          <div className="flex items-start justify-between mb-8">
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
              <Badge className={property.service_type === 'house_watching' ? 'bg-teal-500 text-white' : 'bg-primary text-primary-foreground'}>
                <Building className="h-3 w-3 mr-1" />
                {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Section (Mobile Only) */}
      {isMobile && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="min-h-[80px] h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 active:scale-[0.98] transition-transform touch-manipulation"
              onClick={() => {
                // TODO: Implement camera capture functionality
                toast({
                  title: "Add Photo",
                  description: "Camera functionality coming soon",
                });
              }}
            >
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Add Photo</span>
            </Button>
            
            <Button
              variant="outline"
              className="min-h-[80px] h-20 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 active:scale-[0.98] transition-transform touch-manipulation"
              onClick={startPropertyCheck}
              disabled={isStartingCheck}
            >
              <ClipboardCheck className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">
                {isStartingCheck ? 'Starting...' : 'Complete Check'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="min-h-[80px] h-20 flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 active:scale-[0.98] transition-transform touch-manipulation"
              onClick={() => setIsMaintenanceDialogOpen(true)}
            >
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium">Report Issue</span>
            </Button>
            
            <Button
              variant="outline"
              className="min-h-[80px] h-20 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 active:scale-[0.98] transition-transform touch-manipulation"
              onClick={() => navigate('/documents')}
            >
              <FileText className="h-6 w-6 text-gray-600" />
              <span className="text-sm font-medium">View Documents</span>
            </Button>
          </div>
        </div>
      )}

      <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'} space-y-4`}>
        {/* Main Content */}
        <Accordion type="multiple" defaultValue={["overview","assignees","activity","maintenance"]} className="space-y-4">
          <AccordionItem value="overview" className="bg-white rounded-lg shadow-sm border-0 p-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Property Overview</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {/* Property Image */}
                <div className="relative rounded-lg overflow-hidden bg-gradient-subtle border">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.address}
                      className="w-full h-auto max-h-64 lg:max-h-80 object-contain bg-muted"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 1024px"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Property Details */}
                <div className="grid grid-cols-2 gap-3">
                  {property.bedrooms && (
                    <div className="bg-muted px-3 py-2 rounded-lg text-center">
                      <Bed className="h-4 w-4 mx-auto mb-1" />
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-xs text-muted-foreground">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="bg-muted px-3 py-2 rounded-lg text-center">
                      <Bath className="h-4 w-4 mx-auto mb-1" />
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-xs text-muted-foreground">Bathrooms</div>
                    </div>
                  )}
                  {property.square_feet && (
                    <div className="bg-muted px-3 py-2 rounded-lg text-center col-span-2">
                      <Square className="h-4 w-4 mx-auto mb-1" />
                      <div className="font-semibold">{property.square_feet.toLocaleString()} sq ft</div>
                      <div className="text-xs text-muted-foreground">Square Footage</div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">Service Type: </span>
                      <span className="text-sm">
                        {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
                      </span>
                    </div>
                  </div>
                  
                  {property.monthly_rent && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-success" />
                      <div>
                        <span className="text-sm font-medium">Monthly Income: </span>
                        <span className="text-sm font-bold text-success">{formatCurrency(property.monthly_rent)}</span>
                      </div>
                    </div>
                  )}

                  {property.gate_code && (
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-red-600" />
                      <div>
                        <span className="text-sm font-medium">Gate Code: </span>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{property.gate_code}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="assignees" className="bg-white rounded-lg shadow-sm border-0 p-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5" />
                <span className="font-semibold">Assignees</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <PropertyAssignees propertyId={property.id} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="activity" className="bg-white rounded-lg shadow-sm border-0 p-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <span className="font-semibold">Recent Activity</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {activitiesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded animate-pulse"></div>
                        <div className="h-2 bg-muted rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-background rounded-lg border">
                        {activity.type === 'maintenance' ? (
                          <Wrench className="h-4 w-4 text-orange-600" />
                        ) : activity.type === 'property_check' ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="maintenance" className="bg-white rounded-lg shadow-sm border-0 p-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                <span className="font-semibold">Maintenance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-6">
                  <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No maintenance requests</p>
                  <Button 
                    onClick={() => setIsMaintenanceDialogOpen(true)} 
                    className="mt-3"
                    size="sm"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate">{request.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Dialogs */}
      <ScheduleMaintenanceDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        propertyId={id || ""}
      />
      
      <AddPropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editProperty={property}
        mode="edit"
        onPropertyAdded={() => {
          setIsEditDialogOpen(false);
          fetchPropertyDetails();
          toast({
            title: "Success",
            description: "Property updated successfully!",
          });
        }}
      />
      
      <PropertyCheckDetailsDialog
        open={isPropertyCheckDialogOpen}
        onOpenChange={setIsPropertyCheckDialogOpen}
        checkSessionId={selectedCheckSessionId}
      />
      
      <MaintenanceDetailsDialog
        request={selectedMaintenanceRequest as any}
        open={isMaintenanceDetailsDialogOpen}
        onOpenChange={setIsMaintenanceDetailsDialogOpen}
      />
    </div>
  );
}

export default PropertyDetail;