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
  Receipt
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";

type Property = Tables<'properties'>;
type MaintenanceRequest = Tables<'maintenance_requests'>;

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchMaintenanceRequests();
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
              <DollarSign className="h-6 w-6 text-success" />
              <span className="font-medium">Monthly Income</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(property.monthly_rent)}</p>
            <p className="text-sm text-muted-foreground">
              {property.service_type === 'house_watching' ? 'Service fee' : 'Rental income'}
            </p>
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

        {property.home_value_estimate && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-6 w-6 text-info" />
                <span className="font-medium">Home Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(property.home_value_estimate)}</p>
              <p className="text-sm text-muted-foreground">Home value estimate</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Property Type</label>
                      <p className="font-medium capitalize">{property.property_type?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Service Type</label>
                      <p className="font-medium capitalize">{property.service_type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {property.year_built && (
                    <div>
                      <label className="text-sm text-muted-foreground">Year Built</label>
                      <p className="font-medium">{property.year_built}</p>
                    </div>
                  )}
                  
                  {property.lot_size && (
                    <div>
                      <label className="text-sm text-muted-foreground">Lot Size</label>
                      <p className="font-medium">{property.lot_size}</p>
                    </div>
                  )}
                  
                  {property.gate_code && (
                    <div>
                      <label className="text-sm text-muted-foreground">Gate Code</label>
                      <p className="font-medium font-mono bg-muted px-2 py-1 rounded">{property.gate_code}</p>
                    </div>
                  )}
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
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{request.title}</h4>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No maintenance requests found.</p>
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
    </div>
  );
}

export default PropertyDetail;