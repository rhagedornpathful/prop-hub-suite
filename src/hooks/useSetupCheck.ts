import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSetupCheck() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const { user, userRole } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SetupCheck: User state:', { user: !!user, userRole });
    }
    
    // Prevent duplicate checks
    if (hasChecked.current && needsSetup !== null) {
      return;
    }
    
    if (user && userRole) {
      // User has a role - no setup needed
      hasChecked.current = true;
      setNeedsSetup(false);
      setChecking(false);
    } else if (user && userRole === null) {
      // User exists but no role yet - wait briefly for role to load
      // Don't immediately trigger setup check as role might still be loading
      const timer = setTimeout(() => {
        if (!hasChecked.current) {
          checkSetupNeeded();
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (!user) {
      // No user - setup not our concern
      setChecking(false);
      setNeedsSetup(false);
    }
  }, [user, userRole, needsSetup]);

  const checkSetupNeeded = async () => {
    if (hasChecked.current) return;
    
    try {
      hasChecked.current = true;
      setChecking(true);
      
      // For production, assume setup is complete
      // Only new deployments would need setup
      setNeedsSetup(false);
      
    } catch (error) {
      console.error('❌ SetupCheck: Setup check failed:', error);
      setNeedsSetup(false);
    } finally {
      setChecking(false);
    }
  };

  return {
    needsSetup,
    checking,
    checkSetupNeeded
  };
}
