import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSetupCheck } from '@/hooks/useSetupCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { needsSetup, checking: setupChecking } = useSetupCheck();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('🔒 ProtectedRoute - user:', !!user, 'userRole:', userRole, 'authLoading:', authLoading, 'setupChecking:', setupChecking, 'pathname:', location.pathname);

  // Check for emergency admin mode first
  const isEmergencyMode = sessionStorage.getItem('emergencyAdmin') === 'true' || 
                         (window as any).__EMERGENCY_ADMIN_MODE__;

  if (isEmergencyMode) {
    console.log('🚨 ProtectedRoute - Emergency mode detected, allowing access');
    return <>{children}</>;
  }

  useEffect(() => {
    // Don't redirect if we're still loading
    if (authLoading || setupChecking) return;
    
    // Always allow access to setup page
    if (location.pathname === '/setup') return;
    
    // If no user, redirect to auth
    if (!user) {
      console.log('🔒 No user, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }
    
    
    // If user exists but no role and not on setup page, check if setup is actually needed
    if (user && !userRole && location.pathname !== '/setup') {
      // If setup is not needed (admin exists), wait for role to load instead of redirecting
      if (needsSetup === false) {
        console.log('🔒 Admin exists but role not loaded yet, waiting for role...');
        return; // Don't redirect, just wait for role to load
      }
      // Only redirect to setup if setup is actually needed
      if (needsSetup === true) {
        console.log('🔒 User has no role, redirecting to setup');
        navigate('/setup', { replace: true });
        return;
      }
    }
    
  }, [user, userRole, authLoading, setupChecking, location.pathname, navigate, needsSetup]);

  // Always allow setup page
  if (location.pathname === '/setup') {
    console.log('🔒 Allowing setup page access');
    return <>{children}</>;
  }

  // Show loading while checking auth or setup status
  if (authLoading || setupChecking) {
    console.log('🔒 Showing loading spinner');
    return <LoadingSpinner />;
  }

  // If no user after loading is complete, don't render (will redirect)
  if (!user) {
    console.log('🔒 No user after loading, returning null');
    return null;
  }

  // If setup is needed (no admin exists), don't render (will redirect)
  if (needsSetup) {
    console.log('🔒 Setup needed, returning null');
    return null;
  }

  // If user has no role but setup is not needed, show loading (waiting for role to load)
  if (!userRole && needsSetup === false) {
    console.log('🔒 Waiting for user role to load');
    return <LoadingSpinner />;
  }

  // If user has no role, don't render (will redirect to setup)
  if (!userRole) {
    console.log('🔒 No user role, returning null');
    return null;
  }

  console.log('🔒 Rendering protected content for role:', userRole);
  return <>{children}</>;
};