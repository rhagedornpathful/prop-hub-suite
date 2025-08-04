import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyCardSkeleton = () => {
  return (
    <Card className="group overflow-hidden cursor-pointer rounded-lg p-4 min-h-[120px] animate-pulse">
      <div className="relative">
        {/* Image placeholder */}
        <Skeleton className="w-full h-48 rounded-lg" />
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-16" />
        </div>
        
        {/* Service type badge */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      
      <CardHeader className="pb-3 p-0 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Property address */}
            <Skeleton className="h-5 w-3/4 mb-2" />
            
            {/* Display address with icon */}
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            
            {/* Owner info */}
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          
          {/* Actions dropdown */}
          <Skeleton className="h-11 w-11 rounded" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-0 mt-4">
        <div className="space-y-4">
          {/* Property details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          
          {/* Additional details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          
          {/* Maintenance summary placeholder */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="border-t border-border/50 pt-4 mt-4">
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="flex-1 h-11" />
              <Skeleton className="flex-1 h-11" />
              <Skeleton className="flex-1 h-11" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PropertyCardSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};