import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string, fn: () => void): void {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.metrics.set(`render:${componentName}`, duration);
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && duration > 16) {
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  // Monitor largest contentful paint
  observeLCP(): void {
    if (!this.observers.has('lcp')) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('lcp', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    }
  }

  // Monitor first input delay
  observeFID(): void {
    if (!this.observers.has('fid')) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.set('fid', (entry as any).processingStart - entry.startTime);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    }
  }

  // Monitor cumulative layout shift
  observeCLS(): void {
    if (!this.observers.has('cls')) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('cls', clsValue);
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Start monitoring all core web vitals
  startMonitoring(): void {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  // Stop all monitoring
  stopMonitoring(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    monitor.startMonitoring();
    return () => monitor.stopMonitoring();
  }, []);

  return {
    measureRender: monitor.measureRender.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
};

// HOC for measuring component performance
export const withPerformanceMonitoring = (
  Component: React.ComponentType<any>,
  componentName?: string
) => {
  const name = componentName || Component.displayName || Component.name || 'Unknown';
  
  return React.memo((props: any) => {
    const monitor = PerformanceMonitor.getInstance();
    
    return React.useMemo(() => {
      let result: JSX.Element;
      monitor.measureRender(name, () => {
        result = React.createElement(Component, props);
      });
      return result!;
    }, [props, monitor]);
  });
};