import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

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
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppWrapper } from "@/components/AppWrapper";

import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { MobileNavigation } from "@/components/MobileNavigation";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Tenants from "./pages/Tenants";
import Leases from "./pages/Leases";
import Finances from "./pages/Finances";
import Maintenance from "./pages/Maintenance";
import Messages from "./pages/Messages";
import Services from "./pages/Services";
import ServiceManagement from "./pages/ServiceManagement";
import HouseWatching from "./pages/HouseWatching";
import HouseWatcherDetail from "./pages/HouseWatcherDetail";
import HouseWatcherHome from "./pages/HouseWatcherHome";
import HouseWatcherProperties from "./pages/HouseWatcherProperties";
import HouseWatcherSettings from "./pages/HouseWatcherSettings";
import PropertyManagerHome from "./pages/PropertyManagerHome";
import PropertyManagerProperties from "./pages/PropertyManagerProperties";
import PropertyManagerSettings from "./pages/PropertyManagerSettings";
import PropertyCheck from "./pages/PropertyCheck";
import HomeCheck from "./pages/HomeCheck";
import HouseWatcherMobileDashboard from "./pages/dashboards/HouseWatcherMobileDashboard";
import PropertyManagerMobileDashboard from "./pages/dashboards/PropertyManagerMobileDashboard";
import HouseWatcherMobileChecks from "./pages/HouseWatcherMobileChecks";
import PropertyManagerMobileMaintenance from "./pages/PropertyManagerMobileMaintenance";
import MobileBottomNavigation from "./components/mobile/MobileBottomNavigation";
import Documents from "./pages/Documents";
import UserManagement from "./pages/UserManagement";
import DevTools from "./pages/DevTools";
import Payments from "./pages/Payments";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import VendorPortalPage from "./pages/VendorPortal";
import MarketingLeasingPage from "./pages/MarketingLeasing";
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
import PropertyManagerView from "./pages/PropertyManagerView";
import CheckTemplates from "./pages/admin/CheckTemplates";
import { ProfileSetup } from "./components/ProfileSetup";



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
                    <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">{/* Add mobile bottom padding */}
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
    <RoleBasedAccess allowedRoles={['admin','owner_investor','tenant','property_manager']}>
      <Finances />
    </RoleBasedAccess>
  </PageTransition>
} />
<Route path="/maintenance" element={
  <PageTransition>
    <RoleBasedAccess allowedRoles={['admin','property_manager','owner_investor','tenant']}>
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
                            <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                              <PropertyCheck />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
                        <Route path="/property-manager-dashboard" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                              <PropertyManagerView />
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
                        <Route path="/payments" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                              <Payments />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/vendor-portal" element={<VendorPortalPage />} />
            <Route path="/marketing-leasing" element={<MarketingLeasingPage />} />
                         <Route path="/messages" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                               <Messages />
                             </RoleBasedAccess>
                           </PageTransition>
                         } />
                          <Route path="/services" element={
                            <PageTransition>
                              <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ALL_ROLES}>
                                <Services />
                              </RoleBasedAccess>
                            </PageTransition>
                          } />
                          <Route path="/service-management" element={
                            <PageTransition>
                              <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                                <ServiceManagement />
                              </RoleBasedAccess>
                            </PageTransition>
                          } />
                        <Route path="/property-check/:id" element={
                          <PageTransition>
                            <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                              <PropertyCheck />
                            </RoleBasedAccess>
                          </PageTransition>
                        } />
<Route path="/home-check/:id" element={
  <PageTransition>
    <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
      <HomeCheck />
    </RoleBasedAccess>
  </PageTransition>
 } />
 <Route path="/house-watcher/check/:id" element={
  <PageTransition>
    <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
      <HomeCheck />
    </RoleBasedAccess>
  </PageTransition>
} />
                         <Route path="/house-watcher-home" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                               <HouseWatcherHome />
                             </RoleBasedAccess>
                           </PageTransition>
                         } />
                         <Route path="/house-watcher-properties" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                               <HouseWatcherProperties />
                             </RoleBasedAccess>
                            </PageTransition>
                          } />
                           <Route path="/house-watcher-settings" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                                 <HouseWatcherSettings />
                               </RoleBasedAccess>
                             </PageTransition>
                           } />
                           <Route path="/house-watcher/dashboard" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                                 <HouseWatcherMobileDashboard />
                               </RoleBasedAccess>
                             </PageTransition>
                            } />
                            <Route path="/house-watcher/new-check" element={
                              <PageTransition>
                                <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                                  <HouseWatcherMobileChecks />
                                </RoleBasedAccess>
                              </PageTransition>
                            } />
                            <Route path="/house-watcher/property/:propertyId" element={
                              <PageTransition>
                                <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                                  <PropertyDetail />
                                </RoleBasedAccess>
                              </PageTransition>
                            } />
                            <Route path="/house-watcher/checks" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
                                 <HouseWatcherMobileChecks />
                               </RoleBasedAccess>
                             </PageTransition>
                           } />
                          <Route path="/property-manager-home" element={
                            <PageTransition>
                              <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                                <PropertyManagerHome />
                              </RoleBasedAccess>
                            </PageTransition>
                          } />
                          <Route path="/property-manager-properties" element={
                            <PageTransition>
                              <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                                <PropertyManagerProperties />
                              </RoleBasedAccess>
                            </PageTransition>
                          } />
                           <Route path="/property-manager-settings" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                                 <PropertyManagerSettings />
                               </RoleBasedAccess>
                             </PageTransition>
                           } />
                           <Route path="/property-manager/dashboard" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                                 <PropertyManagerMobileDashboard />
                               </RoleBasedAccess>
                             </PageTransition>
                           } />
                           <Route path="/property-manager/maintenance" element={
                             <PageTransition>
                               <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
                                 <PropertyManagerMobileMaintenance />
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
                         <Route path="/profile" element={<PageTransition><ProfileSetup /></PageTransition>} />
                         <Route path="/admin-navigation" element={
                           <PageTransition>
                             <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                               <AdminNavigation />
                             </RoleBasedAccess>
                            </PageTransition>
                          } />
                          <Route path="/admin/check-templates" element={
                            <PageTransition>
                              <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
                                <CheckTemplates />
                              </RoleBasedAccess>
                            </PageTransition>
                          } />
                        <Route path="/client-portal" element={<PageTransition><ClientDashboard /></PageTransition>} />
                        <Route path="/client-portal/properties" element={<PageTransition><ClientProperties /></PageTransition>} />
                        <Route path="/client-portal/reports" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/reports/:reportId" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/requests" element={<PageTransition><ClientRequests /></PageTransition>} />
                        <Route path="/client-portal/messages" element={<PageTransition><ClientMessages /></PageTransition>} />
                        {import.meta.env.DEV && (
                          <Route path="/dev-tools" element={<PageTransition><DevTools /></PageTransition>} />
                        )}
                        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                      </Routes>
                    </main>
                  </div>
<RoleBasedAccess allowedRoles={['admin','property_manager','owner_investor','tenant','client','contractor','leasing_agent']}>
  <MobileNavigation />
</RoleBasedAccess>
                  <MobileBottomNavigation />
                  
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
          
        </BrowserRouter>
      </TooltipProvider>
    
  </ViewAsProvider>
</DevAdminProvider>
</AuthProvider>
    </ErrorBoundary>
  );
};

const App = () => <AppContent />;

export default App;
