import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Crown, Settings, AlertTriangle, X } from 'lucide-react';
import { useDevAdmin } from '@/contexts/DevAdminContext';

export function DevAdminToggle() {
  const { isDevAdminActive, toggleDevAdmin, isDevelopment } = useDevAdmin();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(isDevAdminActive);
  }, [isDevAdminActive]);

  // Don't render anything if not in development
  if (!isDevelopment) {
    return null;
  }

  return (
    <>
      {/* Development Admin Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Development Admin Mode Active</span>
              <Badge variant="secondary" className="bg-orange-400 text-orange-900">
                DEV ONLY
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-white hover:bg-orange-600 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Dev Admin Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={isDevAdminActive ? "default" : "outline"}
              size="sm"
              className={`shadow-lg border-2 ${
                isDevAdminActive 
                  ? 'border-orange-500 bg-orange-500 hover:bg-orange-600' 
                  : 'border-muted-foreground/20'
              }`}
            >
              <Settings className="h-4 w-4 mr-1" />
              DEV
              {isDevAdminActive && <Crown className="h-3 w-3 ml-1" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h4 className="font-medium">Development Tools</h4>
                <Badge variant="outline" className="text-xs">
                  DEV ONLY
                </Badge>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  These tools are only available in development mode and will not work in production.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dev-admin-toggle" className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Temporary Admin Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Grant admin privileges without changing database
                    </p>
                  </div>
                  <Switch
                    id="dev-admin-toggle"
                    checked={isDevAdminActive}
                    onCheckedChange={toggleDevAdmin}
                  />
                </div>

                {isDevAdminActive && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-xs">
                      <strong>Admin mode active!</strong> You now have temporary admin privileges. 
                      This won't change your actual role in the database.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground">
                Environment: {import.meta.env.MODE}<br />
                Host: {window.location.hostname}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}