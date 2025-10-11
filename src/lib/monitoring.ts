/**
 * Monitoring and Observability Setup
 * Centralized error tracking, performance monitoring, and user analytics
 */

// Error tracking interface (Sentry-compatible)
interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'error' | 'warning' | 'info' | 'debug';
}

class MonitoringService {
  private isInitialized = false;
  private userId: string | null = null;
  private userRole: string | null = null;

  /**
   * Initialize monitoring services
   */
  init() {
    if (this.isInitialized) return;

    // Initialize Sentry if DSN is provided
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn && typeof window !== 'undefined') {
      console.log('[Monitoring] Sentry DSN detected - would initialize Sentry here');
      // In production, you would do:
      // Sentry.init({ dsn: sentryDsn, environment: import.meta.env.MODE })
    }

    // Initialize LogRocket if app ID is provided
    const logRocketId = import.meta.env.VITE_LOGROCKET_ID;
    if (logRocketId && typeof window !== 'undefined') {
      console.log('[Monitoring] LogRocket ID detected - would initialize LogRocket here');
      // In production, you would do:
      // LogRocket.init(logRocketId)
    }

    // Setup performance observer
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
    console.log('[Monitoring] Monitoring services initialized');
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, role?: string) {
    this.userId = userId;
    this.userRole = role || null;

    console.log('[Monitoring] User context set:', { userId, role });
    
    // In production with Sentry:
    // Sentry.setUser({ id: userId, email, role })
    
    // In production with LogRocket:
    // LogRocket.identify(userId, { email, role })
  }

  /**
   * Clear user context (on logout)
   */
  clearUser() {
    this.userId = null;
    this.userRole = null;

    console.log('[Monitoring] User context cleared');
    
    // In production:
    // Sentry.setUser(null)
  }

  /**
   * Capture error with context
   */
  captureError(error: Error, context?: ErrorContext) {
    console.error('[Monitoring] Error captured:', error, context);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🔴 Error Details');
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('User:', { id: this.userId, role: this.userRole });
      console.groupEnd();
    }

    // In production with Sentry:
    // Sentry.captureException(error, { ...context })
  }

  /**
   * Capture message/warning
   */
  captureMessage(message: string, level: ErrorContext['level'] = 'info', context?: ErrorContext) {
    console.log(`[Monitoring] Message captured [${level}]:`, message, context);

    // In production with Sentry:
    // Sentry.captureMessage(message, { level, ...context })
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    console.log('[Monitoring] Event tracked:', eventName, properties);

    // In production with analytics service:
    // analytics.track(eventName, properties)
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    console.log('[Monitoring] Page view:', pageName, properties);

    // In production:
    // analytics.page(pageName, properties)
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[Performance] Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask', 'measure'] });
      } catch (e) {
        console.warn('[Monitoring] Performance observer not supported');
      }
    }

    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // Would integrate with web-vitals library:
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      console.log('[Monitoring] Web Vitals monitoring enabled');
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(metricName: string, value: number, unit = 'ms') {
    console.log(`[Monitoring] Metric recorded: ${metricName} = ${value}${unit}`);

    // In production:
    // Send to analytics service or APM
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  monitoring.init();
}

// Export convenience functions
export const captureError = (error: Error, context?: ErrorContext) => 
  monitoring.captureError(error, context);

export const captureMessage = (message: string, level?: ErrorContext['level'], context?: ErrorContext) => 
  monitoring.captureMessage(message, level, context);

export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  monitoring.trackEvent(eventName, properties);

export const trackPageView = (pageName: string, properties?: Record<string, any>) => 
  monitoring.trackPageView(pageName, properties);

export const setUser = (userId: string, email?: string, role?: string) => 
  monitoring.setUser(userId, email, role);

export const clearUser = () => 
  monitoring.clearUser();
