import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import ClientDashboard from "./pages/ClientPortal/Dashboard";
import ClientProperties from "./pages/ClientPortal/Properties";
import ClientReports from "./pages/ClientPortal/Reports";
import ClientRequests from "./pages/ClientPortal/Requests";
import ClientMessages from "./pages/ClientPortal/Messages";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/tenants" element={<Tenants />} />
                    <Route path="/leases" element={<Leases />} />
                    <Route path="/finances" element={<Finances />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/house-watching" element={<HouseWatching />} />
                    <Route path="/property-check/:id" element={<PropertyCheck />} />
                    <Route path="/client-portal" element={<ClientDashboard />} />
                    <Route path="/client-portal/properties" element={<ClientProperties />} />
                    <Route path="/client-portal/reports" element={<ClientReports />} />
                    <Route path="/client-portal/reports/:reportId" element={<ClientReports />} />
                    <Route path="/client-portal/requests" element={<ClientRequests />} />
                    <Route path="/client-portal/messages" element={<ClientMessages />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          } />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/properties" element={<Properties />} />
                      <Route path="/tenants" element={<Tenants />} />
                      <Route path="/leases" element={<Leases />} />
                      <Route path="/finances" element={<Finances />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/house-watching" element={<HouseWatching />} />
                      <Route path="/property-check/:id" element={<PropertyCheck />} />
                      <Route path="/client-portal" element={<ClientDashboard />} />
                      <Route path="/client-portal/properties" element={<ClientProperties />} />
                      <Route path="/client-portal/reports" element={<ClientReports />} />
                      <Route path="/client-portal/reports/:reportId" element={<ClientReports />} />
                      <Route path="/client-portal/requests" element={<ClientRequests />} />
                      <Route path="/client-portal/messages" element={<ClientMessages />} />
                      <Route path="*" element={<NotFound />} />
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

export default App;
