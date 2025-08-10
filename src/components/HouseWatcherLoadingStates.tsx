import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PropertyCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

export const ScheduleCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </CardContent>
    </Card>

    {/* Schedule */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      {[...Array(3)].map((_, i) => (
        <ScheduleCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const PropertiesGridSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Search */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  </div>
);