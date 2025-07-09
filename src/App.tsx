import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/house-watching" element={<HouseWatching />} />
          <Route path="/property-check/:id" element={<PropertyCheck />} />
          <Route path="/client-portal" element={<ClientDashboard />} />
          <Route path="/client-portal/properties" element={<ClientProperties />} />
          <Route path="/client-portal/reports" element={<ClientReports />} />
          <Route path="/client-portal/reports/:reportId" element={<ClientReports />} />
          <Route path="/client-portal/requests" element={<ClientRequests />} />
          <Route path="/client-portal/messages" element={<ClientMessages />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
