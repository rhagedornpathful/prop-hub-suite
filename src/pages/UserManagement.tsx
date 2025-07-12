import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
  Database,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
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
import { useAuth } from "@/hooks/useAuth";

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
  const [seeding, setSeeding] = useState(false);
  const [testUsersExist, setTestUsersExist] = useState(false);
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
    checkTestUsersExist();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

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
      
      console.log('📊 UserManagement: Querying user_profiles table...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('user_created_at', { ascending: false });

      if (error) {
        console.error('❌ UserManagement: Fetch users error:', error);
        throw error;
      }
      
      console.log('✅ UserManagement: Fetched users:', data?.length || 0, 'users');
      setUsers(data || []);
      
      // Check if test users exist after fetching users
      const testEmails = ['admin@test.com', 'owner@test.com', 'tenant@test.com', 'watcher@test.com'];
      const hasTestUsers = (data || []).some(user => testEmails.includes(user.email));
      setTestUsersExist(hasTestUsers);
      
      console.log('✅ UserManagement: Test users exist:', hasTestUsers);
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

  const checkTestUsersExist = async () => {
    console.log('🔍 UserManagement: Checking test users...');
    try {
      const testEmails = ['admin@test.com', 'owner@test.com', 'tenant@test.com', 'watcher@test.com'];
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .in('email', testEmails);

      if (error) {
        console.error('❌ UserManagement: Test users check error:', error);
        throw error;
      }
      
      console.log('✅ UserManagement: Test users check result:', (data || []).length, 'found');
      setTestUsersExist((data || []).length > 0);
    } catch (error) {
      console.error('❌ UserManagement: Error checking test users:', error);
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
    checkTestUsersExist();
  };

  const seedTestUsers = async () => {
    console.log('🌱 UserManagement: Starting seed test users...');
    try {
      setSeeding(true);
      setError(null);
      
      console.log('🌱 UserManagement: Calling seed_test_users RPC...');
      const { data, error } = await supabase.rpc('seed_test_users');
      
      if (error) {
        console.error('❌ UserManagement: Seed error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Show detailed error information
        const errorMessage = `
Database Error: ${error.message}

Code: ${error.code}
${error.details ? `Details: ${error.details}` : ''}
${error.hint ? `Hint: ${error.hint}` : ''}

This usually means the test users don't exist in Supabase Auth. 
You need to create them manually first.`;
        
        setError(errorMessage);
        
        toast({
          title: "Seeding Failed - Detailed Error",
          description: `${error.message}. ${error.code === '23503' ? 'Test users must be created in Supabase Auth first.' : 'Check console for details.'}`,
          variant: "destructive"
        });
        
        throw error;
      }
      
      console.log('✅ UserManagement: Seed successful:', data);
      toast({
        title: "Success",
        description: data || "Test users and data seeded successfully!",
      });
      
      // Refresh users list
      await fetchUsers();
      
    } catch (error: any) {
      console.error('❌ UserManagement: Error seeding test users:', error);
      
      // More detailed error handling
      const isAuthError = error?.code === '23503' && error?.message?.includes('user_id');
      const isForeignKeyError = error?.message?.includes('foreign key constraint');
      
      let userFriendlyMessage = "Failed to seed test data.";
      
      if (isAuthError || isForeignKeyError) {
        userFriendlyMessage = `Cannot create test data because the auth users don't exist. 
        
You need to:
1. Go to Supabase Auth dashboard 
2. Create users with emails: admin@test.com, owner@test.com, tenant@test.com, watcher@test.com
3. Then run this seed function again.

Or use the "Create Role-Only Data" button below for emergency testing.`;
      }
      
      setError(userFriendlyMessage);
      
      toast({
        title: "Seeding Failed",
        description: isAuthError ? "Auth users must be created first" : "Failed to seed test data. Check error details above.",
        variant: "destructive"
      });
    } finally {
      setSeeding(false);
    }
  };

  // Create role-only data for emergency testing
  const createRoleOnlyData = async () => {
    console.log('🔧 UserManagement: Creating role-only test data...');
    try {
      setSeeding(true);
      setError(null);
      
      // Create mock user profiles directly (for emergency testing)
      const mockProfiles = [
        {
          id: 'mock-admin-1',
          email: 'admin@test.com',
          first_name: 'Test',
          last_name: 'Admin',
          user_created_at: new Date().toISOString()
        },
        {
          id: 'mock-owner-1', 
          email: 'owner@test.com',
          first_name: 'Property',
          last_name: 'Owner',
          user_created_at: new Date().toISOString()
        },
        {
          id: 'mock-tenant-1',
          email: 'tenant@test.com', 
          first_name: 'Test',
          last_name: 'Tenant',
          user_created_at: new Date().toISOString()
        },
        {
          id: 'mock-watcher-1',
          email: 'watcher@test.com',
          first_name: 'House',
          last_name: 'Watcher', 
          user_created_at: new Date().toISOString()
        }
      ];

      // Add these as mock users to the state for emergency testing
      const mockUsersWithRoles = mockProfiles.map((profile, index) => ({
        ...profile,
        role: ['admin', 'property_owner', 'tenant', 'house_watcher'][index],
        role_created_at: new Date().toISOString()
      }));

      setUsers(prevUsers => [...prevUsers, ...mockUsersWithRoles]);
      
      toast({
        title: "Mock Test Data Created",
        description: "Created role-only test data for emergency testing (not persisted to database)",
        variant: "default"
      });
      
    } catch (error: any) {
      console.error('❌ UserManagement: Error creating role-only data:', error);
      toast({
        title: "Error",
        description: "Failed to create role-only test data",
        variant: "destructive"
      });
    } finally {
      setSeeding(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
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
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-subtle">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
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
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
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
              {/* Test Data Seeding Section */}
              {isAdmin && (
                <Card className="border-dashed border-2 border-muted">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-5 w-5 text-primary" />
                      Development Test Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-3">
                          Seed the database with test users and sample data for development and testing purposes.
                        </p>
                        
                        {testUsersExist && (
                          <Alert className="mb-4">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Test users already exist in the system. You can re-run seeding to update test data.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Test Account Credentials:</strong>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                              <div>admin@test.com / testpass123</div>
                              <div>owner@test.com / testpass123</div>
                              <div>tenant@test.com / testpass123</div>
                              <div>watcher@test.com / testpass123</div>
                            </div>
                          </AlertDescription>
                        </Alert>
                        
                        {/* Manual Setup Instructions */}
                        {error && error.includes('auth users') && (
                          <Alert className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-950/50">
                            <Info className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                              <strong>Manual Setup Required:</strong>
                              <ol className="mt-2 ml-4 list-decimal text-xs space-y-1">
                                <li>Go to Supabase Dashboard → Authentication → Users</li>
                                <li>Click "Add User" for each test account</li>
                                <li>Create users with the emails shown above</li>
                                <li>Set password to "testpass123" for each</li>
                                <li>Then run "Seed Test Data" again</li>
                              </ol>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <div className="shrink-0 space-y-2">
                        <Button 
                          onClick={seedTestUsers}
                          disabled={seeding}
                          variant={testUsersExist ? "outline" : "default"}
                          className="w-full"
                        >
                          {seeding ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Seeding...
                            </>
                          ) : (
                            <>
                              <Database className="h-4 w-4 mr-2" />
                              {testUsersExist ? 'Re-seed Test Data' : 'Seed Test Data'}
                            </>
                          )}
                        </Button>
                        
                        {error && error.includes('auth users') && (
                          <Button 
                            onClick={createRoleOnlyData}
                            disabled={seeding}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                          >
                            {seeding ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <UserCog className="h-4 w-4 mr-2" />
                                Create Role-Only Data
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
      </div>
    </SidebarProvider>
  );
};

export default UserManagement;