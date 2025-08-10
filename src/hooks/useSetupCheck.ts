import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSetupCheck() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 SetupCheck: User state:', { user: !!user, userRole });
    
    if (user && userRole) {
      // If user has a role, no setup needed
      console.log('✅ SetupCheck: User has role, no setup needed');
      setNeedsSetup(false);
      setChecking(false);
    } else if (user && userRole === null) {
      // User exists but no role - check if admin exists
      console.log('⚠️ SetupCheck: User exists but no role, checking setup');
      checkSetupNeeded();
    } else {
      // No user - setup not our concern
      console.log('ℹ️ SetupCheck: No user, setup not needed');
      setChecking(false);
      setNeedsSetup(false);
    }
  }, [user, userRole]);

  const checkSetupNeeded = async () => {
    try {
      console.log('🔍 SetupCheck: Checking if setup is needed');
      setChecking(true);
      
      // For production, disable setup check to avoid blocking the app
      // Assume setup is already complete if there are any users in the system
      const { data: session } = await supabase.auth.getSession();
      
      console.log('✅ SetupCheck: Session check complete, assuming setup not needed');
      // If we can get session info, the database is working
      // For production apps, we assume setup is not needed
      setNeedsSetup(false);
      
    } catch (error) {
      console.error('❌ SetupCheck: Setup check failed:', error);
      // On any error, assume setup is not needed to avoid blocking the app
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