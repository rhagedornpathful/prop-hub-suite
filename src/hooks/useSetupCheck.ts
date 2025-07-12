import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSetupCheck() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkSetupNeeded();
    } else {
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
        setNeedsSetup(true);
        // Redirect to setup if not already there
        if (window.location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } else {
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