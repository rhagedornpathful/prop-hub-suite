import { useState, useEffect } from 'react';

interface PerformanceConfig {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  isLowEndDevice: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  viewportWidth: number;
}

interface MobileOptimizationSettings {
  reduceAnimations: boolean;
  limitRenderedItems: boolean;
  deferNonCritical: boolean;
  useOptimizedImages: boolean;
  enableVirtualization: boolean;
}

export const useMobilePerformance = () => {
  const [config, setConfig] = useState<PerformanceConfig>({
    prefersReducedMotion: false,
    isMobile: false,
    isLowEndDevice: false,
    connectionSpeed: 'fast',
    viewportWidth: 0
  });

  const [optimizations, setOptimizations] = useState<MobileOptimizationSettings>({
    reduceAnimations: false,
    limitRenderedItems: false,
    deferNonCritical: false,
    useOptimizedImages: false,
    enableVirtualization: false
  });

  useEffect(() => {
    const detectPerformanceCapabilities = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detect mobile device
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Get viewport width
      const viewportWidth = window.innerWidth;
      
      // Detect low-end device (approximation)
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowEndDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;
      
      // Detect connection speed
      const connection = (navigator as any).connection;
      let connectionSpeed: 'slow' | 'medium' | 'fast' = 'fast';
      if (connection) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          connectionSpeed = 'slow';
        } else if (connection.effectiveType === '3g') {
          connectionSpeed = 'medium';
        }
      }

      const newConfig = {
        prefersReducedMotion,
        isMobile,
        isLowEndDevice,
        connectionSpeed,
        viewportWidth
      };

      // Determine optimizations based on device capabilities
      const newOptimizations: MobileOptimizationSettings = {
        reduceAnimations: prefersReducedMotion || isLowEndDevice || isMobile,
        limitRenderedItems: isMobile || isLowEndDevice || viewportWidth <= 428,
        deferNonCritical: connectionSpeed === 'slow' || isLowEndDevice,
        useOptimizedImages: isMobile || connectionSpeed !== 'fast',
        enableVirtualization: isMobile && isLowEndDevice
      };

      setConfig(newConfig);
      setOptimizations(newOptimizations);
    };

    detectPerformanceCapabilities();

    // Re-detect on resize
    const handleResize = () => {
      detectPerformanceCapabilities();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get appropriate animation class based on performance settings
  const getAnimationClass = (animationType: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade') => {
    if (optimizations.reduceAnimations) {
      return ''; // No animations for low-performance devices
    }
    
    switch (animationType) {
      case 'fade':
        return 'transition-opacity duration-300 ease-out';
      case 'slide':
        return 'transition-transform duration-300 ease-out';
      case 'scale':
        return 'transition-all duration-200 ease-out hover:scale-105';
      case 'bounce':
        return 'transition-transform duration-150 ease-out active:scale-95';
      default:
        return '';
    }
  };

  // Get grid columns based on viewport
  const getGridColumns = (maxColumns: number = 4) => {
    if (config.viewportWidth <= 320) return 1;
    if (config.viewportWidth <= 428) return 1;
    if (config.viewportWidth <= 768) return 2;
    if (config.viewportWidth <= 1024) return 3;
    return Math.min(maxColumns, 4);
  };

  // Get items to render based on performance
  const getLimitedItems = <T>(items: T[], defaultLimit: number = 20): T[] => {
    if (!optimizations.limitRenderedItems) return items;
    
    const limits = {
      mobile: config.viewportWidth <= 428 ? 10 : 15,
      tablet: 20,
      desktop: defaultLimit
    };
    
    const limit = config.isMobile ? limits.mobile : limits.desktop;
    return items.slice(0, limit);
  };

  // Check if viewport matches common mobile sizes
  const isCommonMobileViewport = () => {
    const commonSizes = [320, 375, 390, 414, 428];
    return commonSizes.some(size => Math.abs(config.viewportWidth - size) <= 10);
  };

  return {
    config,
    optimizations,
    getAnimationClass,
    getGridColumns,
    getLimitedItems,
    isCommonMobileViewport,
    shouldReduceAnimations: optimizations.reduceAnimations,
    shouldLimitItems: optimizations.limitRenderedItems,
    shouldDeferNonCritical: optimizations.deferNonCritical,
    shouldUseOptimizedImages: optimizations.useOptimizedImages,
    isMobileViewport: config.viewportWidth <= 768,
    isSmallMobile: config.viewportWidth <= 428
  };
};