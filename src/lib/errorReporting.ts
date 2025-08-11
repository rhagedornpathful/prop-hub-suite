import { config, safeLog } from './config';

export interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string;
}

class ErrorReporter {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  report(error: Error | string, context: ErrorContext = {}, severity: ErrorReport['severity'] = 'medium') {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;
    
    const report: ErrorReport = {
      message: errorMessage,
      stack,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        route: window.location.pathname,
        userAgent: navigator.userAgent,
      },
      severity,
      fingerprint: this.generateFingerprint(errorMessage, stack),
    };

    this.errors.unshift(report);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    safeLog.error('Error reported:', report);

    // In production, you would send this to an error tracking service
    if (config.isProduction && config.features.errorReporting) {
      this.sendToErrorService(report);
    }
  }

  private generateFingerprint(message: string, stack?: string): string {
    const content = stack || message;
    // Simple hash function for fingerprinting similar errors
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async sendToErrorService(report: ErrorReport) {
    try {
      // Placeholder for error service integration (Sentry, LogRocket, etc.)
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
      console.warn('Error service not configured:', report);
    } catch (err) {
      safeLog.error('Failed to send error report:', err);
    }
  }

  getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorStats() {
    const severityCounts = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      severityCounts,
      recentErrors: this.getRecentErrors(5),
    };
  }
}

export const errorReporter = new ErrorReporter();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReporter.report(event.error || event.message, {
      action: 'global_error_handler',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    }, 'high');
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.report(event.reason, {
      action: 'unhandled_promise_rejection',
    }, 'high');
  });
}