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
  Bell,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AddUserDialog from "@/components/AddUserDialog";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  user_created_at: string;
  role_created_at: string | null;
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
      
      // Updated query to get only one row per user with their most recent role
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('user_created_at', { ascending: false });

      if (error) {
        console.error('❌ UserManagement: Fetch users error:', error);
        throw error;
      }
      
      console.log('📊 UserManagement: Raw data fetched:', data?.length || 0, 'entries');
      
      // Deduplicate users client-side, keeping the most recent role for each user
      const deduplicatedUsers = data ? data.reduce((acc: UserProfile[], user) => {
        const existingUser = acc.find(u => u.id === user.id);
        if (!existingUser) {
          acc.push(user);
        } else {
          // Keep the user with the most recent role_created_at
          if (user.role_created_at && (!existingUser.role_created_at || user.role_created_at > existingUser.role_created_at)) {
            const index = acc.findIndex(u => u.id === user.id);
            acc[index] = user;
          }
        }
        return acc;
      }, []) : [];
      
      console.log('✅ UserManagement: Deduplicated users:', deduplicatedUsers.length, 'unique users');
      setUsers(deduplicatedUsers);
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
      case 'property_owner':
        return 'bg-primary text-primary-foreground';
      case 'tenant':
        return 'bg-secondary text-secondary-foreground';
      case 'house_watcher':
        return 'bg-accent text-accent-foreground';
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
      case 'admin':
        return 'Admin';
      case 'tenant':
        return 'Tenant';
      default:
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                User Management
                {isEmergencyMode && (
                  <Badge variant="destructive" className="text-xs">
                    🚨 EMERGENCY
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">Manage user accounts and roles</p>
            </div>
            <Badge variant="secondary" className="ml-4">
              {users.length} Users
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                3
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Error/Status Banner */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {isEmergencyMode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/50 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                🚨 Emergency admin mode active - Authentication bypassed
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users by name or email..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-background border-border z-50">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="house_watcher">House Watcher</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
            <AddUserDialog onUserAdded={fetchUsers} />
          </div>

          {/* Users Table */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {loadingTimeout ? 'Loading timeout - taking longer than expected...' : 'Loading users...'}
                  </p>
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
              ) : error ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Loading Failed</h3>
                    <p className="text-muted-foreground text-sm mb-4">{error}</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={retryLoading} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Loading
                      </Button>
                      <Button onClick={forceLoadWithMockData} size="sm" variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Force Load with Mock Data
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userProfile) => (
                      <TableRow key={userProfile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {userProfile.first_name && userProfile.last_name
                                  ? `${userProfile.first_name} ${userProfile.last_name}`
                                  : 'No Name Set'
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {userProfile.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {userProfile.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(userProfile.role)}>
                            {formatRoleName(userProfile.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userProfile.role || ''}
                            onValueChange={(newRole) => updateUserRole(userProfile.id, newRole)}
                            disabled={userProfile.id === user?.id} // Prevent self-role change
                          >
                            <SelectTrigger className="w-40 bg-background border-border z-40">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border shadow-lg z-40">
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="property_owner">Property Owner</SelectItem>
                              <SelectItem value="tenant">Tenant</SelectItem>
                              <SelectItem value="house_watcher">House Watcher</SelectItem>
                            </SelectContent>
                          </Select>
                          {userProfile.id === user?.id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Cannot change own role
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(userProfile.user_created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || roleFilter !== "all" 
                      ? "Try adjusting your search terms or filters." 
                      : "No users are currently registered in the system."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;