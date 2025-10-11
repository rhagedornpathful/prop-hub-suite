import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category?: 'navigation' | 'actions' | 'dialogs' | 'general';
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  section?: string;
  disabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  // Default global shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'p',
      ctrl: true,
      description: 'Go to Properties',
      category: 'navigation',
      action: () => navigate('/properties'),
    },
    {
      key: 't',
      ctrl: true,
      description: 'Go to Tenants',
      category: 'navigation',
      action: () => navigate('/tenants'),
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Go to Maintenance',
      category: 'navigation',
      action: () => navigate('/maintenance'),
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Go to Finances',
      category: 'navigation',
      action: () => navigate('/finances'),
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to Home',
      category: 'navigation',
      action: () => navigate('/'),
    },
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

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

    // Skip shortcuts when typing in inputs
    if (isInInput && !event.ctrlKey && !event.metaKey) {
      return;
    }

    // Handle other shortcuts
    for (const shortcut of allShortcuts) {
      if (shortcut.disabled) continue;

      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [allShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const getShortcutsByCategory = () => {
    const grouped: Record<string, KeyboardShortcut[]> = {
      navigation: [],
      actions: [],
      dialogs: [],
      general: [],
    };

    allShortcuts.forEach(shortcut => {
      if (shortcut.category) {
        grouped[shortcut.category].push(shortcut);
      }
    });

    return grouped;
  };

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return {
    isHelpOpen,
    closeHelp,
    shortcuts: allShortcuts,
    getShortcutsByCategory,
    formatShortcut,
  };
}

export const useEnhancedKeyboardShortcuts = useKeyboardShortcuts;