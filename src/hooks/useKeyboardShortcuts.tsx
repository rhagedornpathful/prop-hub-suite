import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, cmd, shift, alt, callback, preventDefault = true }) => {
        const ctrlPressed = ctrl ? event.ctrlKey : true;
        const cmdPressed = cmd ? event.metaKey : true;
        const shiftPressed = shift ? event.shiftKey : !event.shiftKey;
        const altPressed = alt ? event.altKey : !event.altKey;

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? cmdPressed : ctrlPressed;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          modifierKey &&
          shiftPressed &&
          altPressed
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for messaging
export const useMessagingShortcuts = ({
  onSend,
  onCancel,
  onCompose
}: {
  onSend?: () => void;
  onCancel?: () => void;
  onCompose?: () => void;
}) => {
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      cmd: true,
      callback: () => onSend?.(),
      preventDefault: true
    },
    {
      key: 'Escape',
      callback: () => onCancel?.(),
      preventDefault: true
    },
    {
      key: 'n',
      ctrl: true,
      cmd: true,
      callback: () => onCompose?.(),
      preventDefault: true
    }
  ]);
};
