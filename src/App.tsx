import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RoleBasedAccess, ROLE_COMBINATIONS } from "@/components/RoleBasedAccess";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { DevAdminProvider } from "@/contexts/DevAdminContext";
import { ViewAsProvider } from "@/contexts/ViewAsContext";
import { ViewAsBanner } from "@/components/ViewAsBanner";
import { EmergencyAdminBanner } from "@/components/EmergencyAdminBanner";
import { DevAdminToggle } from "@/components/dev/DevAdminToggle";
import { DebugPanel } from "@/components/dev/DebugPanel";
import { RoleDebugger } from "@/components/dev/RoleDebugger";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SimplePerformanceMonitor } from "@/components/SimplePerformanceMonitor";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Tenants from "./pages/Tenants";
import Leases from "./pages/Leases";
import Finances from "./pages/Finances";
import Maintenance from "./pages/Maintenance";
import Messages from "./pages/Messages";
import HouseWatching from "./pages/HouseWatching";
import HouseWatcherDetail from "./pages/HouseWatcherDetail";
import PropertyCheck from "./pages/PropertyCheck";
import Documents from "./pages/Documents";
import UserManagement from "./pages/UserManagement";
import DevTools from "./pages/DevTools";
import Settings from "./pages/Settings";
import ClientDashboard from "./pages/ClientPortal/Dashboard";
import ClientProperties from "./pages/ClientPortal/Properties";
import ClientReports from "./pages/ClientPortal/Reports";
import ClientRequests from "./pages/ClientPortal/Requests";
import ClientMessages from "./pages/ClientPortal/Messages";
import AdminEmergency from "./pages/AdminEmergency";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import PropertyOwners from "./pages/PropertyOwners";
import PropertyOwnerDetail from "./pages/PropertyOwnerDetail";
import AdminNavigation from "./pages/AdminNavigation";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isMobile } = useMobileDetection();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Get persisted state from localStorage on initial load
    const persistedState = localStorage.getItem('sidebar-state');
    if (persistedState !== null) {
      return JSON.parse(persistedState);
    }
    return !isMobile;
  });

  const handleSidebarOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    localStorage.setItem('sidebar-state', JSON.stringify(open));
  };

  logger.info("App initialized");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DevAdminProvider>
          <ViewAsProvider>
            <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <EmergencyAdminBanner />
                <ViewAsBanner />
          <Routes>
            {/* Public Auth Route - Always accessible */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Emergency Admin Route - Bypasses all authentication */}
            <Route path="/admin-emergency" element={<AdminEmergency />} />
            
            {/* Setup Route - Always accessible for first admin setup */}
            <Route path="/setup" element={<Setup />} />
            
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider 
                  open={sidebarOpen}
                  onOpenChange={handleSidebarOpenChange}
                  style={{
                    "--sidebar-width": isMobile ? "100vw" : "18rem",
                    "--sidebar-width-icon": "3rem",
                  } as React.CSSProperties}
                >
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-w-0">{/* Remove redundant classes */}
                      <Routes>
                        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                        <Route path="/properties" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.PROPERTY_MANAGEMENT}>
                              <Properties />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/properties/:id" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={[...ROLE_COMBINATIONS.PROPERTY_MANAGEMENT, ...ROLE_COMBINATIONS.HOUSE_WATCHING]}>
                              <PropertyDetail />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/property-owners" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                              <PropertyOwners />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/tenants" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.PROPERTY_MANAGEMENT}>
                              <Tenants />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/user-management" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                              <UserManagement />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/leases" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Leases />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/finances" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Finances />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/maintenance" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Maintenance />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/house-watching" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.HOUSE_WATCHING}>
                              <HouseWatching />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/house-watchers/:id" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.HOUSE_WATCHING}>
                              <HouseWatcherDetail />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/property-check" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.HOUSE_WATCHING}>
                              <PropertyCheck />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/documents" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Documents />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/messages" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Messages />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/property-check/:id" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.HOUSE_WATCHING}>
                              <PropertyCheck />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                         <Route path="/property-owners/:ownerId" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                               <PropertyOwnerDetail />
                             </RoleBasedAccess>
                           </PageTransition>
                         } />
                         <Route path="/activity" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                               <Activity />
                             </RoleBasedAccess>
                           </PageTransition>
                         } />
                         <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                         <Route path="/admin-navigation" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                               <AdminNavigation />
                             </RoleBasedAccess>
                           </PageTransition>
                         } />
                        <Route path="/client-portal" element={<PageTransition><ClientDashboard /></PageTransition>} />
                        <Route path="/client-portal/properties" element={<PageTransition><ClientProperties /></PageTransition>} />
                        <Route path="/client-portal/reports" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/reports/:reportId" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/requests" element={<PageTransition><ClientRequests /></PageTransition>} />
                        <Route path="/client-portal/messages" element={<PageTransition><ClientMessages /></PageTransition>} />
                        {process.env.NODE_ENV === 'development' && (
                          <Route path="/dev-tools" element={<PageTransition><DevTools /></PageTransition>} />
                        )}
                        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                      </Routes>
                    </main>
                  </div>
                  {config.isDevelopment && <SimplePerformanceMonitor />}
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Development Tools */}
          <DevAdminToggle />
          <DebugPanel />
          <RoleDebugger />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ViewAsProvider>
</DevAdminProvider>
</AuthProvider>
    </ErrorBoundary>
  );
};

const App = () => <AppContent />;

export default App;
