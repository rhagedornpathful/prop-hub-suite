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
  disabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInInput = activeElement?.tagName === 'INPUT' || 
                     activeElement?.tagName === 'TEXTAREA' ||
                     activeElement?.getAttribute('contenteditable') === 'true';

    // Handle help toggle
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey && !isInInput) {
      event.preventDefault();
      setIsHelpOpen(prev => !prev);
      return;
    }

    // Skip shortcuts when typing in inputs (unless explicitly allowed)
    if (isInInput && !event.ctrlKey && !event.metaKey) {
      return;
    }

    // Handle other shortcuts
    for (const shortcut of shortcuts) {
      if (shortcut.disabled) continue;

      const ctrlOrCmd = (event.ctrlKey && shortcut.ctrlKey) || (event.metaKey && shortcut.metaKey);
      const matchesModifiers = 
        (!shortcut.ctrlKey && !shortcut.metaKey || ctrlOrCmd) &&
        (!!event.shiftKey === !!shortcut.shiftKey) &&
        (!!event.altKey === !!shortcut.altKey);

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && matchesModifiers) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
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