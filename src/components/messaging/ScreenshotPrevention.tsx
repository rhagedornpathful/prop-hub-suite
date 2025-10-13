import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface ScreenshotPreventionProps {
  enabled: boolean;
  onScreenshotAttempt?: () => void;
}

export const ScreenshotPrevention = ({ enabled, onScreenshotAttempt }: ScreenshotPreventionProps) => {
  useEffect(() => {
    if (!enabled) return;

    // Detect screenshot attempts (limited browser support)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User might be taking a screenshot
        console.log('Potential screenshot attempt detected');
        onScreenshotAttempt?.();
      }
    };

    // Disable certain keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      if (
        (e.metaKey || e.ctrlKey) && 
        (e.shiftKey && (e.key === '3' || e.key === '4')) // macOS screenshots
      ) {
        e.preventDefault();
        toast({
          title: "Screenshot prevented",
          description: "Screenshots are disabled for this confidential conversation",
          variant: "destructive"
        });
        onScreenshotAttempt?.();
      }

      // Prevent Print Screen key (Windows)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast({
          title: "Screenshot prevented",
          description: "Screenshots are disabled for this confidential conversation",
          variant: "destructive"
        });
        onScreenshotAttempt?.();
      }
    };

    // Add CSS to prevent text selection and right-click
    const style = document.createElement('style');
    style.textContent = `
      .screenshot-protected {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      .screenshot-protected * {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Action disabled",
        description: "Right-click is disabled for confidential messages",
        variant: "destructive"
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.head.removeChild(style);
    };
  }, [enabled, onScreenshotAttempt]);

  return null; // This is a behavioral component with no UI
};
