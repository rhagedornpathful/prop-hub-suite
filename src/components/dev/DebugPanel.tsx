import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Bug, 
  RefreshCw, 
  Crown, 
  User, 
  Mail, 
  Shield, 
  ChevronDown,
  ChevronRight,
  Loader2,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useDevAdmin } from '@/contexts/DevAdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const availableRoles = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'property_manager', label: 'Property Manager', description: 'Manage properties and tenants' },
  { value: 'owner_investor', label: 'Property Owner', description: 'Own and manage properties' },
  { value: 'tenant', label: 'Tenant', description: 'Tenant portal access' },
  { value: 'house_watcher', label: 'House Watcher', description: 'Monitor properties' },
  { value: 'client', label: 'Client', description: 'Client portal access' },
  { value: 'contractor', label: 'Contractor', description: 'Maintenance contractor' },
  { value: 'leasing_agent', label: 'Leasing Agent', description: 'Manage leases' }
];

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  const { user, userRole, loading } = useAuth();
  const { getRoleDisplayName, permissions } = useUserRole();
  const { isDevAdminActive, isDevelopment } = useDevAdmin();

  // Don't render in production
  if (!isDevelopment) {
    return null;
  }

  const refreshRole = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      // Force a refresh by signing out and back in
      const currentSession = await supabase.auth.getSession();
      if (currentSession.data.session) {
        await supabase.auth.refreshSession();
        toast({
          title: "Role Refreshed",
          description: "User role has been refreshed from database",
        });
        
        // Force page reload to ensure all state is updated
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error refreshing role:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh role from database",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;
    
    setMakingAdmin(true);
    try {
      const { data, error } = await supabase.rpc('make_me_admin');
      
      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        // Refresh the page to update role state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Make admin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMakingAdmin(false);
    }
  };

  const copyUserId = async () => {
    if (!user?.id) return;
    
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
      });
      
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 z-40">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="shadow-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"
          >
            <Bug className="h-4 w-4 mr-1" />
            Debug
            {isOpen ? (
              <ChevronDown className="h-3 w-3 ml-1" />
            ) : (
              <ChevronRight className="h-3 w-3 ml-1" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="w-80 mt-2 shadow-lg border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4 text-blue-600" />
                Debug Panel
                <Badge variant="outline" className="text-xs">
                  DEV ONLY
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* User Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Information
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-muted px-1 rounded font-mono text-xs">
                        {user?.id ? `${user.id.substring(0, 8)}...` : 'None'}
                      </code>
                      {user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyUserId}
                          className="h-5 w-5 p-0"
                        >
                          {copiedId ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono">{user?.email || 'None'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database Role:</span>
                    <Badge 
                      variant={userRole ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {userRole || 'None'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Display Role:</span>
                    <span className="text-xs font-medium">{getRoleDisplayName()}</span>
                  </div>
                  
                  {isDevAdminActive && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <Crown className="h-3 w-3 text-orange-600" />
                      <AlertDescription className="text-xs text-orange-800">
                        Dev Admin mode is active
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Actions
                </h4>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshRole}
                    disabled={refreshing || loading}
                    className="w-full justify-start text-xs"
                  >
                    {refreshing ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-2" />
                    )}
                    Refresh Role from DB
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={makeAdmin}
                    disabled={makingAdmin || userRole === 'admin'}
                    className="w-full justify-start text-xs"
                  >
                    {makingAdmin ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <Crown className="h-3 w-3 mr-2" />
                    )}
                    Make Me Admin
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Available Roles */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Roles</h4>
                <div className="space-y-1">
                  {availableRoles.map((role) => (
                    <div 
                      key={role.value}
                      className={`flex items-center justify-between p-2 rounded text-xs ${
                        userRole === role.value 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-muted-foreground text-xs">
                          {role.description}
                        </div>
                      </div>
                      {userRole === role.value && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Summary */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Permissions</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`p-1 rounded ${permissions.canManageUsers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Manage Users: {permissions.canManageUsers ? '✓' : '✗'}
                  </div>
                  <div className={`p-1 rounded ${permissions.canManageAllProperties ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    All Properties: {permissions.canManageAllProperties ? '✓' : '✗'}
                  </div>
                  <div className={`p-1 rounded ${permissions.canViewFinancialReports ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Financial Reports: {permissions.canViewFinancialReports ? '✓' : '✗'}
                  </div>
                  <div className={`p-1 rounded ${permissions.canAssignHouseWatchers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Assign Watchers: {permissions.canAssignHouseWatchers ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground">
                Environment: {process.env.NODE_ENV}<br />
                Host: {window.location.hostname}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}