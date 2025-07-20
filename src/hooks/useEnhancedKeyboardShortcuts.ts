import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts, type KeyboardShortcut } from './useKeyboardShortcuts';
import { useTheme } from 'next-themes';
import { toast } from './use-toast';

interface UseEnhancedKeyboardShortcutsProps {
  onOpenCommandPalette?: () => void;
  onAddProperty?: () => void;
  onAddTenant?: () => void;
  onScheduleMaintenance?: () => void;
  onOpenSearch?: () => void;
}

export function useEnhancedKeyboardShortcuts({
  onOpenCommandPalette,
  onAddProperty,
  onAddTenant,
  onScheduleMaintenance,
  onOpenSearch
}: UseEnhancedKeyboardShortcutsProps = {}) {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  
  const shortcuts: KeyboardShortcut[] = [
    // Global shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        onOpenCommandPalette?.();
      },
      description: 'Open command palette',
      section: 'Global'
    },
    {
      key: '/',
      action: () => {
        onOpenSearch?.();
      },
      description: 'Focus search',
      section: 'Global'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals/dialogs
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      },
      description: 'Close dialogs/modals',
      section: 'Global'
    },

    // Navigation shortcuts (G + key)
    {
      key: 'g',
      action: () => {
        // Start navigation mode - listen for next key
        const handleNextKey = (e: KeyboardEvent) => {
          e.preventDefault();
          document.removeEventListener('keydown', handleNextKey);
          
          switch (e.key.toLowerCase()) {
            case 'd':
              navigate('/');
              toast({ title: 'Navigated to Dashboard' });
              break;
            case 'p':
              navigate('/properties');
              toast({ title: 'Navigated to Properties' });
              break;
            case 't':
              navigate('/tenants');
              toast({ title: 'Navigated to Tenants' });
              break;
            case 'm':
              navigate('/maintenance');
              toast({ title: 'Navigated to Maintenance' });
              break;
            case 'f':
              navigate('/finances');
              toast({ title: 'Navigated to Finances' });
              break;
            case 's':
              navigate('/messages');
              toast({ title: 'Navigated to Messages' });
              break;
            case 'h':
              navigate('/house-watching');
              toast({ title: 'Navigated to House Watching' });
              break;
            case 'a':
              navigate('/activity');
              toast({ title: 'Navigated to Activity' });
              break;
          }
        };
        
        document.addEventListener('keydown', handleNextKey);
        toast({ 
          title: 'Navigation Mode', 
          description: 'Press D(ashboard), P(roperties), T(enants), M(aintenance), F(inances), S(messages), H(ouse watching), or A(ctivity)' 
        });
      },
      description: 'Navigation mode - then press D, P, T, M, F, S, H, or A',
      section: 'Navigation'
    },

    // Quick actions (A + key)
    {
      key: 'a',
      action: () => {
        // Start action mode - listen for next key
        const handleNextKey = (e: KeyboardEvent) => {
          e.preventDefault();
          document.removeEventListener('keydown', handleNextKey);
          
          switch (e.key.toLowerCase()) {
            case 'p':
              onAddProperty?.();
              toast({ title: 'Adding new property' });
              break;
            case 't':
              onAddTenant?.();
              toast({ title: 'Adding new tenant' });
              break;
            case 'm':
              onScheduleMaintenance?.();
              toast({ title: 'Scheduling maintenance' });
              break;
          }
        };
        
        document.addEventListener('keydown', handleNextKey);
        toast({ 
          title: 'Action Mode', 
          description: 'Press P(roperty), T(enant), or M(aintenance)' 
        });
      },
      description: 'Action mode - then press P, T, or M',
      section: 'Quick Actions'
    },

    // Settings shortcuts
    {
      key: 't',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        toast({ 
          title: 'Theme changed', 
          description: `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode` 
        });
      },
      description: 'Toggle theme',
      section: 'Settings'
    },

    // Tools
    {
      key: 'c',
      action: () => {
        const calculation = prompt('Enter calculation (e.g., 1500 * 12):');
        if (calculation) {
          try {
            const result = Function(`"use strict"; return (${calculation})`)();
            toast({ 
              title: 'Calculation Result', 
              description: `${calculation} = ${result}` 
            });
          } catch (e) {
            toast({ 
              title: 'Invalid calculation', 
              description: 'Please enter a valid mathematical expression',
              variant: 'destructive'
            });
          }
        }
      },
      description: 'Open calculator',
      section: 'Tools'
    },

    // Arrow key navigation for lists
    {
      key: 'j',
      action: () => {
        // Focus next item in list
        const focusableElements = document.querySelectorAll('[data-keyboard-nav]');
        const currentIndex = Array.from(focusableElements).findIndex(el => 
          document.activeElement === el || el.contains(document.activeElement)
        );
        
        if (currentIndex < focusableElements.length - 1) {
          (focusableElements[currentIndex + 1] as HTMLElement).focus();
        }
      },
      description: 'Navigate down in lists',
      section: 'Navigation'
    },
    {
      key: 'k',
      action: () => {
        // Focus previous item in list
        const focusableElements = document.querySelectorAll('[data-keyboard-nav]');
        const currentIndex = Array.from(focusableElements).findIndex(el => 
          document.activeElement === el || el.contains(document.activeElement)
        );
        
        if (currentIndex > 0) {
          (focusableElements[currentIndex - 1] as HTMLElement).focus();
        }
      },
      description: 'Navigate up in lists',
      section: 'Navigation'
    }
  ];

  const { isHelpOpen, closeHelp } = useKeyboardShortcuts(shortcuts);

  return {
    shortcuts,
    isHelpOpen,
    closeHelp
  };
}