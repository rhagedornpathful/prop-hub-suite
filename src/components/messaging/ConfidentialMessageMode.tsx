import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert, Timer, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfidentialMessageModeProps {
  onConfidentialSettingsChange: (settings: {
    expiresIn?: number;
    viewOnce?: boolean;
    screenshotPrevention?: boolean;
  }) => void;
}

export const ConfidentialMessageMode = ({ onConfidentialSettingsChange }: ConfidentialMessageModeProps) => {
  const [isConfidential, setIsConfidential] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>('none');
  const [viewOnce, setViewOnce] = useState(false);
  const [screenshotPrevention, setScreenshotPrevention] = useState(false);

  const handleApply = () => {
    const expirationMinutes = expiresIn !== 'none' ? parseInt(expiresIn) : undefined;
    
    onConfidentialSettingsChange({
      expiresIn: expirationMinutes,
      viewOnce,
      screenshotPrevention
    });

    setIsConfidential(false);
  };

  return (
    <Dialog open={isConfidential} onOpenChange={setIsConfidential}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <ShieldAlert className="h-4 w-4 mr-2" />
          Confidential
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confidential Message Settings</DialogTitle>
          <DialogDescription>
            Configure privacy and security settings for this message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Confidential messages have enhanced privacy features including expiration and view restrictions.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expires" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Message Expiration
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger id="expires">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Never expires</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                  <SelectItem value="10080">7 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Message will be automatically deleted after the specified time
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="view-once" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Once
                </Label>
                <p className="text-sm text-muted-foreground">
                  Message can only be viewed once before being deleted
                </p>
              </div>
              <Switch 
                id="view-once"
                checked={viewOnce} 
                onCheckedChange={setViewOnce} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screenshot" className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Screenshot Prevention
                </Label>
                <p className="text-sm text-muted-foreground">
                  Attempt to prevent screenshots (limited browser support)
                </p>
              </div>
              <Switch 
                id="screenshot"
                checked={screenshotPrevention} 
                onCheckedChange={setScreenshotPrevention} 
              />
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            Apply Confidential Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
