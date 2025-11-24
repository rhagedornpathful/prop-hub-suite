/**
 * Error Tracking Hook
 * Automatically tracks errors in React components
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { monitoring } from '@/lib/monitoring';

/**
 * Track errors in a component
 */
export function useErrorTracking(componentName: string) {
  const location = useLocation();

  useEffect(() => {
    console.log(`[Tracking] Mounted ${componentName} at ${location.pathname}`);

    return () => {
      console.log(`[Tracking] Unmounted ${componentName}`);
    };
  }, [componentName, location.pathname]);

  const trackError = (error: Error, metadata?: Record<string, any>) => {
    monitoring.captureError(error, {
      tags: {
        component: componentName,
        route: location.pathname,
      },
      extra: metadata,
    });
  };

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    monitoring.trackEvent(`${componentName}_${eventName}`, {
      route: location.pathname,
      ...properties,
    });
  };

  return { trackError, trackEvent };
}

/**
 * Track page views
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    monitoring.trackPageView(location.pathname, {
      search: location.search,
    });
  }, [location]);
}
