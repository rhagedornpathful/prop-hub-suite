import { useState } from 'react';
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
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, User, Crown, Building, Home, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const testAccounts = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    label: 'Admin User',
    icon: Crown,
    description: 'Full system access'
  },
  {
    email: 'owner@test.com',
    password: 'owner123',
    role: 'property_owner',
    label: 'Property Owner',
    icon: Building,
    description: 'Manage owned properties'
  },
  {
    email: 'tenant@test.com',
    password: 'tenant123',
    role: 'tenant',
    label: 'Tenant',
    icon: Home,
    description: 'Tenant portal access'
  },
  {
    email: 'watcher@test.com',
    password: 'watcher123',
    role: 'house_watcher',
    label: 'House Watcher',
    icon: Shield,
    description: 'Property monitoring'
  }
];

export function RoleSwitcher() {
  const { userRole, getRoleDisplayName, user } = useUserRole();
  const [switching, setSwitching] = useState(false);

  const switchToRole = async (account: typeof testAccounts[0]) => {
    if (switching) return;
    
    setSwitching(true);
    
    try {
      // Sign out current user
      await supabase.auth.signOut();
      
      // Sign in as the test account
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Role Switched",
        description: `Switched to ${account.label} (${account.email})`,
      });

      // Force page reload to reset all state
      window.location.reload();
      
    } catch (error) {
      console.error('Role switch error:', error);
      toast({
        title: "Switch Failed",
        description: "Could not switch roles. Make sure test accounts are seeded.",
        variant: "destructive",
      });
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{getRoleDisplayName()}</span>
          <Badge variant="secondary" className="hidden md:inline-flex">
            DEV
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Switch Test Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
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
        
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground justify-center">
          Development Mode Only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}