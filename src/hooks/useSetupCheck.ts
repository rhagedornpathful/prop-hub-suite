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
    if (user && userRole) {
      // If user has a role, no setup needed
      setNeedsSetup(false);
      setChecking(false);
    } else if (user && userRole === null) {
      // User exists but no role - check if admin exists
      checkSetupNeeded();
    } else {
      // No user - setup not our concern
      setChecking(false);
      setNeedsSetup(false);
    }
  }, [user, userRole]);

  const checkSetupNeeded = async () => {
    try {
      setChecking(true);
      
      // Use a function call that can bypass RLS to check if any admin exists
      const { data, error } = await supabase.rpc('check_admin_exists');
      
      if (error) {
        console.error('Setup check error:', error);
        // If function doesn't exist or fails, assume setup is not needed to avoid blocking
        setNeedsSetup(false);
        return;
      }
      
      const hasAdmin = data === true;
      
      // If no admin exists, setup is needed
      if (!hasAdmin) {
        setNeedsSetup(true);
        // Only redirect if not already on setup page
        if (window.location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } else {
        setNeedsSetup(false);
      }
      
    } catch (error) {
      console.error('Setup check failed:', error);
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