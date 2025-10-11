/**
 * Standardized Error Handling System
 * Provides consistent error handling, logging, and user feedback across all queries
 */

import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Error message mappings for common database errors
 */
const ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This record already exists',
  '23503': 'Cannot delete: this record is referenced by other data',
  '23502': 'Required field is missing',
  '42501': 'Permission denied',
  'PGRST116': 'No records found',
  'PGRST301': 'Invalid request',
};

/**
 * Convert Supabase error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  // PostgrestError from Supabase
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as PostgrestError;
    return ERROR_MESSAGES[pgError.code] || pgError.message || 'Database error occurred';
  }
  
  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // String error
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Log error with context
 */
export function logError(error: unknown, context: string): void {
  console.error(`[${context}]`, {
    error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
}

/**
 * Handle query error with logging and user notification
 */
export function handleQueryError(error: unknown, context: string, showToast = true): AppError {
  const message = getErrorMessage(error);
  
  logError(error, context);
  
  const appError: AppError = {
    message,
    code: typeof error === 'object' && error !== null && 'code' in error 
      ? (error as any).code 
      : undefined,
    details: typeof error === 'object' && error !== null && 'details' in error 
      ? (error as any).details 
      : undefined,
    hint: typeof error === 'object' && error !== null && 'hint' in error 
      ? (error as any).hint 
      : undefined,
  };
  
  if (showToast) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: message,
    });
  }
  
  return appError;
}

/**
 * Standardized query error handler for React Query
 */
export const createQueryErrorHandler = (context: string, showToast = true) => {
  return (error: unknown) => {
    handleQueryError(error, context, showToast);
  };
};

/**
 * Retry logic for queries
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  // Don't retry on authentication errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as any).code;
    if (code === '42501' || code === 'PGRST301') {
      return false;
    }
  }
  
  // Retry up to 3 times
  return failureCount < 3;
}

/**
 * Success handler for mutations
 */
export function handleMutationSuccess(message: string, context: string): void {
  console.log(`[${context}] Success:`, message);
  
  toast({
    title: 'Success',
    description: message,
  });
}
