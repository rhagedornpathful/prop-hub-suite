import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Debug Info
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDebugInfo}
              disabled={debugLoading}
              className="p-1 h-6 w-6"
            >
              <RefreshCw className={`w-3 h-3 ${debugLoading ? 'animate-spin' : ''}`} />
            </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};