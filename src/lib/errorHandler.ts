/**
 * Standardized Error Handling System
 * Production-ready error handling with retry logic, user-friendly messages, and comprehensive logging
 */

import { toast } from '@/hooks/use-toast';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  operation: string;
  userId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  severity?: ErrorSeverity;
  context?: ErrorContext;
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean; // For Sentry/LogRocket when enabled
  retryable?: boolean;
  onRetry?: () => Promise<void>;
  maxRetries?: number;
}

export class AppError extends Error {
  public code: string;
  public severity: ErrorSeverity;
  public context?: ErrorContext;
  public timestamp: Date;
  public retryable: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = 'medium',
    context?: ErrorContext,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();
    this.retryable = retryable;
  }
}

/**
 * Error code mappings for user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  AUTH_REQUIRED: 'You must be logged in to perform this action',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please log in again',
  AUTH_PERMISSION_DENIED: 'You do not have permission to perform this action',
  
  // Network errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection',
  NETWORK_TIMEOUT: 'Request timed out. Please try again',
  NETWORK_OFFLINE: 'You are currently offline. Changes will sync when you reconnect',
  
  // Database errors
  DB_CONSTRAINT_VIOLATION: 'This action violates data constraints',
  DB_FOREIGN_KEY_VIOLATION: 'Cannot delete this item because it is referenced by other data',
  DB_UNIQUE_VIOLATION: 'This record already exists',
  DB_NOT_FOUND: 'The requested item was not found',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'Please fill in all required fields',
  VALIDATION_INVALID_FORMAT: 'Invalid format for one or more fields',
  VALIDATION_OUT_OF_RANGE: 'Value is outside the acceptable range',
  
  // Business logic errors
  BUSINESS_PROPERTY_HAS_TENANTS: 'Cannot delete property with active tenants',
  BUSINESS_PAYMENT_ALREADY_PROCESSED: 'This payment has already been processed',
  BUSINESS_INVALID_DATE_RANGE: 'End date must be after start date',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  FILE_INVALID_TYPE: 'File type is not supported',
  FILE_UPLOAD_FAILED: 'Failed to upload file. Please try again',
  
  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
};

/**
 * Parse Supabase/Postgres errors into user-friendly messages
 */
function parseSupabaseError(error: any): { code: string; message: string } {
  // Postgres error codes
  if (error.code === '23503') {
    return { code: 'DB_FOREIGN_KEY_VIOLATION', message: ERROR_MESSAGES.DB_FOREIGN_KEY_VIOLATION };
  }
  if (error.code === '23505') {
    return { code: 'DB_UNIQUE_VIOLATION', message: ERROR_MESSAGES.DB_UNIQUE_VIOLATION };
  }
  if (error.code === '23514') {
    return { code: 'DB_CONSTRAINT_VIOLATION', message: ERROR_MESSAGES.DB_CONSTRAINT_VIOLATION };
  }
  
  // Supabase error messages
  if (error.message?.includes('JWT')) {
    return { code: 'AUTH_SESSION_EXPIRED', message: ERROR_MESSAGES.AUTH_SESSION_EXPIRED };
  }
  if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
    return { code: 'AUTH_PERMISSION_DENIED', message: ERROR_MESSAGES.AUTH_PERMISSION_DENIED };
  }
  if (error.message?.includes('not found')) {
    return { code: 'DB_NOT_FOUND', message: ERROR_MESSAGES.DB_NOT_FOUND };
  }
  
  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return { code: 'NETWORK_ERROR', message: ERROR_MESSAGES.NETWORK_ERROR };
  }
  
  return { code: 'UNKNOWN_ERROR', message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth or validation errors
      if (
        error instanceof AppError &&
        (error.code.startsWith('AUTH_') || error.code.startsWith('VALIDATION_'))
      ) {
        throw error;
      }
      
      // Last attempt, throw error
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Main error handler
 */
export async function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): Promise<AppError> {
  const {
    severity = 'medium',
    context,
    showToast = true,
    logToConsole = true,
    logToService = false,
    retryable = false,
    onRetry,
    maxRetries = 3,
  } = options;

  let appError: AppError;

  // Convert to AppError if not already
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    const parsed = parseSupabaseError(error);
    appError = new AppError(
      parsed.message,
      parsed.code,
      severity,
      context,
      retryable
    );
  } else {
    appError = new AppError(
      ERROR_MESSAGES.UNKNOWN_ERROR,
      'UNKNOWN_ERROR',
      severity,
      context,
      retryable
    );
  }

  // Console logging
  if (logToConsole) {
    const logMethod = severity === 'critical' || severity === 'high' ? console.error : console.warn;
    logMethod('[ErrorHandler]', {
      code: appError.code,
      message: appError.message,
      severity: appError.severity,
      context: appError.context,
      timestamp: appError.timestamp,
      originalError: error,
    });
  }

  // TODO: Send to monitoring service (Sentry/LogRocket) when enabled
  if (logToService) {
    // Placeholder for Sentry.captureException(appError)
  }

  // Show toast notification
  if (showToast) {
    const toastVariant = severity === 'critical' || severity === 'high' ? 'destructive' : 'default';
    
    toast({
      title: severity === 'critical' || severity === 'high' ? 'Error' : 'Warning',
      description: appError.message,
      variant: toastVariant,
      duration: severity === 'critical' ? 10000 : 5000, // Critical errors stay longer
    });
  }

  // Retry logic
  if (retryable && onRetry && maxRetries > 0) {
    try {
      await retryWithBackoff(onRetry, maxRetries);
      toast({
        title: 'Success',
        description: 'Operation completed successfully after retry',
      });
    } catch (retryError) {
      // If retry fails, show a different message
      toast({
        title: 'Operation Failed',
        description: 'Unable to complete operation after multiple attempts',
        variant: 'destructive',
      });
    }
  }

  return appError;
}

/**
 * Wrapper for async operations with automatic error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    await handleError(error, options);
    return null;
  }
}

/**
 * React Query error handler
 */
export function queryErrorHandler(error: unknown, context?: ErrorContext) {
  handleError(error, {
    severity: 'medium',
    context,
    showToast: true,
    logToConsole: true,
  });
}

/**
 * Mutation error handler with retry support
 */
export function mutationErrorHandler(
  error: unknown,
  context?: ErrorContext,
  onRetry?: () => Promise<void>
) {
  handleError(error, {
    severity: 'high',
    context,
    showToast: true,
    logToConsole: true,
    retryable: !!onRetry,
    onRetry,
    maxRetries: 3,
  });
}

/**
 * Network-specific error handler
 */
export function networkErrorHandler(error: unknown, context?: ErrorContext) {
  handleError(error, {
    severity: 'medium',
    context,
    showToast: true,
    logToConsole: true,
    retryable: true,
    maxRetries: 3,
  });
}

/**
 * Critical operation error handler (e.g., payments, data deletion)
 */
export function criticalErrorHandler(error: unknown, context?: ErrorContext) {
  handleError(error, {
    severity: 'critical',
    context,
    showToast: true,
    logToConsole: true,
    logToService: true,
    retryable: false,
  });
}

/**
 * Success handler for consistent success messages
 */
export function handleSuccess(
  message: string,
  options: {
    description?: string;
    duration?: number;
  } = {}
) {
  toast({
    title: 'Success',
    description: options.description || message,
    duration: options.duration || 3000,
  });
}

/**
 * Validation error helper
 */
export function handleValidationError(
  fieldErrors: Record<string, string>,
  context?: ErrorContext
) {
  const firstError = Object.values(fieldErrors)[0];
  handleError(
    new AppError(
      firstError,
      'VALIDATION_ERROR',
      'low',
      context,
      false
    ),
    {
      showToast: true,
      logToConsole: false, // Don't log validation errors
    }
  );
}
