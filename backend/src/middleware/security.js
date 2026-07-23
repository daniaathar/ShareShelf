import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityHeaders = helmet();

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    code: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts. Please try again later.',
  },
});