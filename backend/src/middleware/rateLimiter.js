const { redisClient } = require('../utilities/redis');

// Constants
const RATE_LIMIT = 33; // requests per window
const WINDOW_SECONDS = 3600; // 1 hour window
const LOCALHOST_IP = '::1';
const RATE_LIMIT_PREFIX = 'rate_limit:';

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIP = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip;
};

/**
 * Rate limiting middleware
 * @returns {Function} Express middleware function
 */
const rateLimitMiddleware = () => async (req, res, next) => {
  try {
    const ip = getClientIP(req);
    
    // Skip rate limiting for localhost
    if (ip === LOCALHOST_IP) {
      return next();
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;
    const requests = await redisClient.incr(key);

    // Set expiration on first request
    if (requests === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    // Check if rate limit exceeded
    if (requests > RATE_LIMIT) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit of ${RATE_LIMIT} requests per hour exceeded`,
        retryAfter: WINDOW_SECONDS
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - requests));
    res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + WINDOW_SECONDS);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On Redis error, allow the request to proceed
    next();
  }
};

module.exports = rateLimitMiddleware;