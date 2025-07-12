import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<Database['public']['Enums']['app_role'] | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
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

  return {
    user,
    session,
    loading,
    userRole,
    signOut: () => supabase.auth.signOut()
  };
};