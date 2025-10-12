import { useState, lazy, Suspense } from "react";
import { GridLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Building, 
  Home, 
  Eye,
  Settings,
  Grid3X3,
  List,
  Map,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateProperty } from "@/hooks/queries/useProperties";
import { useOptimizedProperties } from "@/hooks/queries/useOptimizedProperties";
import { useDeleteProperty } from "@/hooks/useDeleteProperty";
import { PropertyMobileTable } from "@/components/PropertyMobileTable";
import { StreamlinedAddPropertyDialog } from "@/components/StreamlinedAddPropertyDialog";
import { PropertyDetailsDialogDB } from "@/components/PropertyDetailsDialogDB";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useToast } from "@/hooks/use-toast";
import { BulkManagementTools } from "@/components/BulkManagementTools";
import { AdvancedSearchFilters } from "@/components/AdvancedSearchFilters";
import { MobilePropertyDashboard } from "@/components/mobile/MobilePropertyDashboard";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

// Lazy load heavy components for better performance
// Lazy load heavy components for better performance
const PropertyReportsDashboard = lazy(() => import("@/components/reports/PropertyReportsDashboard").then(module => ({default: module.PropertyReportsDashboard})));
import { MobilePropertyActions } from "@/components/mobile/MobilePropertyActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
const PropertiesMap = lazy(() => import("@/components/PropertiesMap"));
import type { PropertyWithRelations } from "@/hooks/queries/useProperties";
const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithRelations[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Pagination setup
  const pagination = usePagination(0, isMobile ? 10 : 20);
  
  // Optimized properties query with pagination
  const { data: propertyData, isLoading, error, refetch } = useOptimizedProperties({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  
  const properties = propertyData?.properties || [];
  const totalCount = propertyData?.total || 0;
  
  const deletePropertyMutation = useDeleteProperty();
  const updateProperty = useUpdateProperty();

  // Pull to refresh functionality with error handling
  const handleRefresh = async () => {
    try {
      await refetch();
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      console.error('Error refreshing properties:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh properties. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    resistanceRatio: 0.5
  });

  // Use filtered properties or fall back to status/search filtered
  const displayProperties = filteredProperties.length > 0 || searchTerm ? 
    filteredProperties : 
    properties.filter(p => showArchived ? true : (p.status === 'active' || !p.status))
      .filter(property => 
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Calculate summary stats (use total count from API)
  const activeProperties = properties.filter(p => p.status === 'active' || !p.status).length;
  const houseWatchingProperties = properties.filter(p => p.service_type === 'house_watching').length;
  const propertyManagementProperties = properties.filter(p => p.service_type === 'property_management' || !p.service_type).length;

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    setSelectedProperties(prev => 
      checked 
        ? [...prev, propertyId]
        : prev.filter(id => id !== propertyId)
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === displayProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(displayProperties.map(p => p.id));
    }
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setShowAddProperty(true);
  };

  const handleScheduleMaintenance = (property: any) => {
    console.log('Schedule maintenance for:', property);
  };

  const handleDeleteProperty = (property: any) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (propertyToDelete) {
      try {
        await deletePropertyMutation.mutateAsync(propertyToDelete.id);
        setIsDeleteDialogOpen(false);
        setPropertyToDelete(null);
        toast({
          title: "Property Deleted",
          description: "Property has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting property:', error);
        toast({
          title: "Error",
          description: "Failed to delete property. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  const handleArchiveProperty = async (property: any) => {
    try {
      await updateProperty.mutateAsync({ id: property.id, updates: { status: 'archived' } });
      toast({
        title: "Property Archived",
        description: "Property has been successfully archived.",
      });
    } catch (e) {
      console.error('Error archiving property:', e);
      toast({
        title: "Error",
        description: "Failed to archive property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnarchiveProperty = async (property: any) => {
    try {
      await updateProperty.mutateAsync({ id: property.id, updates: { status: 'active' } });
      toast({
        title: "Property Restored",
        description: "Property has been successfully restored.",
      });
    } catch (e) {
      console.error('Error unarchiving property:', e);
      toast({
        title: "Error",
        description: "Failed to restore property. Please try again.",
        variant: "destructive",
      });
    }
  };
  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6 safe-area-inset">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Unable to Load Properties</h3>
              <p className="text-muted-foreground mb-4">There was an error loading your properties.</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile-first responsive design
  if (isMobile) {
    return (
      <div 
        className="flex-1 p-4 safe-area-inset space-y-4 relative overflow-hidden"
        ref={pullToRefresh.bindToContainer}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Pull to Refresh Indicator */}
        <PullToRefreshIndicator
          isPulling={pullToRefresh.isPulling}
          isRefreshing={pullToRefresh.isRefreshing}
          pullDistance={pullToRefresh.pullDistance}
          canRelease={pullToRefresh.canRelease}
          threshold={80}
        />

        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Properties</h1>
            <p className="text-sm text-muted-foreground">{totalCount} properties</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </Button>
          </div>
        </div>

        {/* Mobile Content */}
        {activeTab === 'overview' ? (
          <MobilePropertyDashboard 
            onPropertyClick={handlePropertyClick}
            onAddProperty={() => setShowAddProperty(true)}
          />
        ) : (
          <Suspense fallback={<div className="flex items-center justify-center p-8">Loading reports...</div>}>
            <PropertyReportsDashboard />
          </Suspense>
        )}

        {/* Dialogs */}
        <StreamlinedAddPropertyDialog
          open={showAddProperty}
          onOpenChange={setShowAddProperty}
          editProperty={selectedProperty}
        />

        <PropertyDetailsDialogDB
          property={selectedProperty}
          open={showPropertyDetails}
          onOpenChange={setShowPropertyDetails}
          onEdit={(property) => {
            setSelectedProperty(property);
            setShowPropertyDetails(false);
            setShowEditProperty(true);
          }}
          onDelete={(property) => {
            setPropertyToDelete(property);
            setIsDeleteDialogOpen(true);
          }}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Property</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this property? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProperty}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 p-4 md:p-6 pb-24 md:pb-6 safe-area-inset space-y-6 relative overflow-hidden"
      ref={pullToRefresh.bindToContainer}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        isPulling={pullToRefresh.isPulling}
        isRefreshing={pullToRefresh.isRefreshing}
        pullDistance={pullToRefresh.pullDistance}
        canRelease={pullToRefresh.canRelease}
        threshold={80}
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage your property portfolio
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setActiveTab(activeTab === 'overview' ? 'reports' : 'overview')}
            aria-label={`Switch to ${activeTab === 'overview' ? 'reports' : 'overview'} view`}
          >
            {activeTab === 'overview' ? 'View Reports' : 'View Overview'}
          </Button>
          <Button 
            onClick={() => setShowAddProperty(true)}
            size={isMobile ? "default" : "sm"}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Desktop Content Tabs */}
      {activeTab === 'reports' ? (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Loading reports...</div>}>
          <PropertyReportsDashboard />
        </Suspense>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="min-h-[80px]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-success/10 rounded-lg shrink-0">
                    <Home className="h-4 w-4 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-success">{activeProperties}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[80px]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-info/10 rounded-lg shrink-0">
                    <Eye className="h-4 w-4 text-info" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-info">{houseWatchingProperties}</p>
                    <p className="text-xs text-muted-foreground">House Watching</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[80px]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-primary">{propertyManagementProperties}</p>
                    <p className="text-xs text-muted-foreground">Property Management</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[80px]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Building className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold">{totalCount}</p>
                    <p className="text-xs text-muted-foreground">Total Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Search and Filters */}
          <AdvancedSearchFilters 
            properties={properties}
            onFilterChange={setFilteredProperties}
            onSearchChange={setSearchTerm}
          />

          {/* Bulk Management Tools */}
          <BulkManagementTools 
            properties={displayProperties}
            selectedProperties={selectedProperties}
            onSelectionChange={setSelectedProperties}
            onRefresh={refetch}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="flex-1"
                  aria-label="Map view"
                  aria-pressed={viewMode === 'map'}
                >
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </Button>
              </div>
              
              {displayProperties.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedProperties.length === displayProperties.length && displayProperties.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select All ({displayProperties.length})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="show-archived" className="text-sm">Show archived</Label>
              <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            </div>
          </div>

          {/* Properties List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Properties</h2>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {displayProperties.length} properties shown
                </p>
                {selectedProperties.length > 0 && (
                  <Badge variant="secondary">
                    {selectedProperties.length} selected
                  </Badge>
                )}
              </div>
            </div>

            {viewMode === 'list' ? (
              <PropertyMobileTable
                properties={displayProperties}
                onPropertyClick={handlePropertyClick}
                onEdit={handleEdit}
                onScheduleMaintenance={handleScheduleMaintenance}
                onDelete={handleDeleteProperty}
                loading={isLoading}
              />
            ) : viewMode === 'map' ? (
              <Card>
                <CardContent className="p-3">
                  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading map...</div>}>
                    <PropertiesMap properties={displayProperties as any} />
                  </Suspense>
                </CardContent>
              </Card>
            ) : (
              // Grid View (mobile-optimized)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
                      <div className="aspect-video bg-muted animate-pulse rounded-t-lg" />
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : displayProperties.length === 0 ? (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center max-w-md">
                          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">
                            {searchTerm || filteredProperties.length > 0 ? 'No Properties Match Your Search' : 'No Properties Yet'}
                          </h3>
                          <p className="text-muted-foreground mb-4 text-sm">
                            {searchTerm || filteredProperties.length > 0 
                              ? 'Try adjusting your search criteria or filters to find properties.'
                              : 'Get started by adding your first property to begin managing your portfolio.'}
                          </p>
                          <div className="flex gap-2 justify-center">
                            {(searchTerm || filteredProperties.length > 0) ? (
                              <Button variant="outline" onClick={() => {
                                setSearchTerm('');
                                setFilteredProperties([]);
                              }}>
                                Clear Filters
                              </Button>
                            ) : (
                              <Button onClick={() => setShowAddProperty(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Property
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <>
                    {displayProperties.map((property) => (
                      <div key={property.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
                        <Card 
                          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow min-h-[44px] relative"
                          onClick={() => handlePropertyClick(property)}
                        >
                          {/* Selection checkbox */}
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedProperties.includes(property.id)}
                              onCheckedChange={(checked) => handlePropertySelection(property.id, checked as boolean)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white shadow-sm"
                            />
                          </div>

                          <div className="aspect-[4/3] bg-muted relative">
                            {/* Mobile actions menu */}
                            <div className="absolute top-2 right-2 z-10">
                              <MobilePropertyActions
                                property={property}
                                onView={() => handlePropertyClick(property)}
                                onEdit={() => handleEdit(property)}
                                onScheduleMaintenance={() => handleScheduleMaintenance(property)}
                                onArchive={() => handleArchiveProperty(property)}
                                onDelete={() => handleDeleteProperty(property)}
                              />
                            </div>

                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0]} 
                                alt={`Property at ${property.address}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                  e.currentTarget.alt = 'Property image unavailable';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            
                            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                              {/* Active status indicator using semantic colors */}
                              {(property.status === 'active' || !property.status) && (
                                <div className="w-3 h-3 bg-success rounded-full border-2 border-white shadow-sm"></div>
                              )}
                              
                              {/* Service type badge with initials */}
                              <Badge 
                                variant={property.service_type === 'house_watching' ? "secondary" : "default"} 
                                className="text-xs px-2 py-1 min-w-[32px] flex items-center justify-center"
                              >
                                {property.service_type === 'house_watching' ? 'HW' : 'PM'}
                              </Badge>
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
                      </div>
                    ))}
                  </>
                )}
                
                 {/* Pagination Controls */}
                {displayProperties.length > 0 && (
                  <div className="col-span-full mt-6">
                    <PaginationControls
                      page={pagination.page}
                      totalPages={pagination.totalPages}
                      pageSize={pagination.pageSize}
                      totalItems={totalCount}
                      startIndex={pagination.startIndex}
                      endIndex={pagination.endIndex}
                      onPageChange={pagination.goToPage}
                      onPageSizeChange={pagination.setPageSize}
                      canGoNext={pagination.canGoNext}
                      canGoPrevious={pagination.canGoPrevious}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
        </>
      )}

      {/* Dialogs */}
      <StreamlinedAddPropertyDialog 
        open={showAddProperty}
        onOpenChange={setShowAddProperty}
        editProperty={selectedProperty}
      />

      <PropertyDetailsDialogDB
        property={selectedProperty}
        open={showPropertyDetails}
        onOpenChange={setShowPropertyDetails}
        onEdit={(property) => {
          setSelectedProperty(property);
          setShowPropertyDetails(false);
          setShowEditProperty(true);
        }}
        onDelete={(property) => {
          setPropertyToDelete(property);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        open={showEditProperty}
        onOpenChange={setShowEditProperty}
        property={selectedProperty}
        onPropertyUpdated={() => {
          refetch();
        }}
      />

      {/* Delete Property Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.address}"? 
              This will permanently remove all property data and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProperty} className="bg-destructive hover:bg-destructive/90">
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Properties;