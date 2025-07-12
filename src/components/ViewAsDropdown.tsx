import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronDown, Shield, Building, Users, Home, Wrench } from "lucide-react";
import { useViewAs } from "@/contexts/ViewAsContext";

export function ViewAsDropdown() {
  const { viewAsRole, isViewingAs, setViewAsRole, canUseViewAs } = useViewAs();

  if (!canUseViewAs) {
    return null;
  }

  const roleOptions = [
    { value: 'admin', label: 'Administrator', icon: Shield },
    { value: 'property_manager', label: 'Property Manager', icon: Building },
    { value: 'owner_investor', label: 'Property Owner', icon: Home },
    { value: 'tenant', label: 'Tenant', icon: Users },
    { value: 'house_watcher', label: 'House Watcher', icon: Wrench },
  ];

  const currentRoleLabel = isViewingAs 
    ? roleOptions.find(role => role.value === viewAsRole)?.label || 'Unknown'
    : 'Admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-sm font-medium gap-2"
        >
          <Eye className="h-4 w-4" />
          View as: {currentRoleLabel}
          {isViewingAs && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>View as different role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isActive = isViewingAs ? viewAsRole === role.value : role.value === 'admin';
          
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => {
                if (role.value === 'admin') {
                  setViewAsRole(null); // Exit view as mode
                } else {
                  setViewAsRole(role.value as any);
                }
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{role.label}</span>
                </div>
                {isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground cursor-default">
          <Eye className="h-3 w-3 mr-2" />
          See what different roles experience
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}