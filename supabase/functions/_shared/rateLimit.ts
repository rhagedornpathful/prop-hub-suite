// Enhanced Rate limiting middleware for edge functions with sliding window algorithm

interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[]; // timestamps of requests for sliding window
}

const rateLimits = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimits.entries()) {
    if (data.resetTime < now) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * Create a rate limiter with sliding window algorithm
 * @param config Rate limit configuration
 * @returns Rate limit middleware function
 */
export function createRateLimit(config: RateLimitConfig | number, windowMs?: number) {
  // Support legacy function signature
  const finalConfig: RateLimitConfig = typeof config === 'number' 
    ? { maxRequests: config, windowMs: windowMs || 60000 }
    : config;

  return function rateLimit(req: Request): Response | null {
    const clientId = finalConfig.keyGenerator 
      ? finalConfig.keyGenerator(req)
      : req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;
    
    let current = rateLimits.get(clientId);
    
    if (!current) {
      current = { 
        count: 1, 
        resetTime: now + finalConfig.windowMs,
        requests: [now]
      };
      rateLimits.set(clientId, current);
      return null; // Allow request
    }
    
    // Remove requests outside the sliding window
    current.requests = current.requests.filter(timestamp => timestamp > windowStart);
    current.count = current.requests.length;
    
    // Check if rate limit exceeded
    if (current.count >= finalConfig.maxRequests) {
      const oldestRequest = current.requests[0] || now;
      const retryAfter = Math.ceil((oldestRequest + finalConfig.windowMs - now) / 1000);
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter,
          limit: finalConfig.maxRequests,
          window: `${finalConfig.windowMs / 1000}s`
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(oldestRequest + finalConfig.windowMs).toISOString(),
          }
        }
      );
    }
    
    // Add current request
    current.requests.push(now);
    current.count++;
    current.resetTime = now + finalConfig.windowMs;
    
    return null; // Allow request
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  /** Strict: 10 requests per minute */
  STRICT: createRateLimit({ maxRequests: 10, windowMs: 60000 }),
  
  /** Standard: 60 requests per minute */
  STANDARD: createRateLimit({ maxRequests: 60, windowMs: 60000 }),
  
  /** Generous: 100 requests per minute */
  GENEROUS: createRateLimit({ maxRequests: 100, windowMs: 60000 }),
  
  /** Public API: 1000 requests per hour */
  PUBLIC_API: createRateLimit({ maxRequests: 1000, windowMs: 3600000 }),
  
  /** Heavy operations: 5 requests per minute */
  HEAVY: createRateLimit({ maxRequests: 5, windowMs: 60000 }),
};
