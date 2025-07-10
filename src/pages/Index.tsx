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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useMobileDetection } from "@/hooks/useMobileDetection";

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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const { notificationCount } = useNotifications();
  const { isMobile } = useMobileDetection();

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

  // Keyboard shortcuts setup
  const shortcuts = [
    {
      key: 'k',
      ctrlKey: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
      section: 'Navigation'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: handleAddProperty,
      description: 'Add new property', 
      section: 'Quick Actions'
    },
    {
      key: 't',
      ctrlKey: true,
      action: handleAddTenant,
      description: 'Add new tenant',
      section: 'Quick Actions'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: handleScheduleMaintenance,
      description: 'Schedule maintenance',
      section: 'Quick Actions'
    }
  ];

  const { isHelpOpen, closeHelp } = useKeyboardShortcuts(shortcuts);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Here you would typically refetch data
    console.log('Refreshing data...');
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
            <main id="main-content" className="flex-1 overflow-auto">
              <PullToRefresh 
                onRefresh={handleRefresh}
                className="h-full"
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="max-w-7xl mx-auto">
                    <AnimatedList className="space-y-4 sm:space-y-6 lg:space-y-8" staggerDelay={0.1}>
                  <AnimatedListItem>
                    <ErrorBoundary>
                      <QuickActions 
                        onAddProperty={handleAddProperty}
                        onAddTenant={handleAddTenant}
                        onScheduleMaintenance={handleScheduleMaintenance}
                      />
                    </ErrorBoundary>
                  </AnimatedListItem>

                  <AnimatedListItem>
                    <ErrorBoundary>
                      <DashboardMetrics />
                    </ErrorBoundary>
                  </AnimatedListItem>

                  <AnimatedListItem>
                    <ErrorBoundary>
                      <CombinedPropertyOverview />
                    </ErrorBoundary>
                  </AnimatedListItem>

                  <AnimatedListItem>
                    <ErrorBoundary>
                      <BusinessSummary />
                    </ErrorBoundary>
                  </AnimatedListItem>
                    </AnimatedList>
                  </div>
                </div>
              </PullToRefresh>
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
        
        {/* Global Features */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          onAddProperty={handleAddProperty}
          onAddTenant={handleAddTenant}
          onScheduleMaintenance={handleScheduleMaintenance}
        />
        
        <KeyboardShortcutsHelp
          isOpen={isHelpOpen}
          onOpenChange={closeHelp}
        />
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Index;
