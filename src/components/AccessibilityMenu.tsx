import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accessibility, X, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  screenReader: boolean;
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 100,
      contrast: 'normal',
      reducedMotion: false,
      screenReader: false,
    };
  });

  const saveSettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // High contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader optimizations
    if (settings.screenReader) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  };

  // Apply settings on component mount
  useState(() => {
    applySettings(settings);
  });

  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 10, 150);
    saveSettings({ ...settings, fontSize: newSize });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 10, 80);
    saveSettings({ ...settings, fontSize: newSize });
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      contrast: 'normal',
      reducedMotion: false,
      screenReader: false,
    };
    saveSettings(defaultSettings);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        aria-label="Open accessibility menu"
      >
        <Accessibility className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Accessibility</CardTitle>
            <CardDescription>Customize your viewing experience</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close accessibility menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Font Size Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Text Size</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseFontSize}
              disabled={settings.fontSize <= 80}
              aria-label="Decrease font size"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 px-2">
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => saveSettings({ ...settings, fontSize: value })}
                min={80}
                max={150}
                step={10}
                aria-label="Font size"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={increaseFontSize}
              disabled={settings.fontSize >= 150}
              aria-label="Increase font size"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {settings.fontSize}% of normal size
          </p>
        </div>

        <Separator />

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">High Contrast</Label>
            <p className="text-xs text-muted-foreground">
              Increase color contrast for better visibility
            </p>
          </div>
          <Switch
            checked={settings.contrast === 'high'}
            onCheckedChange={(checked) => 
              saveSettings({ ...settings, contrast: checked ? 'high' : 'normal' })
            }
            aria-label="Toggle high contrast"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Reduced Motion</Label>
            <p className="text-xs text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => 
              saveSettings({ ...settings, reducedMotion: checked })
            }
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Screen Reader Optimization */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Screen Reader Mode</Label>
            <p className="text-xs text-muted-foreground">
              Optimize for screen reader users
            </p>
          </div>
          <Switch
            checked={settings.screenReader}
            onCheckedChange={(checked) => 
              saveSettings({ ...settings, screenReader: checked })
            }
            aria-label="Toggle screen reader optimization"
          />
        </div>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetSettings}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
}

// Add accessibility CSS to index.css
export const accessibilityCSS = `
/* High contrast mode */
.high-contrast {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 80%;
  --border: 0 0% 40%;
}

/* Reduced motion mode */
.reduced-motion * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

/* Screen reader optimizations */
.screen-reader-optimized {
  /* Ensure focus indicators are always visible */
}

.screen-reader-optimized *:focus {
  outline: 2px solid hsl(var(--primary)) !important;
  outline-offset: 2px !important;
}

/* Skip navigation link */
.skip-nav {
  position: absolute;
  top: -40px;
  left: 6px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-nav:focus {
  top: 6px;
}
`;