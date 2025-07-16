import { PropertyCard } from "@/components/PropertyCard";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { PropertyWithRelations } from "@/hooks/queries/useProperties";
import type { Tables } from "@/integrations/supabase/types";

type HouseWatchingProperty = Tables<'house_watching'>;

interface UnifiedPropertyData {
  id: string;
  type: 'property_management' | 'house_watching';
  address: string;
  displayAddress?: string;
  status: string | null;
  images?: string[] | null;
  propertyData?: PropertyWithRelations;
  houseWatchingData?: HouseWatchingProperty;
}

interface OptimizedPropertyGridProps {
  properties?: PropertyWithRelations[];
  houseWatchingProperties?: HouseWatchingProperty[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function OptimizedPropertyGrid({ 
  properties = [], 
  houseWatchingProperties = [], 
  isLoading, 
  onRefresh 
}: OptimizedPropertyGridProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Transform data into unified format
  const transformedProperties: UnifiedPropertyData[] = [
    // Properties from properties table - check service_type to determine actual type
    ...properties.map(property => {
      const determinedType: 'property_management' | 'house_watching' = property.service_type === 'house_watching' ? 'house_watching' : 'property_management';
      
      // Add visible debugging for the specific property
      if (property.address === '2168 Falls Manor') {
        console.log('🔍 2168 Falls Manor transformation:', {
          id: property.id,
          address: property.address,
          service_type: property.service_type,
          determined_type: determinedType,
          raw_property: property
        });
      }
      
      return {
        id: property.id,
        type: determinedType,
        address: property.address,
        displayAddress: `${property.city}, ${property.state}`,
        status: property.status,
        images: property.images,
        propertyData: property.service_type !== 'house_watching' ? property : undefined,
        houseWatchingData: property.service_type === 'house_watching' ? {
          id: property.id,
          property_address: property.address,
          owner_name: property.property_owner?.first_name && property.property_owner?.last_name 
            ? `${property.property_owner.first_name} ${property.property_owner.last_name}`
            : property.property_owner?.company_name || 'Unknown Owner',
          status: property.status,
          check_frequency: 'weekly',
          monthly_fee: property.monthly_rent || null,
          created_at: property.created_at,
          updated_at: property.updated_at,
          user_id: property.user_id,
          notes: property.description || null,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          next_check_date: property.next_check_date,
          last_check_date: property.last_check_date,
          key_location: null,
          emergency_contact: null,
          special_instructions: null,
          owner_contact: null,
        } : undefined,
      };
    }),
    // House Watching properties from house_watching table
    ...houseWatchingProperties.map(property => {
      console.log('🏠 House watching table property:', {
        id: property.id,
        address: property.property_address,
        type: 'house_watching'
      });
      
      return {
        id: property.id,
        type: 'house_watching' as const,
        address: property.property_address,
        displayAddress: property.property_address,
        status: property.status,
        images: null,
        houseWatchingData: property,
      };
    })
  ];

  console.log('🔄 All transformed properties:', transformedProperties.map(p => ({
    id: p.id,
    address: p.address,
    type: p.type,
    hasPropertyData: !!p.propertyData,
    hasHouseWatchingData: !!p.houseWatchingData
  })));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Properties</h2>
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (transformedProperties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Properties</h2>
            <p className="text-muted-foreground">No properties found</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <p>You haven't added any properties yet.</p>
            <p>Get started by adding your first property.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Properties</h2>
          <p className="text-muted-foreground">
            {transformedProperties.length} {transformedProperties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transformedProperties.map((property) => (
          <PropertyCard 
            key={`${property.type}-${property.id}`} 
            property={property} 
          />
        ))}
      </div>
      
      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPropertyAdded={() => {
          setIsAddDialogOpen(false);
          onRefresh?.();
          toast({
            title: "Success",
            description: "Property added successfully!",
          });
        }}
      />
    </div>
  );
}