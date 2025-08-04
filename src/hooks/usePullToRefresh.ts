import { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistanceRatio?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRelease: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistanceRatio = 0.5
}: UsePullToRefreshOptions) {
  const { isTouchDevice } = useMobileDetection();
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRelease: false
  });

  const startY = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const lastTouchY = useRef(0);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(50); // Light haptic feedback
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isTouchDevice || state.isRefreshing) return;

    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  }, [isTouchDevice, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouchDevice || state.isRefreshing || !startY.current) return;

    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      setState(prev => ({ ...prev, isPulling: false, pullDistance: 0 }));
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;

    if (deltaY > 0) {
      // Prevent default scroll behavior when pulling down
      e.preventDefault();

      const distance = Math.min(deltaY * resistanceRatio, threshold * 1.5);
      const canRelease = distance >= threshold;

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance: distance,
        canRelease
      }));

      // Trigger haptic feedback when threshold is reached
      if (canRelease && !state.canRelease) {
        triggerHapticFeedback();
      }
    }

    lastTouchY.current = currentY;
  }, [isTouchDevice, state.isRefreshing, state.canRelease, threshold, resistanceRatio, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTouchDevice || state.isRefreshing) return;

    if (state.canRelease && state.pullDistance >= threshold) {
      setState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
      
      try {
        await onRefresh();
        triggerHapticFeedback(); // Success feedback
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setState(prev => ({ 
          ...prev, 
          isRefreshing: false, 
          pullDistance: 0, 
          canRelease: false 
        }));
      }
    } else {
      setState(prev => ({ 
        ...prev, 
        isPulling: false, 
        pullDistance: 0, 
        canRelease: false 
      }));
    }

    startY.current = 0;
  }, [isTouchDevice, state.isRefreshing, state.canRelease, state.pullDistance, threshold, onRefresh, triggerHapticFeedback]);

  const bindToContainer = useCallback((element: HTMLElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener('touchstart', handleTouchStart);
      containerRef.current.removeEventListener('touchmove', handleTouchMove);
      containerRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    containerRef.current = element;

    if (element && isTouchDevice) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isTouchDevice]);

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    bindToContainer,
    isEnabled: isTouchDevice
  };
}