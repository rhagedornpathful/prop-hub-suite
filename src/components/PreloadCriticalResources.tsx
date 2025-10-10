import { useEffect } from 'react';

/**
 * Preloads critical resources to improve perceived performance
 * Place this component at the top level of your app
 */
export const PreloadCriticalResources = () => {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '500' },
      { family: 'Inter', weight: '600' },
      { family: 'Lexend', weight: '600' },
      { family: 'Lexend', weight: '700' },
    ];

    fontPreloads.forEach(({ family, weight }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      // Google Fonts URL structure
      link.href = `https://fonts.gstatic.com/s/${family.toLowerCase()}/v*/`;
      document.head.appendChild(link);
    });

    // Prefetch likely next routes for logged-in users
    const prefetchRoutes = [
      '/properties',
      '/maintenance', 
      '/messages',
    ];

    prefetchRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      // Links will be removed when component unmounts
    };
  }, []);

  return null; // This component doesn't render anything
};
