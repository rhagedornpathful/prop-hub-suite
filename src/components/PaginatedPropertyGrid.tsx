import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { useProperties } from '@/hooks/queries/useProperties';
import { useHouseWatching } from '@/hooks/queries/useHouseWatching';
import { Skeleton } from "@/components/ui/skeleton";

interface PaginatedPropertyGridProps {
  onRefresh?: () => void;
}

const ITEMS_PER_PAGE = 12;

export const PaginatedPropertyGrid: React.FC<PaginatedPropertyGridProps> = ({ onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: propertyData, isLoading: propertiesLoading } = useProperties(currentPage, ITEMS_PER_PAGE);
  const { data: houseWatchingProperties = [], isLoading: houseWatchingLoading } = useHouseWatching();
  
  const properties = propertyData?.properties || [];
  const totalProperties = propertyData?.total || 0;
  const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);
  
  const isLoading = propertiesLoading || houseWatchingLoading;

  // Scroll to top when page changes
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Convert data to unified format for PropertyCard
  const unifiedProperties = [
    ...properties.map(property => ({
      id: property.id,
      type: 'property_management' as const,
      address: property.address,
      displayAddress: `${property.city}, ${property.state} ${property.zip_code}`,
      status: property.status,
      images: property.images,
      propertyData: property,
    })),
    ...houseWatchingProperties.map(hw => ({
      id: hw.id,
      type: 'house_watching' as const,
      address: hw.property_address,
      displayAddress: hw.property_address,
      status: hw.status,
      images: null,
      houseWatchingData: hw,
    }))
  ];

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-10"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="flex items-center px-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center px-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {unifiedProperties.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground">
              {currentPage === 1 
                ? "Get started by adding your first property"
                : "No properties found on this page"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unifiedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          {renderPagination()}
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalProperties)} of {totalProperties} properties
          </div>
        </>
      )}
    </div>
  );
};