import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Building, 
  Home, 
  Eye,
  Settings,
  Grid3X3,
  List,
  Map,
  Search
} from "lucide-react";
import { useProperties } from "@/hooks/queries/useProperties";
import { PropertyMobileTable } from "@/components/PropertyMobileTable";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { PropertyDetailsDialog } from "@/components/PropertyDetailsDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: propertyData, isLoading, error } = useProperties(1, 100);
  const properties = propertyData?.properties || [];
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Filter properties based on search
  const filteredProperties = properties.filter(property => 
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active' || !p.status).length;
  const houseWatchingProperties = properties.filter(p => p.service_type === 'house_watching').length;
  const propertyManagementProperties = properties.filter(p => p.service_type === 'property_management' || !p.service_type).length;

  const handlePropertyClick = (property: any) => {
    navigate(`/properties/${property.id}`);
  };

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setShowAddProperty(true);
  };

  const handleScheduleMaintenance = (property: any) => {
    // TODO: Implement maintenance scheduling
    console.log('Schedule maintenance for:', property);
  };


  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6 safe-area-inset">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Unable to Load Properties</h3>
              <p className="text-muted-foreground">There was an error loading your properties.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 safe-area-inset space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage your property portfolio
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddProperty(true)}
          size={isMobile ? "default" : "sm"}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="min-h-[80px]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shrink-0">
                <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{activeProperties}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[80px]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg shrink-0">
                <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{houseWatchingProperties}</p>
                <p className="text-xs text-muted-foreground">House Watching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[80px]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{propertyManagementProperties}</p>
                <p className="text-xs text-muted-foreground">Property Management</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[80px]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                <Building className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold">{totalProperties}</p>
                <p className="text-xs text-muted-foreground">Total Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-1 h-9"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            <span className="text-xs">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 h-9"
          >
            <List className="h-4 w-4 mr-1" />
            <span className="text-xs">List</span>
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex-1 h-9"
          >
            <Map className="h-4 w-4 mr-1" />
            <span className="text-xs">Map</span>
          </Button>
        </div>
      </div>

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProperties.length} properties shown
          </p>
        </div>

        {viewMode === 'list' ? (
          <PropertyMobileTable
            properties={filteredProperties}
            onPropertyClick={handlePropertyClick}
            onEdit={handleEdit}
            onScheduleMaintenance={handleScheduleMaintenance}
            loading={isLoading}
          />
        ) : viewMode === 'map' ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Map View</h3>
                <p className="text-muted-foreground">Map view coming soon</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Grid View (mobile-optimized)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? 'No properties match your search criteria.' : 'Get started by adding your first property.'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowAddProperty(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <Card 
                  key={property.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow min-h-[44px]"
                  onClick={() => handlePropertyClick(property)}
                >
                  <div className="aspect-[4/3] bg-muted relative">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.address}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <Badge 
                        className={
                          property.status === 'active' || !property.status
                            ? 'bg-green-500 hover:bg-green-600 text-xs'
                            : 'bg-red-500 hover:bg-red-600 text-xs'
                        }
                      >
                        {property.status === 'active' || !property.status ? 'Active' : 'Inactive'}
                      </Badge>
                      {property.service_type === 'house_watching' && (
                        <Badge variant="secondary" className="text-xs">House Watching</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <h3 className="font-medium leading-tight text-sm line-clamp-1">{property.address}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {[property.city, property.state].filter(Boolean).join(', ')}
                        {property.zip_code && ` ${property.zip_code}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {property.bedrooms && property.bathrooms && (
                            <span>{property.bedrooms}br • {property.bathrooms}ba</span>
                          )}
                        </div>
                        {property.monthly_rent && (
                          <div className="font-medium text-xs text-right">
                            ${property.monthly_rent.toLocaleString()}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddPropertyDialog 
        open={showAddProperty}
        onOpenChange={setShowAddProperty}
        onPropertyAdded={() => {
          setShowAddProperty(false);
          setSelectedProperty(null);
        }}
      />

      <PropertyDetailsDialog
        property={selectedProperty}
        open={showPropertyDetails}
        onOpenChange={setShowPropertyDetails}
      />

    </div>
  );
};

export default Properties;