import rateLimit from 'express-rate-limit';

/**
 * Brute-force protection for credential endpoints.
 * Uses the in-memory store, which is fine for one container.
 * With multiple API replicas, switch to a shared store such as Redis.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Try again later.' },
    },
});