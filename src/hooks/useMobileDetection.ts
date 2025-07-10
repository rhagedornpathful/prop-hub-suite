import { useState, useEffect } from 'react';

export interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  viewport: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        viewport: 'desktop',
        orientation: 'landscape',
      };
    }

    const width = window.innerWidth;
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isDesktop = width >= BREAKPOINTS.tablet;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    let viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (isMobile) viewport = 'mobile';
    else if (isTablet) viewport = 'tablet';

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      viewport,
      orientation,
    };
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const isMobile = width < BREAKPOINTS.mobile;
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
      const isDesktop = width >= BREAKPOINTS.tablet;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

      let viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) viewport = 'mobile';
      else if (isTablet) viewport = 'tablet';

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        viewport,
        orientation,
      });
    };

    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
    const tabletQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
    
    const handleChange = () => updateDetection();
    
    mediaQuery.addEventListener('change', handleChange);
    tabletQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      tabletQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}