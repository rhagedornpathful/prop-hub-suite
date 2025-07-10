import { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  section?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Handle help toggle
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const activeElement = document.activeElement;
      // Only show help if not focused on an input
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        setIsHelpOpen(prev => !prev);
        return;
      }
    }

    // Handle other shortcuts
    for (const shortcut of shortcuts) {
      const ctrlOrCmd = (event.ctrlKey && shortcut.ctrlKey) || (event.metaKey && shortcut.metaKey);
      const matchesModifiers = 
        (!shortcut.ctrlKey && !shortcut.metaKey || ctrlOrCmd) &&
        (!!event.shiftKey === !!shortcut.shiftKey) &&
        (!!event.altKey === !!shortcut.altKey);

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && matchesModifiers) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  return {
    isHelpOpen,
    closeHelp
  };
}