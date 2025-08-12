import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Star,
  Eye,
  BarChart3,
  Calculator,
  PieChart,
  Activity,
  Camera,
  ExternalLink,
  ChevronRight,
  Info,
  Zap,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Car,
  Trees,
  Waves,
  Sun,
  Snowflake,
  Flame,
  Wind,
  Droplets,
  Lightbulb,
  Wifi,
  Shield as SecurityIcon,
  Key,
  Camera as CameraIcon,
  Thermometer,
  Package
} from "lucide-react";
import { PropertyServiceAssignments } from "@/components/PropertyServiceAssignments";
import { PropertyOwnershipManager } from "@/components/PropertyOwnershipManager";
import { ScheduleMaintenanceDialog } from "@/components/ScheduleMaintenanceDialog";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;

interface EnterprisePropertyDetailsProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function EnterprisePropertyDetails({ property, open, onOpenChange, onEdit, onDelete }: EnterprisePropertyDetailsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!property) return null;

  const [openScheduleMaintenance, setOpenScheduleMaintenance] = useState(false);
  const { data: allMaintenance = [] } = useMaintenanceRequests();
  const maintenanceForProperty = allMaintenance.filter((m: any) => m.property_id === property.id);

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

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'Not available';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculatePricePerSqFt = () => {
    if (property.estimated_value && property.square_feet) {
      return Math.round(property.estimated_value / property.square_feet);
    }
    return null;
  };

  const calculateRentYield = () => {
    if (property.monthly_rent && property.estimated_value) {
      const annualRent = property.monthly_rent * 12;
      return ((annualRent / property.estimated_value) * 100).toFixed(2);
    }
    return null;
  };

  const getValueComparison = () => {
    if (property.estimated_value && property.home_value_estimate) {
      const diff = property.estimated_value - property.home_value_estimate;
      const percentDiff = (diff / property.home_value_estimate) * 100;
      return { diff, percentDiff: percentDiff.toFixed(1) };
    }
    return null;
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(property);
    } else {
      toast({
        title: "Edit Property",
        description: "Opening edit dialog...",
      });
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(property);
    } else {
      toast({
        title: "Delete Property", 
        description: "Delete functionality will be available soon.",
        variant: "destructive",
      });
    }
  };

  const handleManageTenants = () => {
    onOpenChange(false);
    navigate('/tenants');
  };

  const amenityIcons: Record<string, any> = {
    pool: Waves,
    garage: Car,
    parking: Car,
    garden: Trees,
    air_conditioning: Wind,
    heating: Flame,
    fireplace: Flame,
    balcony: Sun,
    terrace: Sun,
    basement: Home,
    attic: Home,
    laundry: Droplets,
    dishwasher: Droplets,
    wifi: Wifi,
    security: SecurityIcon,
    alarm: SecurityIcon,
    keys: Key,
    cameras: CameraIcon,
    thermostat: Thermometer,
    lighting: Lightbulb,
  };

  const valueComparison = getValueComparison();
  const pricePerSqFt = calculatePricePerSqFt();
  const rentYield = calculateRentYield();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] overflow-hidden p-0 flex flex-col">
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <DialogHeader className="p-6 border-b bg-gradient-subtle">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <DialogTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {property.address}
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{getDisplayAddress()}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusColors[property.status as keyof typeof statusColors] || statusColors.inactive}>
                    {statusText[property.status as keyof typeof statusText] || property.status}
                  </Badge>
                  <Badge className="bg-primary text-primary-foreground">
                    <Building className="h-3 w-3 mr-1" />
                    {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
                  </Badge>
                  {property.year_built && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Built {property.year_built}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="w-full justify-start p-6 pb-0 bg-transparent flex-shrink-0">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="financials" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Financials
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Analysis
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="owners" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Owners
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                          <p className="text-2xl font-bold text-success">{formatCurrency(property.monthly_rent)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {property.service_type === 'house_watching' ? 'Service fee' : 'Rental income'}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-success/20 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Property Value</p>
                          <p className="text-2xl font-bold">{formatCurrency(property.estimated_value)}</p>
                          {valueComparison && (
                            <div className="flex items-center gap-1 mt-1">
                              {parseFloat(valueComparison.percentDiff) > 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-success" />
                              ) : parseFloat(valueComparison.percentDiff) < 0 ? (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                              ) : (
                                <Minus className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={`text-xs ${parseFloat(valueComparison.percentDiff) > 0 ? 'text-success' : parseFloat(valueComparison.percentDiff) < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {valueComparison.percentDiff}% vs market
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {pricePerSqFt && (
                    <Card className="relative overflow-hidden bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Price per Sq Ft</p>
                            <p className="text-2xl font-bold">{formatCurrency(pricePerSqFt)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Based on estimated value</p>
                          </div>
                          <div className="h-10 w-10 bg-warning/20 rounded-full flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-warning" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {rentYield && (
                    <Card className="relative overflow-hidden bg-gradient-to-br from-info/10 to-info/5 border-info/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Annual Yield</p>
                            <p className="text-2xl font-bold">{rentYield}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Gross rental yield</p>
                          </div>
                          <div className="h-10 w-10 bg-info/20 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-info" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Property Image and Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardContent className="p-0">
                        <div className="relative rounded-lg overflow-hidden bg-gradient-subtle">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.address}
                              className="w-full h-80 object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-80 flex items-center justify-center bg-muted">
                              <div className="text-center">
                                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No image available</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex justify-between items-end">
                              <div className="text-white">
                                <h3 className="text-xl font-bold">{property.address}</h3>
                                <p className="text-white/80">{property.city}, {property.state}</p>
                              </div>
                              {property.images && property.images.length > 1 && (
                                <Badge className="bg-black/50 text-white">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {property.images.length} photos
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    {/* Property Specs */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Property Specs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {property.bedrooms && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Bedrooms</span>
                            </div>
                            <span className="font-semibold">{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bath className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Bathrooms</span>
                            </div>
                            <span className="font-semibold">{property.bathrooms}</span>
                          </div>
                        )}
                        {property.square_feet && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Square className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Square Feet</span>
                            </div>
                            <span className="font-semibold">{formatNumber(property.square_feet)}</span>
                          </div>
                        )}
                        {property.lot_size && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trees className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Lot Size</span>
                            </div>
                            <span className="font-semibold">{property.lot_size}</span>
                          </div>
                        )}
                        {property.property_type && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Type</span>
                            </div>
                            <span className="font-semibold capitalize">{property.property_type.replace('_', ' ')}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {property.service_type === 'property_management' && (
                          <Button variant="outline" className="w-full justify-start" onClick={handleManageTenants}>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Tenants
                          </Button>
                        )}
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule {property.service_type === 'house_watching' ? 'Check' : 'Maintenance'}
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          Activity History
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Amenities & Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {property.amenities.map((amenity, index) => {
                          const IconComponent = amenityIcons[amenity] || Award;
                          return (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <IconComponent className="h-4 w-4 text-primary" />
                              <span className="text-sm capitalize">{amenity.replace('_', ' ')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="financials" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                {/* Financial Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-success">
                        <DollarSign className="h-5 w-5" />
                        Monthly Income
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-success">{formatCurrency(property.monthly_rent)}</div>
                        {property.monthly_rent && (
                          <div className="text-sm text-muted-foreground">
                            Annual: {formatCurrency(property.monthly_rent * 12)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Property Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold">{formatCurrency(property.estimated_value)}</div>
                        {property.home_value_estimate && (
                          <div className="text-sm text-muted-foreground">
                            Zillow Estimate: {formatCurrency(property.home_value_estimate)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Market Rent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold">{formatCurrency(property.rent_estimate)}</div>
                        {property.monthly_rent && property.rent_estimate && (
                          <div className="text-sm">
                            {property.monthly_rent > property.rent_estimate ? (
                              <span className="text-success">Above market by {formatCurrency(property.monthly_rent - property.rent_estimate)}</span>
                            ) : property.monthly_rent < property.rent_estimate ? (
                              <span className="text-warning">Below market by {formatCurrency(property.rent_estimate - property.monthly_rent)}</span>
                            ) : (
                              <span className="text-muted-foreground">At market rate</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Financial Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {pricePerSqFt && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatCurrency(pricePerSqFt)}</div>
                          <div className="text-sm text-muted-foreground">Price per Sq Ft</div>
                        </div>
                      )}
                      
                      {rentYield && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{rentYield}%</div>
                          <div className="text-sm text-muted-foreground">Annual Yield</div>
                        </div>
                      )}

                      {property.monthly_rent && property.square_feet && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {formatCurrency(property.monthly_rent / property.square_feet)}
                          </div>
                          <div className="text-sm text-muted-foreground">Rent per Sq Ft</div>
                        </div>
                      )}

                      {property.estimated_value && property.monthly_rent && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {(property.estimated_value / (property.monthly_rent * 12)).toFixed(1)}x
                          </div>
                          <div className="text-sm text-muted-foreground">Price-to-Rent Ratio</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Value Analysis */}
                      {property.estimated_value && property.home_value_estimate && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Property Value Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
                              <div className="text-xl font-bold">{formatCurrency(property.estimated_value)}</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Zillow Estimate</div>
                              <div className="text-xl font-bold">{formatCurrency(property.home_value_estimate)}</div>
                            </div>
                          </div>
                          {valueComparison && (
                            <div className="p-4 bg-gradient-subtle rounded-lg border">
                              <div className="flex items-center gap-2">
                                {parseFloat(valueComparison.percentDiff) > 0 ? (
                                  <ArrowUpRight className="h-5 w-5 text-success" />
                                ) : parseFloat(valueComparison.percentDiff) < 0 ? (
                                  <ArrowDownRight className="h-5 w-5 text-destructive" />
                                ) : (
                                  <Minus className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className="font-semibold">
                                  {Math.abs(parseFloat(valueComparison.percentDiff))}% 
                                  {parseFloat(valueComparison.percentDiff) > 0 ? ' above' : parseFloat(valueComparison.percentDiff) < 0 ? ' below' : ' same as'} 
                                  Zillow estimate
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Difference: {formatCurrency(Math.abs(valueComparison.diff))}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rent Analysis */}
                      {property.monthly_rent && property.rent_estimate && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Rental Market Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                              <div className="text-sm text-muted-foreground mb-1">Current Rent</div>
                              <div className="text-xl font-bold text-success">{formatCurrency(property.monthly_rent)}</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Market Estimate</div>
                              <div className="text-xl font-bold">{formatCurrency(property.rent_estimate)}</div>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-subtle rounded-lg border">
                            {property.monthly_rent > property.rent_estimate ? (
                              <div className="flex items-center gap-2 text-success">
                                <ArrowUpRight className="h-5 w-5" />
                                <span className="font-semibold">
                                  {formatCurrency(property.monthly_rent - property.rent_estimate)} above market
                                </span>
                              </div>
                            ) : property.monthly_rent < property.rent_estimate ? (
                              <div className="flex items-center gap-2 text-warning">
                                <ArrowDownRight className="h-5 w-5" />
                                <span className="font-semibold">
                                  {formatCurrency(property.rent_estimate - property.monthly_rent)} below market
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-semibold">At market rate</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {((property.monthly_rent / property.rent_estimate - 1) * 100).toFixed(1)}% 
                              {property.monthly_rent > property.rent_estimate ? ' premium' : property.monthly_rent < property.rent_estimate ? ' discount' : ' variance'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Property Specifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Property Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Property Type', value: property.property_type?.replace('_', ' '), icon: Tag },
                        { label: 'Year Built', value: property.year_built, icon: Calendar },
                        { label: 'Square Feet', value: property.square_feet ? formatNumber(property.square_feet) : null, icon: Square },
                        { label: 'Lot Size', value: property.lot_size, icon: Trees },
                        { label: 'Bedrooms', value: property.bedrooms, icon: Bed },
                        { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
                        { label: 'Service Type', value: property.service_type?.replace('_', ' '), icon: Shield },
                        { label: 'Status', value: property.status, icon: Activity },
                      ].filter(item => item.value).map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="font-medium capitalize">{item.value}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Location Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Location Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Street Address', value: property.street_address },
                        { label: 'City', value: property.city },
                        { label: 'State', value: property.state },
                        { label: 'ZIP Code', value: property.zip_code },
                        { label: 'Gate Code', value: property.gate_code, sensitive: true },
                      ].filter(item => item.value).map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className={`font-medium ${item.sensitive ? 'font-mono bg-muted px-2 py-1 rounded text-xs' : ''}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                {property.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Description & Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{property.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Property History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Created</span>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(property.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Last Updated</span>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(property.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Service Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PropertyServiceAssignments propertyId={property.id} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="owners" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Property Owners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PropertyOwnershipManager propertyId={property.id} propertyAddress={property.address} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="flex-1 overflow-y-auto p-6 space-y-6 data-[state=active]:flex data-[state=active]:flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Property Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {property.images && property.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`${property.address} - Image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full Size
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Images Available</h3>
                        <p className="text-sm text-muted-foreground">Property images will appear here when uploaded.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}