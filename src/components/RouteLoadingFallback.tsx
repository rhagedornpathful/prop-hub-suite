import { Skeleton } from "@/components/ui/skeleton";

export const RouteLoadingFallback = () => (
  <div className="container mx-auto p-6 space-y-4 animate-pulse">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);
