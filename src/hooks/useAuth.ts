import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<Database['public']['Enums']['app_role'] | null>(null);

  // Check for emergency admin mode first
  const checkEmergencyMode = () => {
    const isEmergencyMode = sessionStorage.getItem('emergencyAdmin') === 'true' || 
                           (window as any).__EMERGENCY_ADMIN_MODE__;
    
    if (isEmergencyMode) {
      console.log('🚨 useAuth: Emergency admin mode detected - bypassing normal auth');
      
      try {
        const emergencyUserData = sessionStorage.getItem('emergencyAdminUser');
        const emergencyUser = emergencyUserData ? JSON.parse(emergencyUserData) : {
          id: '1c376b70-c535-4ee4-8275-5d017704b3db',
          email: 'rmh1122@hotmail.com',
          role: 'admin'
        };

        // Create a mock User object that matches Supabase structure
        const mockUser: User = {
          id: emergencyUser.id,
          email: emergencyUser.email,
          app_metadata: { provider: 'emergency', providers: ['emergency'] },
          user_metadata: { email: emergencyUser.email, emergency_access: true },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_anonymous: false
        };

        // Create a mock Session object
        const mockSession: Session = {
          access_token: 'emergency_access_token',
          refresh_token: 'emergency_refresh_token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser
        };

        setUser(mockUser);
        setSession(mockSession);
        setUserRole('admin');
        setLoading(false);
        
        return true; // Emergency mode active
      } catch (error) {
        console.error('❌ useAuth: Error setting up emergency mode:', error);
      }
    }
    return false; // Normal mode
  };

  useEffect(() => {
    console.log('🔄 useAuth: Starting authentication check...');
    
    // Check emergency mode first
    if (checkEmergencyMode()) {
      console.log('🚨 useAuth: Emergency mode activated - skipping normal auth');
      return;
    }

    console.log('🔍 useAuth: Normal auth mode - proceeding with Supabase auth');

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 useAuth: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useAuth: Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📝 useAuth: Initial session:', session ? 'exists' : 'null');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 useAuth: User found, fetching role...');
          await fetchUserRole(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('💥 useAuth: Exception in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    console.log('🎧 useAuth: Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state changed:', event);
        
        // Check emergency mode on each auth change
        if (checkEmergencyMode()) {
          console.log('🚨 useAuth: Emergency mode detected during auth change - ignoring');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 useAuth: User in auth change, fetching role...');
          await fetchUserRole(session.user.id);
        } else {
          console.log('❌ useAuth: No user in auth change');
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    // Skip role fetching in emergency mode
    if (sessionStorage.getItem('emergencyAdmin') === 'true' || (window as any).__EMERGENCY_ADMIN_MODE__) {
      console.log('🚨 useAuth: Emergency mode - setting admin role directly');
      setUserRole('admin');
      return;
    }

    console.log('🔍 Fetching role for user:', userId);
    
    try {
      // Get all roles for user (can be multiple)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('📋 Raw role data:', data);
      console.log('❌ Role fetch error:', error);

      if (error) {
        console.error('❌ Error fetching user role:', error);
        setUserRole(null);
        return;
      }

      // If no roles found, user needs to set up
      if (!data || data.length === 0) {
        console.log('⚠️ No roles found for user');
        setUserRole(null);
        return;
      }

      // If user has multiple roles, prioritize admin, then property_manager, etc.
      const roleHierarchy: Database['public']['Enums']['app_role'][] = [
        'admin', 'property_manager', 'owner_investor', 'house_watcher', 'tenant', 'client'
      ];
      let selectedRole = data[0].role; // Default to first role
      
      for (const hierarchyRole of roleHierarchy) {
        if (data.some(roleRow => roleRow.role === hierarchyRole)) {
          selectedRole = hierarchyRole;
          break;
        }
      }

      console.log('✅ Selected role:', selectedRole, 'from', data.length, 'total roles');
      setUserRole(selectedRole);
      
    } catch (error) {
      console.error('💥 Exception in fetchUserRole:', error);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    // Clear emergency mode flags
    sessionStorage.removeItem('emergencyAdmin');
    sessionStorage.removeItem('emergencyAdminUser');
    delete (window as any).__EMERGENCY_ADMIN_MODE__;
    
    console.log('🚪 useAuth: Signing out...');
    return supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    userRole,
    signOut
  };
};