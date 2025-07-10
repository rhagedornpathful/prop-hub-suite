import { useState, useCallback, lazy, Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { CombinedPropertyOverview } from "@/components/CombinedPropertyOverview";
import { DashboardHeader } from "@/components/DashboardHeader";
import { QuickActions } from "@/components/QuickActions";
import { BusinessSummary } from "@/components/BusinessSummary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";

// Lazy load dialogs for better performance
const AddPropertyDialog = lazy(() => import("@/components/AddPropertyDialog").then(module => ({ default: module.AddPropertyDialog })));
const AddTenantDialog = lazy(() => import("@/components/AddTenantDialog").then(module => ({ default: module.AddTenantDialog })));
const ScheduleMaintenanceDialog = lazy(() => import("@/components/ScheduleMaintenanceDialog").then(module => ({ default: module.ScheduleMaintenanceDialog })));

const Index = () => {
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const { notificationCount } = useNotifications();

  // Memoized dialog handlers for performance
  const handleAddProperty = useCallback(() => setAddPropertyOpen(true), []);
  const handleAddTenant = useCallback(() => setAddTenantOpen(true), []);
  const handleScheduleMaintenance = useCallback(() => setScheduleMaintenanceOpen(true), []);
  const handleClosePropertyDialog = useCallback(() => setAddPropertyOpen(false), []);
  const handleCloseTenantDialog = useCallback(() => setAddTenantOpen(false), []);
  const handleCloseMaintenanceDialog = useCallback(() => setScheduleMaintenanceOpen(false), []);

  // Search and filter handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Here you would implement actual search logic
    console.log('Searching for:', query);
  }, []);

  const handleFilterChange = useCallback((filters: string[]) => {
    setSelectedFilters(filters);
    // Here you would implement actual filtering logic
    console.log('Applying filters:', filters);
  }, []);

  // Loading fallback for lazy components
  const DialogSkeleton = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={true} style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }>
        <div className="min-h-screen flex w-full bg-gradient-subtle">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <DashboardHeader
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              notificationCount={notificationCount}
            />

            {/* Main Content */}
            <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-8">
                <ErrorBoundary>
                  <QuickActions 
                    onAddProperty={handleAddProperty}
                    onAddTenant={handleAddTenant}
                    onScheduleMaintenance={handleScheduleMaintenance}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <DashboardMetrics />
                </ErrorBoundary>

                <ErrorBoundary>
                  <CombinedPropertyOverview />
                </ErrorBoundary>

                <ErrorBoundary>
                  <BusinessSummary />
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
        
        {/* Lazy-loaded Dialogs */}
        {addPropertyOpen && (
          <Suspense fallback={<DialogSkeleton />}>
            <AddPropertyDialog 
              open={addPropertyOpen} 
              onOpenChange={handleClosePropertyDialog} 
            />
          </Suspense>
        )}
        
        {addTenantOpen && (
          <Suspense fallback={<DialogSkeleton />}>
            <AddTenantDialog 
              open={addTenantOpen} 
              onOpenChange={handleCloseTenantDialog} 
            />
          </Suspense>
        )}
        
        {scheduleMaintenanceOpen && (
          <Suspense fallback={<DialogSkeleton />}>
            <ScheduleMaintenanceDialog 
              open={scheduleMaintenanceOpen} 
              onOpenChange={handleCloseMaintenanceDialog} 
            />
          </Suspense>
        )}
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Index;
