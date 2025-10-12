import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  property_manager: 'Property Manager',
  owner_investor: 'Property Owner',
  tenant: 'Tenant',
  house_watcher: 'House Watcher',
  contractor: 'Contractor',
  client: 'Client',
  leasing_agent: 'Leasing Agent',
};

export const RoleSwitcher = () => {
  const { actualRole, activeRole, isRoleSwitched, switchRole } = useAuth();

  // Only show for admins
  if (actualRole !== 'admin') {
    return null;
  }

  const roles: AppRole[] = [
    'admin',
    'property_manager',
    'owner_investor',
    'tenant',
    'house_watcher',
    'contractor',
    'client',
    'leasing_agent',
  ];

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-2">
      <div className="flex items-center gap-2 px-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Admin Role Switcher</span>
      </div>
      
      {isRoleSwitched && (
        <div className="px-2">
          <Badge variant="secondary" className="w-full justify-between">
            <span className="text-xs">Viewing as: {roleLabels[activeRole!]}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => switchRole(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
      
      <div className="px-2">
        <Select
          value={activeRole || 'admin'}
          onValueChange={(value) => {
            if (value === 'admin') {
              switchRole(null);
            } else {
              switchRole(value as AppRole);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabels[role]}
                {role === 'admin' && ' (Actual)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="px-2">
        <p className="text-xs text-muted-foreground">
          Switch to experience the app as different user roles
        </p>
      </div>
    </div>
  );
};
