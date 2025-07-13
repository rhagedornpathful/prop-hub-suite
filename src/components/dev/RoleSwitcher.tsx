import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, User, Crown, Building, Home, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const testAccounts = [
  {
    email: 'admin@test.com',
    password: 'testpass123',
    role: 'admin',
    label: 'Admin User',
    icon: Crown,
    description: 'Full system access',
    redirectPath: '/admin'
  },
  {
    email: 'owner@test.com',
    password: 'testpass123',
    role: 'owner_investor',
    label: 'Property Owner',
    icon: Building,
    description: 'Manage owned properties',
    redirectPath: '/properties'
  },
  {
    email: 'tenant@test.com',
    password: 'testpass123',
    role: 'tenant',
    label: 'Tenant',
    icon: Home,
    description: 'Tenant portal access',
    redirectPath: '/tenant/dashboard'
  },
  {
    email: 'watcher@test.com',
    password: 'testpass123',
    role: 'house_watcher',
    label: 'House Watcher',
    icon: Shield,
    description: 'Property monitoring',
    redirectPath: '/house-watching'
  }
];

export function RoleSwitcher() {
  const { userRole, getRoleDisplayName, user } = useUserRole();
  const [switching, setSwitching] = useState(false);
  const [testAccountsExist, setTestAccountsExist] = useState<boolean | null>(null);
  const [checkingAccounts, setCheckingAccounts] = useState(true);

  // Check if test accounts exist on component mount
  useEffect(() => {
    checkTestAccountsExist();
  }, []);

  const checkTestAccountsExist = async () => {
    try {
      setCheckingAccounts(true);
      const testEmails = testAccounts.map(account => account.email);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .in('email', testEmails);

      if (error) throw error;
      
      // Check if we have all test accounts
      const foundEmails = new Set(data?.map(user => user.email) || []);
      const hasAllAccounts = testEmails.every(email => foundEmails.has(email));
      
      setTestAccountsExist(hasAllAccounts);
    } catch (error) {
      console.error('Error checking test accounts:', error);
      setTestAccountsExist(false);
    } finally {
      setCheckingAccounts(false);
    }
  };

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const switchToRole = async (account: typeof testAccounts[0]) => {
    if (switching || !testAccountsExist) return;
    
    setSwitching(true);
    
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Sign out current user with global scope
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Global signout failed:', err);
      }

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sign in as the test account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user data returned after login');
      }

      // Verify role assignment
      const { data: roleData, error: roleError } = await supabase
        .rpc('has_role', { _user_id: data.user.id, _role: account.role as any });
      
      if (roleError) {
        throw new Error(`Role verification failed: ${roleError.message}`);
      }

      if (!roleData) {
        throw new Error(`User does not have ${account.role} role assigned`);
      }

      // Wait a moment for the auth context to update the role
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Role Switched",
        description: `Successfully switched to ${account.label} (${account.email})`,
      });

      // Force full page reload to main dashboard to refresh auth state
      window.location.href = '/';
      
    } catch (error) {
      console.error('Role switch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Switch Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clean up on error
      cleanupAuthState();
    } finally {
      setSwitching(false);
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const currentAccount = testAccounts.find(account => 
    user?.email === account.email
  );

  const CurrentIcon = currentAccount?.icon || User;

  // Show loading state while checking accounts
  if (checkingAccounts) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Checking...</span>
        <Badge variant="secondary" className="hidden md:inline-flex">
          DEV
        </Badge>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={switching}>
          {switching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CurrentIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {switching ? 'Switching...' : getRoleDisplayName()}
          </span>
          <Badge variant="secondary" className="hidden md:inline-flex">
            DEV
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Switch Test Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!testAccountsExist ? (
          <div className="p-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Test accounts not found. Please seed test data first.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {testAccounts.map((account) => {
              const Icon = account.icon;
              const isCurrent = user?.email === account.email;
              
              return (
                <DropdownMenuItem
                  key={account.email}
                  onClick={() => switchToRole(account)}
                  disabled={switching || isCurrent}
                  className="flex items-center gap-3 py-3"
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.label}</span>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {account.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground justify-center">
          Development Mode Only
        </DropdownMenuItem>
        
        {!testAccountsExist && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => window.location.href = '/user-management'}
              className="text-xs justify-center text-primary"
            >
              Go to User Management to Seed Data
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}