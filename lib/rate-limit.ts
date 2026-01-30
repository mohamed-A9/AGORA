/**
 * Rate Limiting Utility
 * Protects against brute force attacks and API abuse
 */

// In-memory store for rate limiting (use Redis in production for scaling)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
}

// Different limits for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    // Auth endpoints - strict limits
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,           // 5 attempts per 15 minutes
    },
    // Login specifically
    login: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 10,
    },
    // Signup
    signup: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5,           // 5 signups per hour per IP
    },
    // API endpoints - moderate limits
    api: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 100,         // 100 requests per minute
    },
    // File uploads - strict
    upload: {
        windowMs: 60 * 1000,
        maxRequests: 20,          // 20 uploads per minute
    },
    // Venue creation
    venueCreate: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,          // 10 venues per hour
    },
    // Default
    default: {
        windowMs: 60 * 1000,
        maxRequests: 60,
    },
};

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
    identifier: string,  // IP address or user ID
    endpoint: string = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const key = `${endpoint}:${identifier}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
        cleanupExpiredEntries();
    }

    if (!record || now > record.resetTime) {
        // New window
        record = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, record);
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    // Existing window
    record.count++;
    rateLimitStore.set(key, record);

    const remaining = Math.max(0, config.maxRequests - record.count);
    const resetIn = record.resetTime - now;

    if (record.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn,
        };
    }

    return {
        allowed: true,
        remaining,
        resetIn,
    };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback
    return 'unknown';
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetIn: number) {
    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: 'Please wait before trying again',
            retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil(resetIn / 1000).toString(),
            },
        }
    );
}
