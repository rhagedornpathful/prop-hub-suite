import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSetupCheck } from '@/hooks/useSetupCheck';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();
  const { needsSetup, checking } = useSetupCheck();
  const navigate = useNavigate();

  console.log('🔒 ProtectedRoute - user:', !!user, 'loading:', loading, 'userRole:', userRole, 'needsSetup:', needsSetup, 'checking:', checking);

  useEffect(() => {
    console.log('🔒 ProtectedRoute effect - user:', !!user, 'loading:', loading);
    if (!loading && !user) {
      console.log('🔒 Redirecting to auth - no user');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || checking) {
    console.log('🔒 ProtectedRoute - showing loading skeleton');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <div className="text-center text-sm text-muted-foreground mt-4">
            {loading ? 'Loading authentication...' : 'Checking setup...'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedRoute - no user, returning null');
    return null;
  }

  // If setup is needed, the useSetupCheck hook will redirect to /setup
  // So we just need to render null here to prevent showing protected content
  if (needsSetup) {
    console.log('🔒 ProtectedRoute - setup needed, returning null');
    return null;
  }

  console.log('🔒 ProtectedRoute - rendering children');
  return <>{children}</>;
};