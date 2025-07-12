import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Leases from "./pages/Leases";
import Finances from "./pages/Finances";
import Maintenance from "./pages/Maintenance";
import Messages from "./pages/Messages";
import HouseWatching from "./pages/HouseWatching";
import PropertyCheck from "./pages/PropertyCheck";
import Documents from "./pages/Documents";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import ClientDashboard from "./pages/ClientPortal/Dashboard";
import ClientProperties from "./pages/ClientPortal/Properties";
import ClientReports from "./pages/ClientPortal/Reports";
import ClientRequests from "./pages/ClientPortal/Requests";
import ClientMessages from "./pages/ClientPortal/Messages";
import Auth from "./pages/Auth";
import PropertyOwners from "./pages/PropertyOwners";
import PropertyOwnerDetail from "./pages/PropertyOwnerDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isMobile } = useMobileDetection();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Demo Routes - Temporarily accessible without auth */}
            <Route path="/demo/*" element={
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                  <Route path="/properties" element={<PageTransition><Properties /></PageTransition>} />
                  <Route path="/tenants" element={<PageTransition><Tenants /></PageTransition>} />
                  <Route path="/leases" element={<PageTransition><Leases /></PageTransition>} />
                  <Route path="/finances" element={<PageTransition><Finances /></PageTransition>} />
                  <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
                  <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
                  <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
                  <Route path="/house-watching" element={<PageTransition><HouseWatching /></PageTransition>} />
                  <Route path="/property-check/:id" element={<PageTransition><PropertyCheck /></PageTransition>} />
                  <Route path="/property-owners" element={<PageTransition><PropertyOwners /></PageTransition>} />
                  <Route path="/user-management" element={<PageTransition><UserManagement /></PageTransition>} />
                  <Route path="/property-owners/:ownerId" element={<PageTransition><PropertyOwnerDetail /></PageTransition>} />
                  <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                  <Route path="/client-portal" element={<PageTransition><ClientDashboard /></PageTransition>} />
                  <Route path="/client-portal/properties" element={<PageTransition><ClientProperties /></PageTransition>} />
                  <Route path="/client-portal/reports" element={<PageTransition><ClientReports /></PageTransition>} />
                  <Route path="/client-portal/reports/:reportId" element={<PageTransition><ClientReports /></PageTransition>} />
                  <Route path="/client-portal/requests" element={<PageTransition><ClientRequests /></PageTransition>} />
                  <Route path="/client-portal/messages" element={<PageTransition><ClientMessages /></PageTransition>} />
                </Routes>
              </div>
            } />
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider 
                  defaultOpen={!isMobile}
                  style={{
                    "--sidebar-width": isMobile ? "100vw" : "18rem",
                    "--sidebar-width-icon": "3rem",
                  } as React.CSSProperties}
                >
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
                      <Routes>
                        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                        <Route path="/properties" element={<PageTransition><Properties /></PageTransition>} />
                        <Route path="/tenants" element={<PageTransition><Tenants /></PageTransition>} />
                        <Route path="/leases" element={<PageTransition><Leases /></PageTransition>} />
                        <Route path="/finances" element={<PageTransition><Finances /></PageTransition>} />
                        <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
                        <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
                        <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
                        <Route path="/house-watching" element={<PageTransition><HouseWatching /></PageTransition>} />
                        <Route path="/property-check/:id" element={<PageTransition><PropertyCheck /></PageTransition>} />
                        <Route path="/property-owners" element={<PageTransition><PropertyOwners /></PageTransition>} />
                        <Route path="/user-management" element={<PageTransition><UserManagement /></PageTransition>} />
                        <Route path="/property-owners/:ownerId" element={<PageTransition><PropertyOwnerDetail /></PageTransition>} />
                        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                        <Route path="/client-portal" element={<PageTransition><ClientDashboard /></PageTransition>} />
                        <Route path="/client-portal/properties" element={<PageTransition><ClientProperties /></PageTransition>} />
                        <Route path="/client-portal/reports" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/reports/:reportId" element={<PageTransition><ClientReports /></PageTransition>} />
                        <Route path="/client-portal/requests" element={<PageTransition><ClientRequests /></PageTransition>} />
                        <Route path="/client-portal/messages" element={<PageTransition><ClientMessages /></PageTransition>} />
                        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
