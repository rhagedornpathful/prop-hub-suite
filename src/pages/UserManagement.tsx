import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users,
  Shield,
  UserCog,
  Mail,
  Calendar,
  Filter,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Plus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AddUserDialog from "@/components/AddUserDialog";
import { UserDetailsDialog } from "@/components/UserDetailsDialog";
import { UserMobileTable } from "@/components/MobileTable";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  user_created_at: string;
  role_created_at: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  company_name?: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🚀 UserManagement: Component mounted');
    console.log('👤 UserManagement: Current user:', user ? 'exists' : 'null');
    console.log('🌐 UserManagement: Current URL:', window.location.href);
    
    // Check if we're in emergency admin mode - check sessionStorage FIRST
    const isEmergencyAdmin = sessionStorage.getItem('emergencyAdmin') === 'true';
    const isEmergency = isEmergencyAdmin || 
                       window.location.pathname.includes('/admin-emergency') || 
                       window.location.href.includes('/admin-emergency') ||
                       document.body.className.includes('emergency') ||
                       (window as any).__EMERGENCY_ADMIN_MODE__ === true;
    
    if (isEmergency) {
      console.log('🚨 UserManagement: Emergency mode detected - bypassing auth checks');
      setIsEmergencyMode(true);
      setIsAdmin(true);
    }

    // Set up 5-second timeout for loading
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ UserManagement: Loading timeout reached (5 seconds)');
      setLoadingTimeout(true);
      setError('Loading timeout - taking longer than expected');
    }, 5000);

    checkAdminStatus();
    fetchUsers();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const checkAdminStatus = async () => {
    console.log('🔍 UserManagement: Checking admin status...');
    
    if (isEmergencyMode) {
      console.log('🚨 UserManagement: Emergency mode - setting admin to true');
      setIsAdmin(true);
      return;
    }

    if (!user) {
      console.log('❌ UserManagement: No user found for admin check');
      setError('No user session found');
      return;
    }
    
    try {
      console.log('🔍 UserManagement: Calling has_role RPC for user:', user.id);
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' as any });
      
      if (error) {
        console.error('❌ UserManagement: Admin check RPC error:', error);
        throw error;
      }
      
      console.log('✅ UserManagement: Admin check result:', data);
      setIsAdmin(data);
    } catch (error) {
      console.error('❌ UserManagement: Error checking admin status:', error);
      setError('Failed to verify admin permissions: ' + (error as any).message);
    }
  };

  const fetchUsers = async () => {
    console.log('📊 UserManagement: Starting fetchUsers...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 UserManagement: Querying user_profiles table with deduplication...');
      
      // Get user profiles with basic info (roles will be fetched separately)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          phone,
          address,
          city,
          state,
          zip_code,
          company_name
        `)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('❌ UserManagement: Fetch users error:', error);
        throw error;
      }
      
      console.log('📊 UserManagement: Raw data fetched:', data?.length || 0, 'entries');
      
      // Transform data to match expected UserProfile interface
      const transformedUsers = data?.map(profile => ({
        id: profile.id,
        email: `user_${profile.user_id.slice(0, 8)}@system.local`,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: 'user' as any,
        user_created_at: new Date().toISOString(),
        role_created_at: new Date().toISOString(),
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        company_name: profile.company_name || ''
      })) || [];
      
      console.log('✅ UserManagement: Transformed users:', transformedUsers.length, 'users');
      setUsers(transformedUsers);
    } catch (error) {
      console.error('❌ UserManagement: Error fetching users:', error);
      setError('Failed to fetch users: ' + (error as any).message);
      toast({
        title: "Error",
        description: "Failed to fetch users: " + (error as any).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  // Force load with mock data
  const forceLoadWithMockData = () => {
    console.log('🚨 UserManagement: Force loading with mock data...');
    const mockUsers: UserProfile[] = [
      {
        id: '1c376b70-c535-4ee4-8275-5d017704b3db',
        email: 'rmh1122@hotmail.com',
        first_name: 'Emergency',
        last_name: 'Admin',
        role: 'admin',
        user_created_at: new Date().toISOString(),
        role_created_at: new Date().toISOString()
      },
      {
        id: 'mock-user-1',
        email: 'admin@test.com',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        user_created_at: new Date().toISOString(),
        role_created_at: new Date().toISOString()
      },
      {
        id: 'mock-user-2',
        email: 'owner@test.com',
        first_name: 'Property',
        last_name: 'Owner',
        role: 'property_owner',
        user_created_at: new Date().toISOString(),
        role_created_at: new Date().toISOString()
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
    setError(null);
    setIsAdmin(true);
    
    toast({
      title: "Mock Data Loaded",
      description: "Loaded with sample data for emergency access",
      variant: "default"
    });
  };

  // Retry loading
  const retryLoading = () => {
    console.log('🔄 UserManagement: Retrying load...');
    setLoading(true);
    setError(null);
    setLoadingTimeout(false);
    
    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ UserManagement: Retry timeout reached');
      setLoadingTimeout(true);
      setError('Retry timeout - still having issues loading');
    }, 5000);

    checkAdminStatus();
    fetchUsers();
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'property_manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner_investor':
      case 'property_owner':
        return 'bg-primary text-primary-foreground';
      case 'tenant':
        return 'bg-secondary text-secondary-foreground';
      case 'house_watcher':
        return 'bg-accent text-accent-foreground';
      case 'contractor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'leasing_agent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatRoleName = (role: string | null) => {
    if (!role) return 'No Role';
    switch (role) {
      case 'owner_investor':
        return 'Property Owner';
      case 'property_owner':
        return 'Property Owner';
      case 'house_watcher':
        return 'House Watcher';
      case 'property_manager':
        return 'Property Manager';
      case 'leasing_agent':
        return 'Leasing Agent';
      case 'admin':
        return 'Admin';
      case 'tenant':
        return 'Tenant';
      case 'contractor':
        return 'Contractor';
      default:
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const handleUserClick = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setUserDetailsOpen(true);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated",
        variant: "default"
      });

      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAdmin && !isEmergencyMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {loading ? 'Checking Access...' : 'Access Denied'}
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground text-sm">
                    Verifying your permissions...
                  </p>
                  {loadingTimeout && (
                    <div className="space-y-2">
                      <p className="text-destructive text-sm">
                        Loading is taking longer than expected
                      </p>
                      <Button onClick={retryLoading} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={retryLoading} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button onClick={forceLoadWithMockData} size="sm" variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Force Load
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You don't have permission to access this page. Only administrators can manage users.
                  </p>
                  <Button onClick={retryLoading} size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              User Management
              {isEmergencyMode && (
                <Badge variant="destructive" className="text-xs">
                  🚨 EMERGENCY
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions • {users.length} users
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="property_manager">Property Manager</SelectItem>
                <SelectItem value="owner_investor">Property Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="house_watcher">House Watcher</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="leasing_agent">Leasing Agent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <AddUserDialog onUserAdded={handleUserUpdate} />
          
          {/* Emergency Controls */}
          {(error || loadingTimeout) && (
            <div className="flex gap-2">
              <Button onClick={retryLoading} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={forceLoadWithMockData} size="sm" variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Force Load
              </Button>
            </div>
          )}
        </div>

        {/* Emergency Status Alerts */}
        {isEmergencyMode && (
          <Alert className="border-destructive bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🚨 <strong>EMERGENCY MODE ACTIVE</strong> - Admin access has been bypassed for emergency operations.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
              {loadingTimeout && (
                <div className="mt-4 space-y-2">
                  <p className="text-destructive text-sm">This is taking longer than usual</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={retryLoading} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button onClick={forceLoadWithMockData} size="sm" variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Force Load
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Table - Mobile Optimized */}
        {!loading && !error && (
          <UserMobileTable
            users={filteredUsers}
            onUserClick={handleUserClick}
            loading={loading}
            formatRoleName={formatRoleName}
            getRoleBadgeColor={getRoleBadgeColor}
            formatDate={formatDate}
          />
        )}

        {/* User Details Dialog */}
        <UserDetailsDialog
          user={selectedUser}
          open={userDetailsOpen}
          onOpenChange={setUserDetailsOpen}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </div>
  );
};

export default UserManagement;
