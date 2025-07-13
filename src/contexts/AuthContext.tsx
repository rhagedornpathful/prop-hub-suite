import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: Database['public']['Enums']['app_role'] | null;
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

  // Check for emergency admin mode first
  const checkEmergencyMode = () => {
    const isEmergencyMode = sessionStorage.getItem('emergencyAdmin') === 'true' || 
                           (window as any).__EMERGENCY_ADMIN_MODE__;
    
    if (isEmergencyMode) {
      console.log('🚨 AuthProvider: Emergency admin mode detected - bypassing normal auth');
      
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
        console.error('❌ AuthProvider: Error setting up emergency mode:', error);
      }
    }
    return false; // Normal mode
  };

  const fetchUserRole = async (userId: string) => {
    // Skip role fetching in emergency mode
    if (sessionStorage.getItem('emergencyAdmin') === 'true' || (window as any).__EMERGENCY_ADMIN_MODE__) {
      console.log('🚨 AuthProvider: Emergency mode - setting admin role directly');
      setUserRole('admin');
      return;
    }

    console.log('🔍 AuthProvider: Fetching role for user:', userId);
    
    try {
      // Use direct user ID query to bypass auth.uid() timing issues
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('📋 AuthProvider: Role query result:', { data, error, userId });

      if (error) {
        console.error('❌ AuthProvider: Error fetching user role:', error);
        setUserRole(null);
        return;
      }

      if (!data) {
        console.log('⚠️ AuthProvider: No role data returned for user');
        setUserRole(null);
        return;
      }

      // Set the role found
      console.log('✅ AuthProvider: User role found:', data.role);
      setUserRole(data.role);
      
    } catch (error) {
      console.error('💥 AuthProvider: Exception in fetchUserRole:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider: Starting authentication check...');
    
    // Check emergency mode first
    if (checkEmergencyMode()) {
      console.log('🚨 AuthProvider: Emergency mode activated - skipping normal auth');
      return;
    }

    console.log('🔍 AuthProvider: Normal auth mode - proceeding with Supabase auth');
    let isSubscriptionActive = true;

    // Listen for auth changes FIRST to avoid missing events
    console.log('🎧 AuthProvider: Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event);
        
        // Skip if subscription is no longer active
        if (!isSubscriptionActive) return;
        
        // Check emergency mode on each auth change
        if (checkEmergencyMode()) {
          console.log('🚨 AuthProvider: Emergency mode detected during auth change - ignoring');
          return;
        }

        // Update state synchronously first
        setSession(session);
        setUser(session?.user ?? null);
        
         // Defer role fetching to avoid blocking
         if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
           console.log('👤 AuthProvider: User signed in, fetching role...');
           setTimeout(() => {
             if (isSubscriptionActive) {
               fetchUserRole(session.user.id);
             }
           }, 0);
         } else if (!session) {
           console.log('❌ AuthProvider: No user session');
           setUserRole(null);
         }
        
        setLoading(false);
      }
    );

    // Get initial session AFTER setting up listener
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isSubscriptionActive) return;
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📝 AuthProvider: Initial session:', session ? 'exists' : 'null');
        
        // Only update if no session is already set (avoid duplicates)
        if (!session || session.access_token !== user?.id) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('👤 AuthProvider: Initial user found, fetching role...');
            setTimeout(() => {
              if (isSubscriptionActive) {
                fetchUserRole(session.user.id);
              }
            }, 0);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('💥 AuthProvider: Exception in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth subscription');
      isSubscriptionActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear emergency mode flags FIRST
    sessionStorage.removeItem('emergencyAdmin');
    sessionStorage.removeItem('emergencyAdminUser');
    delete (window as any).__EMERGENCY_ADMIN_MODE__;
    
    // Clear all auth state
    setUser(null);
    setSession(null);
    setUserRole(null);
    
    console.log('🚪 AuthProvider: Signing out...');
    await supabase.auth.signOut();
    
    // Force redirect to auth page
    window.location.href = '/auth';
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};