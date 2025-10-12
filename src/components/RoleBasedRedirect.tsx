import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * RoleBasedRedirect - Automatically redirects users to their role-specific dashboard
 * This component should be used on the "/" route to ensure users land on their appropriate home page
 */
export const RoleBasedRedirect = () => {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If no role, user will be redirected by ProtectedRoute
    if (!userRole) return;

    // Map roles to their dashboard routes
    const roleRoutes: Record<string, string> = {
      admin: '/admin/overview',
      property_manager: '/property-manager-dashboard',
      owner_investor: '/owner-dashboard',
      tenant: '/tenant-dashboard',
      house_watcher: '/house-watcher-dashboard',
      contractor: '/vendor-portal',
      leasing_agent: '/leasing',
      client: '/client-portal',
    };

    const targetRoute = roleRoutes[userRole];
    
    if (targetRoute) {
      console.log(`🚀 Redirecting ${userRole} to ${targetRoute}`);
      navigate(targetRoute, { replace: true });
    } else {
      // Fallback to a default dashboard if role not recognized
      console.warn(`⚠️ Unknown role: ${userRole}, redirecting to home`);
      navigate('/home', { replace: true });
    }
  }, [userRole, loading, navigate]);

  // Show loading state while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
};
