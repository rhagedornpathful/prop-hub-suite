import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better performance
const Index = lazy(() => import('@/pages/Index'));
const Properties = lazy(() => import('@/pages/Properties'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Messages = lazy(() => import('@/pages/Messages'));
const Tenants = lazy(() => import('@/pages/Tenants'));
const PropertyOwners = lazy(() => import('@/pages/PropertyOwners'));
const HouseWatching = lazy(() => import('@/pages/HouseWatching'));
const PropertyCheck = lazy(() => import('@/pages/PropertyCheck'));
const HomeCheck = lazy(() => import('@/pages/HomeCheck'));
const Activity = lazy(() => import('@/pages/Activity'));
const Auth = lazy(() => import('@/pages/Auth'));
const Setup = lazy(() => import('@/pages/Setup'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const Settings = lazy(() => import('@/pages/Settings'));
const Finances = lazy(() => import('@/pages/Finances'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const PropertyOwnerDetail = lazy(() => import('@/pages/PropertyOwnerDetail'));
const HouseWatcherHome = lazy(() => import('@/pages/HouseWatcherHome'));
const HouseWatcherSettings = lazy(() => import('@/pages/HouseWatcherSettings'));
const HouseWatcherProperties = lazy(() => import('@/pages/HouseWatcherProperties'));
const PropertyManagerView = lazy(() => import('@/pages/PropertyManagerView'));
const DevTools = lazy(() => import('@/pages/DevTools'));
const Documents = lazy(() => import('@/pages/Documents'));
const Leases = lazy(() => import('@/pages/Leases'));
const ResidentPortal = lazy(() => import('@/pages/ResidentPortal'));

const AdminNavigation = lazy(() => import('@/pages/AdminNavigation'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Dashboard components
const AdminDashboard = lazy(() => import('@/pages/dashboards/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const PropertyManagerDashboard = lazy(() => import('@/pages/dashboards/PropertyManagerDashboard').then(module => ({ default: module.PropertyManagerDashboard })));
const PropertyOwnerDashboard = lazy(() => import('@/pages/dashboards/PropertyOwnerDashboard'));
const TenantDashboard = lazy(() => import('@/pages/dashboards/TenantDashboard').then(module => ({ default: module.TenantDashboard })));
const HouseWatcherDashboard = lazy(() => import('@/pages/dashboards/HouseWatcherDashboard'));

// Client Portal components
const ClientDashboard = lazy(() => import('@/pages/ClientPortal/Dashboard'));
const ClientProperties = lazy(() => import('@/pages/ClientPortal/Properties'));
const ClientRequests = lazy(() => import('@/pages/ClientPortal/Requests'));
const ClientMessages = lazy(() => import('@/pages/ClientPortal/Messages'));
const ClientReports = lazy(() => import('@/pages/ClientPortal/Reports'));

const LoadingFallback = () => (
  <div className="container mx-auto p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export const LazyRoutes: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/tenants" element={<Tenants />} />
      <Route path="/property-owners" element={<PropertyOwners />} />
      <Route path="/property-owners/:id" element={<PropertyOwnerDetail />} />
      <Route path="/house-watching" element={<HouseWatching />} />
      
      <Route path="/property-check" element={<PropertyCheck />} />
      <Route path="/property-check/:id" element={<PropertyCheck />} />
      <Route path="/home-check" element={<HomeCheck />} />
      <Route path="/home-check/:id" element={<HomeCheck />} />
      <Route path="/house-watcher-home" element={<HouseWatcherHome />} />
      <Route path="/house-watcher-properties" element={<HouseWatcherProperties />} />
      <Route path="/house-watcher-settings" element={<HouseWatcherSettings />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="/property-manager" element={<PropertyManagerView />} />
      <Route path="/dev-tools" element={<DevTools />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/leases" element={<Leases />} />
      <Route path="/resident-portal" element={<ResidentPortal />} />
      
      <Route path="/admin-navigation" element={<AdminNavigation />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/property-manager" element={<PropertyManagerDashboard />} />
      <Route path="/dashboard/property-owner" element={<PropertyOwnerDashboard />} />
      <Route path="/dashboard/tenant" element={<TenantDashboard />} />
      <Route path="/dashboard/house-watcher" element={<HouseWatcherDashboard />} />
      
      {/* Client Portal Routes */}
      <Route path="/client" element={<ClientDashboard />} />
      <Route path="/client/properties" element={<ClientProperties />} />
      <Route path="/client/requests" element={<ClientRequests />} />
      <Route path="/client/messages" element={<ClientMessages />} />
      <Route path="/client/reports" element={<ClientReports />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);