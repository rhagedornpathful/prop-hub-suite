import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: Database['public']['Enums']['app_role'] | null;
  actualRole: Database['public']['Enums']['app_role'] | null;
  activeRole: Database['public']['Enums']['app_role'] | null;
  isRoleSwitched: boolean;
  switchRole: (role: Database['public']['Enums']['app_role'] | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<Database['public']['Enums']['app_role'] | null>(null);
  const [switchedRole, setSwitchedRole] = useState<Database['public']['Enums']['app_role'] | null>(null);

  // Emergency admin mode removed for production security

  // Calculate active role (switched role if set, otherwise actual role)
  const activeRole = switchedRole || userRole;
  const isRoleSwitched = switchedRole !== null && userRole === 'admin';

  const switchRole = (role: Database['public']['Enums']['app_role'] | null) => {
    // Only admins can switch roles
    if (userRole !== 'admin') {
      console.warn('⚠️ Only admins can switch roles');
      return;
    }
    
    console.log('🔄 Switching role to:', role);
    setSwitchedRole(role);
    
    // Store in localStorage for persistence
    if (role) {
      localStorage.setItem('admin_switched_role', role);
    } else {
      localStorage.removeItem('admin_switched_role');
    }
  };

  const fetchUserRole = async (userId: string) => {
    console.log('🔍 AuthContext: Fetching user role for:', userId);
    
    try {
      // Use direct user ID query to get all user roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ AuthContext: Error fetching user role:', error);
        setUserRole(null);
        return;
      }

      console.log('📊 AuthContext: User roles data:', data);
      const roles = data?.map(row => row.role) || [];
      
      if (roles.length === 0) {
        console.log('⚠️ AuthContext: No roles found for user - this is normal for new users');
        setUserRole(null);
        return;
      }

      // Check for preferred role in localStorage first
      const preferredRole = localStorage.getItem('preferred_role');
      if (preferredRole && roles.includes(preferredRole as any)) {
        console.log('✅ AuthContext: Using preferred role:', preferredRole);
        setUserRole(preferredRole as any);
        return;
      }

      // If user has multiple roles, prefer the most specific one
      const roleHierarchy = ['house_watcher', 'tenant', 'owner_investor', 'contractor', 'client', 'leasing_agent', 'property_manager', 'admin'];
      
      for (const hierarchyRole of roleHierarchy) {
        if (roles.includes(hierarchyRole as any)) {
          console.log('✅ AuthContext: Using hierarchy role:', hierarchyRole);
          setUserRole(hierarchyRole as any);
          return;
        }
      }

      // Fallback to first role if no hierarchy match
      const primaryRole = roles[0];
      console.log('✅ AuthContext: Using fallback role:', primaryRole);
      setUserRole(primaryRole);
      
      // Restore switched role if admin
      if (primaryRole === 'admin') {
        const savedSwitchedRole = localStorage.getItem('admin_switched_role');
        if (savedSwitchedRole) {
          console.log('✅ AuthContext: Restoring switched role:', savedSwitchedRole);
          setSwitchedRole(savedSwitchedRole as any);
        }
      }
      
    } catch (error) {
      console.error('💥 AuthContext: Exception in fetchUserRole:', error);
      // Don't block the app - set role to null and let user continue
      setUserRole(null);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing auth listener');
    let isSubscriptionActive = true;
    let roleFetchedForUser: string | null = null; // Track which user we've fetched role for

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state change:', event, session?.user?.id);
        
        if (!isSubscriptionActive) return;

        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch role if we haven't already for this user
        if (session?.user && roleFetchedForUser !== session.user.id) {
          // Only fetch on meaningful events
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
            roleFetchedForUser = session.user.id;
            setTimeout(() => {
              if (isSubscriptionActive) {
                fetchUserRole(session.user.id);
              }
            }, 0);
          }
        } else if (!session) {
          console.log('🔄 AuthContext: No session, clearing role');
          setUserRole(null);
          roleFetchedForUser = null;
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthContext: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isSubscriptionActive) return;
        
        if (error) {
          console.error('❌ AuthContext: Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        // Note: onAuthStateChange will handle session setup and role fetching
        // This just ensures we have the initial session data
        if (session && !user) {
          setSession(session);
          setUser(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('💥 AuthContext: Exception getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
      isSubscriptionActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear preferred role and switched role
    localStorage.removeItem('preferred_role');
    localStorage.removeItem('admin_switched_role');
    
    // Clear all auth state
    setUser(null);
    setSession(null);
    setUserRole(null);
    setSwitchedRole(null);
    
    await supabase.auth.signOut();
    
    // Force redirect to auth page
    window.location.href = '/auth';
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    actualRole: userRole,
    activeRole,
    isRoleSwitched,
    switchRole,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};