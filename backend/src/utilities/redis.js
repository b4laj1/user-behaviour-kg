const { Redis } = require('@upstash/redis');

// Constants
const DEFAULT_CACHE_WINDOW = 3600; // 1 hour in seconds
const REDIS_ERROR_MESSAGE = 'Redis operation failed';

// Initialize Redis client with error handling
const redisClient = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_KEY,
});

// Validate Redis connection
redisClient.ping().catch(error => {
  console.error('Redis connection failed:', error);
});

/**
 * Fetch data from Redis cache
 * @param {string} key - Redis key
 * @returns {Promise<any|null>} - Cached data or null if not found
 */
const redisFetch = async (key) => {
  if (!key || typeof key !== 'string') {
    console.warn('Invalid key provided to redisFetch');
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data || null;
  } catch (error) {
    console.error(`${REDIS_ERROR_MESSAGE} - Fetch:`, error);
    return null;
  }
};

/**
 * Add data to Redis cache
 * @param {string} key - Redis key
 * @param {any} value - Value to cache
 * @param {number} window - Cache duration in seconds
 * @returns {Promise<string|null>} - Success message or null if failed
 */
const redisAdd = async (key, value, window = DEFAULT_CACHE_WINDOW) => {
  if (!key || typeof key !== 'string') {
    console.warn('Invalid key provided to redisAdd');
    return null;
  }

  try {
    await redisClient.setex(key, window, value);
    return 'Value has been set in redis';
  } catch (error) {
    console.error(`${REDIS_ERROR_MESSAGE} - Add:`, error);
    return null;
  }
};

module.exports = { redisClient, redisFetch, redisAdd };
