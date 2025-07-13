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
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, User, Crown, Building, Home, Shield, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const availableRoles = [
  {
    role: 'admin',
    label: 'Admin User',
    icon: Crown,
    description: 'Full system access',
  },
  {
    role: 'owner_investor',
    label: 'Property Owner',
    icon: Building,
    description: 'Manage owned properties',
  },
  {
    role: 'tenant',
    label: 'Tenant',
    icon: Home,
    description: 'Tenant portal access',
  },
  {
    role: 'house_watcher',
    label: 'House Watcher',
    icon: Shield,
    description: 'Property monitoring',
  }
];

export function RoleSwitcher() {
  const { userRole, getRoleDisplayName, user } = useUserRole();
  const [switching, setSwitching] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's roles on component mount
  useEffect(() => {
    if (user?.id) {
      fetchUserRoles();
    }
  }, [user?.id]);

  const fetchUserRoles = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_roles', { _user_id: user.id });

      if (error) throw error;
      
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const switchToRole = async (targetRole: string) => {
    if (switching || !user?.id || userRole === targetRole) return;
    
    setSwitching(true);
    
    try {
      // Check if user actually has this role
      const hasRole = userRoles.includes(targetRole);
      if (!hasRole) {
        // Add the role to the user
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: targetRole as any,
            assigned_by: user.id
          });

        if (insertError && !insertError.message.includes('duplicate')) {
          throw insertError;
        }
      }

      // Store the preferred role in localStorage for immediate effect
      localStorage.setItem('preferred_role', targetRole);

      toast({
        title: "Role Switched",
        description: `Successfully switched to ${availableRoles.find(r => r.role === targetRole)?.label}`,
      });

      // Force page reload to refresh auth state
      window.location.href = '/';
      
    } catch (error) {
      console.error('Role switch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Switch Failed",
        description: errorMessage,
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

  const currentRoleConfig = availableRoles.find(role => role.role === userRole);
  const CurrentIcon = currentRoleConfig?.icon || User;

  // Show loading state while fetching roles
  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
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
          Switch Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableRoles.map((role) => {
          const Icon = role.icon;
          const isCurrent = userRole === role.role;
          const hasRole = userRoles.includes(role.role);
          
          return (
            <DropdownMenuItem
              key={role.role}
              onClick={() => switchToRole(role.role)}
              disabled={switching || isCurrent}
              className="flex items-center gap-3 py-3"
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{role.label}</span>
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {!hasRole && (
                    <Badge variant="outline" className="text-xs">
                      Will Add
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.description}
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