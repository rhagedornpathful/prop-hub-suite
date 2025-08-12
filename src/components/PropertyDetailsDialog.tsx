import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialog } from "@/components/mobile/MobileDialog";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Shield,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";

interface PropertyManagementProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  units: number;
  occupiedUnits: number;
  monthlyRent: number;
  status: "occupied" | "vacant" | "maintenance";
  image: string;
  serviceType: "property_management";
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
  };
}

interface HouseWatchingProperty {
  id: string;
  name: string;
  address: string;
  checkFrequency: "weekly" | "bi-weekly" | "monthly";
  monthlyFee: number;
  status: "active" | "inactive" | "pending";
  lastCheckDate: string;
  nextCheckDate: string;
  image: string;
  serviceType: "house_watching";
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
  };
}

type Property = PropertyManagementProperty | HouseWatchingProperty;

interface PropertyDetailsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyDetailsDialog({ property, open, onOpenChange, onEdit, onDelete }: PropertyDetailsDialogProps) {
  if (!property) return null;

  const isPropertyManagement = property.serviceType === "property_management";
  const isHouseWatching = property.serviceType === "house_watching";
  
  const occupancyRate = isPropertyManagement 
    ? (property.occupiedUnits / property.units) * 100 
    : 0;

  // Fetch house watching data for this property
  const { data: houseWatchingData, isLoading: houseWatchingLoading } = useQuery({
    queryKey: ['house-watching', property.address],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('house_watching')
        .select('*')
        .eq('property_address', property.address)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: isHouseWatching && open,
  });

  // Fetch home check sessions for this property
  const { data: homeCheckSessions, isLoading: homeChecksLoading } = useQuery({
    queryKey: ['home-check-sessions', property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: isHouseWatching && open,
  });

  const statusColors = {
    occupied: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground",
    active: "bg-success text-success-foreground",
    inactive: "bg-muted text-muted-foreground",
    pending: "bg-warning text-warning-foreground"
  };

  const statusText = {
    occupied: "Occupied",
    vacant: "Vacant", 
    maintenance: "Under Maintenance",
    active: "Active Monitoring",
    inactive: "Inactive",
    pending: "Pending Setup"
  };

  // Fetch house watcher profile data
  const { data: houseWatcherProfile, isLoading: houseWatcherLoading } = useQuery({
    queryKey: ['house-watcher-profile', houseWatchingData?.user_id],
    queryFn: async () => {
      if (!houseWatchingData?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('user_id', houseWatchingData.user_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!houseWatchingData?.user_id && open,
  });

  const isMobile = useMobileDetection();
  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "p-4" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                    {statusText[property.status as keyof typeof statusText]}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">
                    {isPropertyManagement ? (
                      <Building className="h-3 w-3 mr-1" />
                    ) : (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {isPropertyManagement ? "Property Management" : "House Watching"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.address}</span>
              </div>
              
              {isPropertyManagement && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <span className="font-medium">Property Type</span>
                      </div>
                      <p className="text-lg">{property.type}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        <span className="font-medium">Monthly Rent</span>
                      </div>
                      <p className="text-lg font-semibold">${property.monthlyRent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Occupancy</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{property.occupiedUnits} of {property.units} units occupied</span>
                        <span className="font-semibold">{occupancyRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {isHouseWatching && (
                <>
                  {houseWatchingLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : houseWatchingData ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-medium">Check Frequency</span>
                          </div>
                          <p className="text-lg capitalize">{houseWatchingData.check_frequency}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-success" />
                            <span className="font-medium">Monthly Fee</span>
                          </div>
                          <p className="text-lg font-semibold">${houseWatchingData.monthly_fee}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="font-medium">Last Check</span>
                          </div>
                          <p className="text-lg">
                            {houseWatchingData.last_check_date 
                              ? format(new Date(houseWatchingData.last_check_date), 'MMM d, yyyy')
                              : 'No checks yet'
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-success" />
                            <span className="font-medium">Next Check</span>
                          </div>
                          <p className="text-lg">
                            {houseWatchingData.next_check_date 
                              ? format(new Date(houseWatchingData.next_check_date), 'MMM d, yyyy')
                              : 'Not scheduled'
                            }
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No house watching service configured for this property
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Details */}
          {isPropertyManagement && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Bed className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="text-lg font-semibold">3-4</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Bath className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="text-lg font-semibold">2-3</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Square className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                    <p className="text-lg font-semibold">1,200+</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isHouseWatching && houseWatchingData && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">House Watching Activity</h3>
              
              {/* House Watcher Assignment */}
              <div className="p-4 bg-muted rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Assigned House Watcher
                </h4>
                {houseWatcherLoading ? (
                  <LoadingSpinner />
                ) : houseWatcherProfile ? (
                  <div className="space-y-2">
                    <p className="font-medium">{houseWatcherProfile.first_name} {houseWatcherProfile.last_name}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{houseWatcherProfile.phone || 'No phone on file'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Contact via admin</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No house watcher assigned
                  </div>
                )}
              </div>

              {/* Next Scheduled Check */}
              <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next Scheduled Check
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {houseWatchingData.next_check_date 
                        ? format(new Date(houseWatchingData.next_check_date), 'EEEE, MMMM d, yyyy')
                        : 'Not scheduled'
                      }
                    </span>
                    <Badge className="bg-primary text-primary-foreground">
                      {houseWatchingData.check_frequency} check
                    </Badge>
                  </div>
                  {houseWatchingData.next_check_date && (
                    <p className="text-sm text-muted-foreground">
                      Due in {Math.ceil((new Date(houseWatchingData.next_check_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Check Activity
                </h4>
                {homeChecksLoading ? (
                  <LoadingSpinner />
                ) : homeCheckSessions && homeCheckSessions.length > 0 ? (
                  <div className="space-y-3">
                    {homeCheckSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-muted rounded-lg border-l-4 border-l-primary">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                session.status === 'completed' 
                                  ? 'bg-success text-success-foreground' 
                                  : session.status === 'in_progress' 
                                  ? 'bg-warning text-warning-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {session.status}
                            </Badge>
                            <span className="text-sm font-medium">
                              {format(new Date(session.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {session.duration_minutes && (
                            <span className="text-sm text-muted-foreground">
                              {session.duration_minutes} min
                            </span>
                          )}
                        </div>
                        {session.general_notes && (
                          <p className="text-sm text-muted-foreground">{session.general_notes}</p>
                        )}
                        {session.total_issues_found > 0 && (
                          <p className="text-sm text-destructive">
                            {session.total_issues_found} issue(s) found
                          </p>
                        )}
                      </div>
                    ))}
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View All Check History
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-3">No checks completed yet</p>
                    <Button variant="outline" size="sm">
                      Schedule First Check
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Owner Details Card */}
          {property.owner && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Property Owner</h3>
              <div className="p-4 bg-muted rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {property.owner.company_name || property.owner.name}
                        </h4>
                        {property.owner.company_name && (
                          <p className="text-sm text-muted-foreground">{property.owner.name}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{property.owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{property.owner.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/demo/property-owners/${property.owner.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onEdit?.(property)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            {isPropertyManagement && (
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Tenants
              </Button>
            )}
            {isHouseWatching && houseWatchingData && (
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Check
              </Button>
            )}
            {isHouseWatching && houseWatchingData && (
              <Button variant="outline">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign House Watcher
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete?.(property)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}