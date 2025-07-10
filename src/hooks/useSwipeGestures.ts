import { useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
}

export function useSwipeGestures(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    velocity = 0.5,
    preventScroll = false
  } = options;

  const bind = useDrag(
    ({ 
      movement: [mx, my], 
      velocity: [vx, vy], 
      direction: [dx, dy], 
      last,
      event
    }) => {
      if (preventScroll && event) {
        event.preventDefault();
      }

      if (last) {
        const isHorizontalSwipe = Math.abs(mx) > Math.abs(my);
        const isVerticalSwipe = Math.abs(my) > Math.abs(mx);

        // Horizontal swipes
        if (isHorizontalSwipe && Math.abs(mx) > threshold && Math.abs(vx) > velocity) {
          if (dx > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight();
          } else if (dx < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft();
          }
        }

        // Vertical swipes
        if (isVerticalSwipe && Math.abs(my) > threshold && Math.abs(vy) > velocity) {
          if (dy > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown();
          } else if (dy < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp();
          }
        }
      }
    },
    {
      axis: undefined, // Allow both axes
      threshold: 10,
      preventScroll: preventScroll
    }
  );

  return bind;
}

// Helper hook for navigation swipes
export function useNavigationSwipes(
  onNext?: () => void,
  onPrevious?: () => void,
  enabled: boolean = true
) {
  const swipeCallbacks = useCallback(() => ({
    onSwipeLeft: enabled ? onNext : undefined,
    onSwipeRight: enabled ? onPrevious : undefined,
  }), [onNext, onPrevious, enabled]);

  return useSwipeGestures(swipeCallbacks(), {
    threshold: 80,
    velocity: 0.3,
    preventScroll: false
  });
}