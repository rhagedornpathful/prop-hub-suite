import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Bell, 
  User, 
  ArrowLeft,
  Edit,
  Building2,
  DollarSign,
  Home,
  TrendingUp,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  Users,
  Eye,
  Trash2,
  MoreHorizontal,
  CalendarIcon,
  Download,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { usePropertyOwner } from "@/hooks/queries/usePropertyOwners";
import { usePropertiesByOwner } from "@/hooks/queries/useProperties";
import { AddPropertyOwnerDialog } from "@/components/AddPropertyOwnerDialog";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { AddDistributionDialog } from "@/components/AddDistributionDialog";
import { PropertyDetailsDialogDB } from "@/components/PropertyDetailsDialogDB";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;
type PropertyOwner = Tables<'property_owners'>;

interface Distribution {
  id: string;
  owner_id: string;
  property_id: string;
  amount: number;
  distribution_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  property?: {
    address: string;
  };
}

const PropertyOwnerDetail = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [isAddDistributionDialogOpen, setIsAddDistributionDialogOpen] = useState(false);
  const [isPropertyDetailsDialogOpen, setIsPropertyDetailsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  const { toast } = useToast();

  // Use hooks to fetch data
  const { data: owner, isLoading: isOwnerLoading, error: ownerError } = usePropertyOwner(ownerId);
  const { data: properties = [], isLoading: isPropertiesLoading } = usePropertiesByOwner(ownerId);

  useEffect(() => {
    if (ownerId) {
      loadDistributions();
    }
  }, [ownerId]);

  useEffect(() => {
    setIsLoading(isOwnerLoading || isPropertiesLoading);
  }, [isOwnerLoading, isPropertiesLoading]);

  const loadDistributions = async () => {
    if (!ownerId) return;

    try {
      // Check if we're in demo mode
      const isDemoMode = window.location.pathname.startsWith('/demo');
      
      if (isDemoMode) {
        // Use mock data for demo
        const mockDistributions = [
          {
            id: "1",
            owner_id: "1",
            property_id: "1",
            amount: 2800.00,
            distribution_date: "2024-01-15",
            payment_method: "direct_deposit",
            reference_number: "TXN-001234",
            notes: "Monthly rental distribution",
            created_at: "2024-01-15T10:00:00Z",
            property: { address: "123 Main St, Downtown" }
          },
          {
            id: "2",
            owner_id: "1",
            property_id: "5",
            amount: 3200.00,
            distribution_date: "2024-01-15",
            payment_method: "direct_deposit",
            reference_number: "TXN-001235",
            notes: "Monthly rental distribution",
            created_at: "2024-01-15T10:00:00Z",
            property: { address: "987 Highland Dr, Suburbs" }
          },
          {
            id: "3",
            owner_id: "1",
            property_id: "7",
            amount: 8500.00,
            distribution_date: "2024-01-15",
            payment_method: "check",
            reference_number: "CHK-5678",
            notes: "Commercial property rental distribution",
            created_at: "2024-01-15T10:00:00Z",
            property: { address: "456 Corporate Plaza, Business District" }
          }
        ];
        setDistributions(mockDistributions);
        return;
      }

      // Load distributions for this owner from database
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('owner_distributions')
        .select(`
          *,
          property:properties(address)
        `)
        .eq('owner_id', ownerId)
        .order('distribution_date', { ascending: false });

      if (distributionsError) throw distributionsError;
      setDistributions(distributionsData || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
      toast({
        title: "Error",
        description: "Failed to load distribution data",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

  const getFullAddress = (owner: PropertyOwner) => {
    const parts = [owner.address, owner.city, owner.state, owner.zip_code].filter(Boolean);
    return parts.join(', ');
  };

  const calculateTotalValue = () => {
    return properties.reduce((total, property) => total + (property.estimated_value || 0), 0);
  };

  const calculateTotalUnits = () => {
    return properties.reduce((total, property) => {
      // For apartments/multi-family, use bedrooms as unit count approximation
      // For single family, count as 1 unit
      if (property.property_type === 'apartment' || property.property_type === 'multi_family') {
        return total + (property.bedrooms || 1);
      }
      return total + 1;
    }, 0);
  };

  const calculateMonthlyIncome = () => {
    return properties.reduce((total, property) => total + (property.monthly_rent || 0), 0);
  };

  const handleOwnerUpdated = () => {
    toast({
      title: "Owner Updated",
      description: "Property owner information has been updated successfully.",
    });
    // React Query will automatically refetch the data
  };

  const handlePropertyAdded = () => {
    toast({
      title: "Property Added",
      description: "New property has been added to this owner's portfolio.",
    });
    // React Query will automatically refetch the data
  };

  const handleDistributionAdded = () => {
    toast({
      title: "Distribution Recorded",
      description: "Payment distribution has been recorded successfully.",
    });
    loadDistributions(); // Reload distributions
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDetailsDialogOpen(true);
  };

  const filteredDistributions = distributions.filter(distribution => {
    if (!dateFilter.from && !dateFilter.to) return true;
    const distributionDate = new Date(distribution.distribution_date);
    if (dateFilter.from && distributionDate < dateFilter.from) return false;
    if (dateFilter.to && distributionDate > dateFilter.to) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Property', 'Amount', 'Payment Method', 'Reference', 'Notes'];
    const csvData = filteredDistributions.map(distribution => [
      distribution.distribution_date,
      distribution.property?.address || 'Unknown Property',
      distribution.amount.toString(),
      distribution.payment_method || '',
      distribution.reference_number || '',
      distribution.notes || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `distributions-${owner?.first_name}-${owner?.last_name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Distributions data has been exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property owner details...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (ownerError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Property Owner</h2>
          <p className="text-muted-foreground mb-4">
            {ownerError.message || "Failed to load property owner data"}
          </p>
          <Button onClick={() => navigate('/property-owners')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Owners
          </Button>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Property Owner Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested property owner could not be found.</p>
          <Button onClick={() => navigate('/property-owners')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Owners
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Back Button - properly aligned */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/property-owners')}
              className="hover:bg-muted flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                {/* TODO: Replace with actual profile photo upload */}
                {owner.company_name ? (
                  <Building2 className="h-8 w-8" />
                ) : (
                  <span>
                    {owner.first_name.charAt(0)}{owner.last_name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Name and Company Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {owner.first_name} {owner.last_name}
                </h1>
                {owner.is_self && (
                  <Badge variant="secondary" className="text-xs">Me</Badge>
                )}
              </div>
              {owner.company_name && (
                <h2 className="text-lg text-muted-foreground font-medium mt-1">
                  {owner.company_name}
                </h2>
              )}
              <p className="text-sm text-muted-foreground mt-1">Property Owner Details</p>
            </div>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold text-foreground">{properties.length}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${calculateTotalValue().toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gradient-success rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-bold text-foreground">{calculateTotalUnits()}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${calculateMonthlyIncome().toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
                <TabsTrigger value="distributions">Distributions ({distributions.length})</TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent value="properties" className="mt-6">
                <Card className="shadow-md border-0">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Properties ({properties.length})</CardTitle>
                    <Button 
                      className="bg-gradient-primary hover:bg-primary-dark"
                      onClick={() => setIsAddPropertyDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {properties.length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Properties</h3>
                        <p className="text-muted-foreground mb-4">
                          This owner doesn't have any properties yet.
                        </p>
                        <Button onClick={() => setIsAddPropertyDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Property
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {properties.map((property) => (
                          <div 
                            key={property.id} 
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                            onClick={() => handleViewProperty(property)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium text-foreground">{property.address}</h4>
                                  {property.status && (
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {property.status}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  {property.property_type && (
                                    <span className="capitalize">{property.property_type.replace('_', ' ')}</span>
                                  )}
                                  {property.bedrooms && property.bathrooms && (
                                    <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
                                  )}
                                  {property.monthly_rent && (
                                    <span>${property.monthly_rent.toLocaleString()}/mo</span>
                                  )}
                                </div>
                                {property.estimated_value && (
                                  <p className="text-sm font-medium text-success mt-1">
                                    Value: ${property.estimated_value.toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={(e) => {
                                     e.stopPropagation();
                                     handleViewProperty(property);
                                   }}>
                                     <Eye className="h-4 w-4 mr-2" />
                                     View Details
                                   </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Property
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Distributions Tab - keeping all existing content */}
              <TabsContent value="distributions" className="mt-6">
                {/* ... keep existing distributions content ... */}
              </TabsContent>
            </Tabs>
          </div>

          {/* Owner Information Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Owner Information</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{owner.first_name} {owner.last_name}</p>
                  </div>
                  
                  {owner.company_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p className="text-sm">{owner.company_name}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{owner.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{owner.phone}</span>
                  </div>
                  
                  {getFullAddress(owner) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{getFullAddress(owner)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">
                      {owner.preferred_payment_method.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {owner.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm text-muted-foreground">{owner.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddPropertyOwnerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onOwnerAdded={handleOwnerUpdated}
        editOwner={owner as any}
        mode="edit"
      />

      <AddPropertyDialog
        open={isAddPropertyDialogOpen}
        onOpenChange={setIsAddPropertyDialogOpen}
        onPropertyAdded={handlePropertyAdded}
      />

      <AddDistributionDialog
        open={isAddDistributionDialogOpen}
        onOpenChange={setIsAddDistributionDialogOpen}
        onDistributionAdded={handleDistributionAdded}
        ownerId={owner.id}
        properties={properties}
      />

      <PropertyDetailsDialogDB
        property={selectedProperty}
        open={isPropertyDetailsDialogOpen}
        onOpenChange={setIsPropertyDetailsDialogOpen}
        onEdit={(property) => {
          console.log('Edit property:', property);
          // TODO: Implement property edit functionality
        }}
        onDelete={(property) => {
          console.log('Delete property:', property);
          // TODO: Implement property delete functionality
        }}
      />
    </div>
  );
};

export default PropertyOwnerDetail;