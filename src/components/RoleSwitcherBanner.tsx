import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RoleSwitcherBanner = () => {
  const { isRoleSwitched, activeRole, switchRole } = useAuth();

  if (!isRoleSwitched) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    property_manager: 'Property Manager',
    owner_investor: 'Property Owner',
    tenant: 'Tenant',
    house_watcher: 'House Watcher',
    contractor: 'Contractor',
    client: 'Client',
    leasing_agent: 'Leasing Agent',
  };

  return (
    <Alert className="border-primary bg-primary/10 mb-4">
      <Shield className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">Admin Mode:</span>
          <span>You are viewing the app as a <strong>{roleLabels[activeRole!]}</strong></span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => switchRole(null)}
          className="h-8"
        >
          <X className="h-4 w-4 mr-2" />
          Exit Role Switch
        </Button>
      </AlertDescription>
    </Alert>
  );
};
