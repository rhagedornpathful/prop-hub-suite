import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import HouseWatching from "./pages/HouseWatching";
import PropertyCheck from "./pages/PropertyCheck";
import ClientDashboard from "./pages/ClientPortal/Dashboard";
import ClientProperties from "./pages/ClientPortal/Properties";
import ClientReports from "./pages/ClientPortal/Reports";
import ClientRequests from "./pages/ClientPortal/Requests";
import ClientMessages from "./pages/ClientPortal/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
        <Route path="/house-watching" element={<ProtectedRoute><HouseWatching /></ProtectedRoute>} />
        <Route path="/property-check/:id" element={<ProtectedRoute><PropertyCheck /></ProtectedRoute>} />
        <Route path="/client-portal" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client-portal/properties" element={<ProtectedRoute><ClientProperties /></ProtectedRoute>} />
        <Route path="/client-portal/reports" element={<ProtectedRoute><ClientReports /></ProtectedRoute>} />
        <Route path="/client-portal/reports/:reportId" element={<ProtectedRoute><ClientReports /></ProtectedRoute>} />
        <Route path="/client-portal/requests" element={<ProtectedRoute><ClientRequests /></ProtectedRoute>} />
        <Route path="/client-portal/messages" element={<ProtectedRoute><ClientMessages /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
