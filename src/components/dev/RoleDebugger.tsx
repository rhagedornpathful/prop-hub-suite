import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Shield, X, Bug } from 'lucide-react';

interface RoleDebugInfo {
  allRoles: any[];
  profileExists: boolean;
  authUser: any;
  routeInfo: string;
}

export const RoleDebugger = () => {
  const { user, userRole, loading } = useAuth();
  const { getRoleDisplayName } = useUserRole();
  const [debugInfo, setDebugInfo] = useState<RoleDebugInfo>({
    allRoles: [],
    profileExists: false,
    authUser: null,
    routeInfo: ''
  });
  const [debugLoading, setDebugLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('debug-panel-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const togglePanel = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('debug-panel-open', JSON.stringify(newState));
  };

  const fetchDebugInfo = async () => {
    if (!user) return;
    
    setDebugLoading(true);
    console.log('🔍 Fetching debug info for user:', user.id);
    
    try {
      // Get all roles for this user
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📋 All roles for user:', rolesData);
      if (rolesError) console.error('❌ Error fetching roles:', rolesError);

      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      console.log('👤 Profile data:', profileData);
      if (profileError) console.error('❌ Error fetching profile:', profileError);

      // Get auth user info
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('🔐 Auth user:', authUser);

      setDebugInfo({
        allRoles: rolesData || [],
        profileExists: !!profileData,
        authUser,
        routeInfo: window.location.pathname
      });
    } catch (error) {
      console.error('💥 Debug info fetch error:', error);
    } finally {
      setDebugLoading(false);
    }
  };

  const checkRLS = async () => {
    console.log('🔍 Checking RLS policies for user_roles table...');
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      console.log('RLS Check - Data:', data);
      console.log('RLS Check - Error:', error);
      alert(`Found ${data?.length || 0} roles. Error: ${error?.message || 'None'}`);
      
      // Also check specifically for current user
      if (user) {
        const { data: userRoles, error: userError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        console.log('👤 User-specific roles:', userRoles);
        console.log('❌ User-specific error:', userError);
      }
      
    } catch (err: any) {
      console.error('RLS check error:', err);
      alert('Error checking RLS: ' + err.message);
    }
  };

  const forceMakeAdmin = async () => {
    console.log('🚀 Calling force_make_me_admin database function...');
    
    try {
      const { data, error } = await supabase.rpc('force_make_me_admin');
      console.log('Force admin result:', data, error);
      
      if (error) {
        alert('Database function error: ' + error.message);
        return;
      }
      
      // Type assertion for the response
      const result = data as { success?: boolean; error?: string; message?: string } | null;
      
      if (result?.success) {
        alert('Admin role set! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('Failed: ' + (result?.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Force admin error:', err);
      alert('Error: ' + err.message);
    }
  };

  const forceClaimAdmin = async () => {
    console.log('🚀 Force claiming admin role via client insert...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('No user logged in!');
        return;
      }
      
      console.log('👤 Attempting to insert admin role for user:', user.id);
      
      // Try to insert directly
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.id, 
          role: 'admin'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Insert error:', error);
        alert('Insert failed: ' + error.message + '\n\nThis likely means RLS is blocking the insert.');
      } else {
        console.log('Insert success:', data);
        alert('Admin role inserted! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      console.error('Client insert error:', err);
      alert('Error: ' + err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      {!isOpen && (
        <Button
          onClick={togglePanel}
          size="sm"
          variant="outline"
          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
          title="Open debug panel"
        >
          <Bug className="w-4 h-4" />
        </Button>
      )}
      
      {isOpen && (
        <Card className="bg-yellow-50 border-yellow-200 max-w-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Debug Info
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchDebugInfo}
                  disabled={debugLoading}
                  className="p-1 h-6 w-6"
                  title="Refresh debug info"
                >
                  <RefreshCw className={`w-3 h-3 ${debugLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={checkRLS}
                  className="p-1 h-6 text-xs px-2"
                  title="Check RLS policies"
                >
                  RLS
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={forceMakeAdmin}
                  className="p-1 h-6 text-xs px-2"
                  title="Force admin via database function"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  DB
                </Button>
                {user && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={forceClaimAdmin}
                    className="p-1 h-6 text-xs px-2"
                    title="Force claim admin role via client"
                  >
                    Client
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePanel}
                  className="p-1 h-6 w-6"
                  title="Close debug panel"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Auth Status:</strong> {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
          </div>
          
          {user && (
            <>
              <div>
                <strong>User ID:</strong> {user.id?.slice(0, 8)}...
              </div>
              
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              
              <div>
                <strong>Current Role:</strong> {userRole || 'None'}
              </div>
              
              <div>
                <strong>Display Role:</strong> {getRoleDisplayName()}
              </div>
              
              <div>
                <strong>All Roles ({debugInfo.allRoles.length}):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {debugInfo.allRoles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {role.role}
                    </Badge>
                  ))}
                  {debugInfo.allRoles.length === 0 && (
                    <Badge variant="destructive" className="text-xs">
                      No roles found
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <strong>Profile Exists:</strong> {debugInfo.profileExists ? '✅' : '❌'}
              </div>
              
              <div>
                <strong>Current Route:</strong> {debugInfo.routeInfo}
              </div>
              
              <div>
                <strong>Page Component:</strong> {
                  debugInfo.routeInfo === '/' ? 'Index/Dashboard' :
                  debugInfo.routeInfo.includes('properties') ? 'Properties' :
                  debugInfo.routeInfo.includes('setup') ? 'Setup' :
                  debugInfo.routeInfo.includes('auth') ? 'Auth' :
                  'Other'
                }
              </div>

              <div className="pt-2 border-t space-y-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={checkRLS}
                  className="w-full text-xs"
                >
                  Check RLS Policies
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={forceMakeAdmin}
                  className="w-full text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Force Admin (Database Function)
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={forceClaimAdmin}
                  className="w-full text-xs"
                  disabled={!user}
                >
                  Force Admin (Client Insert)
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Multiple debug approaches for role issues
                </p>
              </div>
            </>
          )}
        </CardContent>
        </Card>
      )}
    </div>
  );
};