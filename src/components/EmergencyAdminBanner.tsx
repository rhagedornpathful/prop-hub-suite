import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

export function EmergencyAdminBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkEmergencyMode = () => {
      const isEmergencyMode = sessionStorage.getItem('emergencyAdmin') === 'true' || 
                             (window as any).__EMERGENCY_ADMIN_MODE__;
      setIsVisible(isEmergencyMode);
    };

    // Check initially
    checkEmergencyMode();

    // Check periodically in case emergency mode is activated
    const interval = setInterval(checkEmergencyMode, 1000);

    return () => clearInterval(interval);
  }, []);

  const exitEmergencyMode = () => {
    sessionStorage.removeItem('emergencyAdmin');
    sessionStorage.removeItem('emergencyAdminUser');
    delete (window as any).__EMERGENCY_ADMIN_MODE__;
    setIsVisible(false);
    
    // Redirect to auth page
    window.location.href = '/auth';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="rounded-none border-0 border-b bg-red-600 border-red-700 text-white">
      <AlertTriangle className="h-4 w-4 text-white" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="font-medium">
          🚨 EMERGENCY ADMIN MODE ACTIVE - Authentication Bypassed - All Security Checks Disabled
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={exitEmergencyMode}
          className="ml-4 bg-red-700 border-red-500 text-white hover:bg-red-800 hover:border-red-400"
        >
          <X className="h-3 w-3 mr-1" />
          Exit Emergency Mode
        </Button>
      </AlertDescription>
    </Alert>
  );
}