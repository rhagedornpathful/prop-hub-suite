/**
 * Advanced Retry Utilities
 * Provides various retry strategies for different use cases
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  shouldRetry: (error: any) => {
    // Don't retry on client errors (400-499)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    // Retry on network errors and server errors (500+)
    return true;
  },
  onRetry: () => {}, // No-op by default
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  let delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
  
  if (jitter) {
    // Add random jitter (±25%)
    const jitterRange = delay * 0.25;
    delay = delay + (Math.random() * jitterRange * 2 - jitterRange);
  }
  
  return Math.floor(delay);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (!config.shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Last attempt, throw error
      if (attempt === config.maxAttempts - 1) {
        throw error;
      }
      
      // Call retry callback
      config.onRetry(error, attempt + 1);
      
      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.backoffMultiplier,
        config.jitter
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Retry specifically for Supabase operations
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'database operation'
): Promise<T> {
  return retryWithBackoff(operation, {
    maxAttempts: 3,
    baseDelay: 1000,
    shouldRetry: (error: any) => {
      // Retry on network errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        return true;
      }
      // Retry on timeout errors
      if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        return true;
      }
      // Retry on rate limiting (429)
      if (error.status === 429) {
        return true;
      }
      // Don't retry on auth or validation errors
      if (error.code?.startsWith('23') || // Postgres constraint violations
          error.message?.includes('permission denied') ||
          error.message?.includes('RLS')) {
        return false;
      }
      // Retry on server errors (500+)
      if (error.status >= 500) {
        return true;
      }
      return false;
    },
    onRetry: (error: any, attempt: number) => {
      console.log(`[Retry] Attempting ${operationName} (attempt ${attempt}):`, error.message);
    },
  });
}

/**
 * Retry for file uploads
 */
export async function retryFileUpload<T>(
  uploadFn: () => Promise<T>,
  fileName: string
): Promise<T> {
  return retryWithBackoff(uploadFn, {
    maxAttempts: 5, // More attempts for file uploads
    baseDelay: 2000, // Longer base delay
    maxDelay: 60000, // Up to 1 minute
    shouldRetry: (error: any) => {
      // Always retry network errors
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return true;
      }
      // Don't retry on file size or type errors
      if (error.message?.includes('size') || error.message?.includes('type')) {
        return false;
      }
      return true;
    },
    onRetry: (error: any, attempt: number) => {
      console.log(`[File Upload Retry] ${fileName} (attempt ${attempt}):`, error.message);
    },
  });
}

/**
 * Retry for API calls with rate limiting
 */
export async function retryWithRateLimit<T>(
  apiFn: () => Promise<T>,
  endpoint: string
): Promise<T> {
  return retryWithBackoff(apiFn, {
    maxAttempts: 5,
    baseDelay: 5000, // Start with 5 seconds for rate limits
    backoffMultiplier: 3, // Aggressive backoff for rate limits
    shouldRetry: (error: any, attempt: number) => {
      // Always retry rate limit errors
      if (error.status === 429) {
        return true;
      }
      // Stop after 3 attempts for other errors
      if (attempt >= 3 && error.status !== 429) {
        return false;
      }
      return error.status >= 500;
    },
    onRetry: (error: any, attempt: number) => {
      if (error.status === 429) {
        console.warn(`[Rate Limited] ${endpoint} - waiting before retry (attempt ${attempt})`);
      }
    },
  });
}

/**
 * Retry with circuit breaker pattern
 * Prevents overwhelming a failing service
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.lastFailureTime || 0);
      
      if (timeSinceLastFailure < this.resetTimeout) {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
      
      // Try to recover
      this.state = 'half-open';
    }
    
    try {
      const result = await fn();
      
      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      // Open circuit if threshold reached
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
        console.error(`[Circuit Breaker] OPENED after ${this.failureCount} failures`);
      }
      
      throw error;
    }
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
  
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Batch retry for multiple operations
 * Retries failed operations while preserving successful ones
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; result?: T; error?: any }>> {
  const results = await Promise.allSettled(
    operations.map(op => retryWithBackoff(op, options))
  );
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
