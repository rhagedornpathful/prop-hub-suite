import { useState, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CommandPalette } from "@/components/CommandPalette";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useNavigationSwipes } from "@/hooks/useSwipeGestures";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminDashboard } from "@/pages/dashboards/AdminDashboard";
import PropertyOwnerDashboard from "@/pages/dashboards/PropertyOwnerDashboard";
import { TenantDashboard } from "@/pages/dashboards/TenantDashboard";
import HouseWatcherDashboard from "@/pages/dashboards/HouseWatcherDashboard";
import { PropertyManagerDashboard } from "@/pages/dashboards/PropertyManagerDashboard";
import { MakeAdminButton } from "@/components/dev/MakeAdminButton";
import { SearchProvider, useSearchContext } from "@/contexts/SearchContext";
import { QuickActions } from "@/components/QuickActions";
import { RealTimeNotificationSystem } from "@/components/RealTimeNotificationSystem";
import { useRealtime } from "@/hooks/useRealtime";

// Lazy load dialogs for better performance
const AddPropertyDialog = lazy(() => import("@/components/AddPropertyDialog").then(module => ({ default: module.AddPropertyDialog })));
const AddTenantDialog = lazy(() => import("@/components/AddTenantDialog").then(module => ({ default: module.AddTenantDialog })));
const ScheduleMaintenanceDialog = lazy(() => import("@/components/ScheduleMaintenanceDialog").then(module => ({ default: module.ScheduleMaintenanceDialog })));

const IndexContent = () => {
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const { setSearchQuery, setSelectedFilters } = useSearchContext();
  
  const { notificationCount } = useNotifications();
  const { isMobile } = useMobileDetection();
  const { userRole, loading: authLoading } = useUserRole();
  
  // Initialize real-time updates
  useRealtime();

  const navigate = useNavigate();

  // Memoized dialog handlers for performance
  const handleAddProperty = useCallback(() => setAddPropertyOpen(true), []);
  const handleAddTenant = useCallback(() => setAddTenantOpen(true), []);
  const handleScheduleMaintenance = useCallback(() => setScheduleMaintenanceOpen(true), []);
  const handleClosePropertyDialog = useCallback(() => setAddPropertyOpen(false), []);
  const handleCloseTenantDialog = useCallback(() => setAddTenantOpen(false), []);
  const handleCloseMaintenanceDialog = useCallback(() => setScheduleMaintenanceOpen(false), []);

  const openMessages = useCallback(() => navigate('/messages'), [navigate]);
  const openDocuments = useCallback(() => navigate('/documents'), [navigate]);

  // Search and filter handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((filters: string[]) => {
    setSelectedFilters(filters);
  }, [setSelectedFilters]);

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

  // Swipe navigation for mobile
  const swipeBinds = useNavigationSwipes(
    () => console.log('Next section'), // Could navigate to next tab
    () => console.log('Previous section'), // Could navigate to previous tab
    isMobile
  );

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

  // Render role-specific dashboard content
  const renderDashboardContent = () => {
    console.log('🎯 Rendering dashboard for role:', userRole, 'loading:', authLoading);
    
    if (authLoading) {
      console.log('🎯 Still loading auth, showing skeleton');
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      );
    }

    // If no role, show message
    if (!userRole) {
      console.log('🎯 No role found, showing setup message');
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="text-muted-foreground mb-6">
            Please complete your account setup to access your dashboard.
          </p>
          <MakeAdminButton />
        </div>
      );
    }

    console.log('🎯 Rendering dashboard for role:', userRole);
    
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'owner_investor':
        return <PropertyOwnerDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      case 'house_watcher':
        return <HouseWatcherDashboard />;
      case 'property_manager':
        return <PropertyManagerDashboard />;
      case 'client':
        return <TenantDashboard />; // Clients see tenant view
      case 'contractor':
        return <TenantDashboard />; // Contractors see tenant view
      case 'leasing_agent':
        return <AdminDashboard />; // Leasing agents see admin view
      default:
        console.log('🎯 Unknown role, showing default dashboard');
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Role: {userRole || 'None'} - Contact your administrator for proper role assignment.
            </p>
            <MakeAdminButton />
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-w-0">
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
            <div {...swipeBinds()}>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Only show MakeAdminButton if user has no role */}
                  {!userRole && <MakeAdminButton />}
                  
                  <ErrorBoundary>
                    {renderDashboardContent()}
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </PullToRefresh>
        </main>
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
            onTenantAdded={handleCloseTenantDialog} 
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
        shortcuts={shortcuts}
        isOpen={isHelpOpen}
        onClose={closeHelp}
      />
      
      {/* Quick Actions Floating Button */}
      <QuickActions
        onAddProperty={handleAddProperty}
        onAddTenant={handleAddTenant}
        onScheduleMaintenance={handleScheduleMaintenance}
        onOpenMessages={openMessages}
        onOpenDocuments={openDocuments}
      />
    </ErrorBoundary>
  );
};

const Index = () => {
  return (
    <SearchProvider>
      <IndexContent />
    </SearchProvider>
  );
};

export default Index;
