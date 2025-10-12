import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "prefers-reduced-motion" in their OS settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if browser supports matchMedia
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation class name that respects user's motion preferences
 * @param animationClass - The animation class to apply
 * @param fallbackClass - Optional class to use when motion is reduced
 */
export function useMotionSafeClass(
  animationClass: string,
  fallbackClass: string = ''
): string {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? fallbackClass : animationClass;
}

/**
 * Get animation duration that respects user's motion preferences
 * Returns 0 if user prefers reduced motion, otherwise returns the specified duration
 */
export function useMotionSafeDuration(durationMs: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : durationMs;
}
