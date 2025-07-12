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
    // Skip setup check in emergency mode
    if (sessionStorage.getItem('emergencyAdmin') === 'true' || (window as any).__EMERGENCY_ADMIN_MODE__) {
      console.log('🚨 useSetupCheck: Emergency mode - skipping setup check');
      setNeedsSetup(false);
      setChecking(false);
      return;
    }

    if (user && userRole) {
      // If user has a role, no setup needed
      console.log('✅ useSetupCheck: User has role, no setup needed');
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
      
      // Check if any admin exists in the system
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (error) throw error;
      
      const hasAdmin = (data || []).length > 0;
      
      // If no admin exists, setup is needed
      if (!hasAdmin) {
        console.log('⚠️ useSetupCheck: No admin found - setup needed');
        setNeedsSetup(true);
        // Only redirect if not already on setup page
        if (window.location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } else {
        console.log('✅ useSetupCheck: Admin exists - no setup needed');
        setNeedsSetup(false);
      }
      
    } catch (error) {
      console.error('Error checking setup status:', error);
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