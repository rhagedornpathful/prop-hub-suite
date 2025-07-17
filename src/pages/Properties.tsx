import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OptimizedPropertyGrid } from "@/components/OptimizedPropertyGrid";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyList } from "@/components/PropertyList";
import { PropertyMap } from "@/components/PropertyMap";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  Building,
  InfoIcon,
  Eye,
  DollarSign,
  Wrench
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { RoleBasedWrapper } from "@/components/RoleBasedWrapper";
import { useProperties } from "@/hooks/queries/useProperties";
import { useHouseWatching } from "@/hooks/queries/useHouseWatching";
import { useToast } from "@/hooks/use-toast";
import { useMobilePerformance } from "@/hooks/useMobilePerformance";

const Properties = () => {
  const navigate = useNavigate();
  const { 
    userRole, 
    isAdmin, 
    isPropertyOwner, 
    isTenant, 
    isHouseWatcher,
    hasAdminAccess,
    permissions,
    getRoleDisplayName 
  } = useUserRole();

  // Mobile performance optimizations
  const { 
    shouldReduceAnimations, 
    shouldLimitItems, 
    isSmallMobile,
    getAnimationClass,
    config 
  } = useMobilePerformance();

  // Get real property data with pagination
  const { data: propertyData, isLoading: propertiesLoading, refetch: refetchProperties } = useProperties(1, 100);
  const { data: houseWatchingProperties = [], isLoading: houseWatchingLoading, refetch: refetchHouseWatching } = useHouseWatching();
  
  const properties = propertyData?.properties || [];
  const isLoading = propertiesLoading || houseWatchingLoading;
  const { toast } = useToast();

  // Dialog state management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Handle dialog actions
  const handlePropertyAdded = async () => {
    toast({
      title: "Success",
      description: "Property added successfully",
    });
    
    // Add a small delay to ensure database consistency before refetching
    setTimeout(async () => {
      await Promise.all([
        refetchProperties(),
        refetchHouseWatching()
      ]);
    }, 100);
  };

  const handleImportProperties = () => {
    toast({
      title: "Import Feature",
      description: "Property import functionality coming soon!",
    });
  };

  // Handle property actions for list view
  const handleViewProperty = (property: any) => {
    console.log("View property:", property);
  };

  const handleEditProperty = (property: any) => {
    console.log("Edit property:", property);
  };

  const handleDeleteProperty = (property: any) => {
    console.log("Delete property:", property);
  };

  // For tenants, redirect to their property detail page
  useEffect(() => {
    if (isTenant()) {
      navigate('/tenant-property', { replace: true });
    }
  }, [userRole, navigate, isTenant]);

  const getRoleSpecificTitle = () => {
    if (hasAdminAccess()) return "All Properties";
    if (isPropertyOwner()) return "My Properties";
    if (isHouseWatcher()) return "Assigned Properties";
    return "Properties";
  };

  const getPropertyCount = () => {
    const propertyManagementCount = properties.filter(p => p.service_type === 'property_management').length;
    const houseWatchingFromPropsCount = properties.filter(p => p.service_type === 'house_watching').length;
    const houseWatchingFromTableCount = houseWatchingProperties.length;
    return propertyManagementCount + houseWatchingFromPropsCount + houseWatchingFromTableCount;
  };

  const getOccupiedCount = () => {
    const activePropertyManagement = properties.filter(p => p.service_type === 'property_management' && p.status === 'active').length;
    const activeHouseWatchingFromProps = properties.filter(p => p.service_type === 'house_watching' && p.status === 'active').length;
    const activeHouseWatchingFromTable = houseWatchingProperties.filter(p => p.status === 'active').length;
    return activePropertyManagement + activeHouseWatchingFromProps + activeHouseWatchingFromTable;
  };

  const getVacantCount = () => {
    const vacantPropertyManagement = properties.filter(p => p.service_type === 'property_management' && p.status === 'vacant').length;
    const inactiveHouseWatchingFromProps = properties.filter(p => p.service_type === 'house_watching' && p.status === 'inactive').length;
    const inactiveHouseWatchingFromTable = houseWatchingProperties.filter(p => p.status === 'inactive').length;
    return vacantPropertyManagement + inactiveHouseWatchingFromProps + inactiveHouseWatchingFromTable;
  };

  const getAverageRent = () => {
    const propertyManagementTotal = properties
      .filter(p => p.service_type === 'property_management')
      .reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
    const houseWatchingFromPropsTotal = properties
      .filter(p => p.service_type === 'house_watching')
      .reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
    const houseWatchingFromTableTotal = houseWatchingProperties.reduce((sum, p) => sum + (p.monthly_fee || 0), 0);
    
    const total = propertyManagementTotal + houseWatchingFromPropsTotal + houseWatchingFromTableTotal;
    const count = getPropertyCount();
    return count > 0 ? total / count : 0;
  };

  // Don't render for tenants as they get redirected
  if (isTenant()) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-subtle ${shouldReduceAnimations ? 'reduce-motion' : ''}`}>
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile First */}
        <header className={`bg-card border-b border-border section-padding shadow-sm ${shouldReduceAnimations ? 'mobile-simplified' : ''}`}>
          <div className="container-responsive">
            {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
            <div className="mobile-stack items-start md:items-center justify-between">
              <h1 className="text-responsive-xl font-bold text-foreground mb-4 md:mb-0">
                {getRoleSpecificTitle()}
              </h1>
              
              {/* Search and Filters - Mobile Stack */}
              <div className="w-full md:flex-1 md:max-w-4xl mobile-stack">
                {/* Search Input */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search properties..." 
                    className="pl-10 w-full touch-target"
                  />
                </div>
                
                {/* Filter Controls - Stack on mobile */}
                <div className="mobile-stack">
                  <Select>
                    <SelectTrigger className="w-full md:w-40 touch-target">
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="property_management">Property Management</SelectItem>
                      <SelectItem value="house_watching">House Watching</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="touch-target">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span className="mobile-only">Filters</span>
                    <span className="desktop-only">Advanced</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons - Stack on mobile */}
              <div className="mobile-stack w-full md:w-auto">
                <Button variant="outline" size="sm" className="relative touch-target">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                    3
                  </Badge>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/maintenance')} className="touch-target">
                  <Wrench className="h-4 w-4 mr-2" />
                  <span className="desktop-only">Maintenance</span>
                </Button>
                <Button variant="outline" size="sm" className="touch-target">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content - Mobile First */}
        <main className="flex-1 section-padding overflow-auto">
          <div className="container-responsive space-y-8">
            {/* Quick Actions - Stack on mobile */}
            <div className="mobile-stack">
              <Button 
                className="bg-gradient-primary hover:bg-primary-dark touch-target"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
              <Button 
                variant="outline"
                onClick={handleImportProperties}
                className="touch-target"
              >
                <Filter className="h-4 w-4 mr-2" />
                Import Properties
              </Button>
            </div>

            {/* Property Summary Stats - Responsive Grid with Performance Optimizations */}
            <div className={`grid-responsive-4 ${isSmallMobile ? 'mobile-grid-simple' : ''} ${getAnimationClass('fade')}`}>
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getPropertyCount()}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Grid className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getOccupiedCount()}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-success rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getVacantCount()}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                        <Search className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Monthly</p>
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : `$${Math.round(getAverageRent()).toLocaleString()}`}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* View Tabs */}
              <Tabs defaultValue="grid" className="w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map">
                    <Map className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="grid" className="mt-6">
                  <OptimizedPropertyGrid
                    properties={properties}
                    houseWatchingProperties={houseWatchingProperties}
                    isLoading={isLoading}
                    onRefresh={async () => {
                      await Promise.all([
                        refetchProperties(),
                        refetchHouseWatching()
                      ]);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="list" className="mt-6">
                  <PropertyList 
                    properties={[...properties, ...houseWatchingProperties.map(hw => ({
                      ...hw,
                      address: hw.property_address,
                      property_type: 'House Watching',
                      monthly_rent: hw.monthly_fee,
                      service_type: 'house_watching'
                    }))]} 
                    isLoading={isLoading}
                    onView={handleViewProperty}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                  />
                </TabsContent>
                
                <TabsContent value="map" className="mt-6">
                  <PropertyMap properties={properties} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
      </div>

      {/* Add Property Dialog */}
      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPropertyAdded={handlePropertyAdded}
        mode="add"
      />
    </div>
  );
};

export default Properties;