import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationProps<T> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getItemId: (item: T) => string;
  enabled?: boolean;
}

export const useKeyboardNavigation = <T>({
  items,
  selectedId,
  onSelect,
  getItemId,
  enabled = true,
}: UseKeyboardNavigationProps<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      const currentIndex = items.findIndex((item) => getItemId(item) === selectedId);

      switch (event.key) {
        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          if (currentIndex < items.length - 1) {
            const nextItem = items[currentIndex + 1];
            onSelect(getItemId(nextItem));
            scrollToItem(currentIndex + 1);
          }
          break;

        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          if (currentIndex > 0) {
            const prevItem = items[currentIndex - 1];
            onSelect(getItemId(prevItem));
            scrollToItem(currentIndex - 1);
          } else if (currentIndex === -1 && items.length > 0) {
            // No selection, select first item
            onSelect(getItemId(items[0]));
            scrollToItem(0);
          }
          break;

        case 'Home':
          event.preventDefault();
          if (items.length > 0) {
            onSelect(getItemId(items[0]));
            scrollToItem(0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (items.length > 0) {
            const lastIndex = items.length - 1;
            onSelect(getItemId(items[lastIndex]));
            scrollToItem(lastIndex);
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (currentIndex >= 0) {
            // Trigger additional action (like opening message)
            const item = items[currentIndex];
            onSelect(getItemId(item));
          }
          break;

        default:
          break;
      }
    },
    [items, selectedId, onSelect, getItemId, enabled]
  );

  const scrollToItem = (index: number) => {
    if (!listRef.current) return;

    const itemElements = listRef.current.querySelectorAll('[role="option"]');
    const targetElement = itemElements[index] as HTMLElement;

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      targetElement.focus();
    }
  };

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return { listRef };
};
