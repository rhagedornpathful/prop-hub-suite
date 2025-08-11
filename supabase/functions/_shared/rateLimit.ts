// Rate limiting middleware for edge functions
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function createRateLimit(maxRequests: number, windowMs: number) {
  return function rateLimit(req: Request): Response | null {
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, data] of rateLimits.entries()) {
      if (data.resetTime < now) {
        rateLimits.delete(key);
      }
    }
    
    const current = rateLimits.get(clientId);
    
    if (!current || current.resetTime < now) {
      rateLimits.set(clientId, { count: 1, resetTime: now + windowMs });
      return null; // Allow request
    }
    
    if (current.count >= maxRequests) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil((current.resetTime - now) / 1000) 
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count).toString(),
            'X-RateLimit-Reset': current.resetTime.toString(),
          }
        }
      );
    }
    
    current.count++;
    return null; // Allow request
  };
}