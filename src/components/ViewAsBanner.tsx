import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, X } from "lucide-react";
import { useViewAs } from "@/contexts/ViewAsContext";

export function ViewAsBanner() {
  const { viewAsRole, isViewingAs, exitViewAs } = useViewAs();

  if (!isViewingAs || !viewAsRole) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'property_manager':
        return 'Property Manager';
      case 'owner_investor':
        return 'Property Owner';
      case 'tenant':
        return 'Tenant';
      case 'house_watcher':
        return 'House Watcher';
      default:
        return role;
    }
  };

  return (
    <Alert className="rounded-none border-0 border-b bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-100">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="font-medium">
          Viewing as: {getRoleDisplayName(viewAsRole)} - You are seeing what this role would see
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={exitViewAs}
          className="ml-4 bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-800/50"
        >
          <X className="h-3 w-3 mr-1" />
          Exit View As
        </Button>
      </AlertDescription>
    </Alert>
  );
}