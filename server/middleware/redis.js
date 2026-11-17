/**
 * server/middleware/redis.js
 * Redis client + rate limiter + session caching
 *
 * If Redis is not configured or unavailable, fall back to the built-in memory store
 * so the app still starts in local development and Dockerless environments.
 */
import Redis from 'ioredis';
import { rateLimit, MemoryStore } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

// ── Singleton Redis client ────────────────────────────────────────────────────
let redis;

export function getRedisClient() {
  if (redis) return redis;

  if (!process.env.REDIS_URL) {
    return null;
  }

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    },
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('❌ Redis error:', err.message));
  redis.on('reconnecting', () => console.warn('⚠️  Redis reconnecting…'));

  return redis;
}

// ── API Rate Limiter ──────────────────────────────────────────────────────────
export function createRateLimiter(options = {}) {
  const client = getRedisClient();
  const store = client
    ? new RedisStore({
        sendCommand: (...args) => client.call(...args),
      })
    : new MemoryStore();

  return rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    ...options,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes',
      });
    },
  });
}

// ── Tight limiter for auth endpoints ─────────────────────────────────────────
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                   // 10 login attempts
  skipSuccessfulRequests: true,
});

// ── Cache helper ──────────────────────────────────────────────────────────────
export const cache = {
  async get(key) {
    const client = getRedisClient();
    if (!client) return null;
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  },

  async set(key, value, ttlSeconds = 300) {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  async del(key) {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  },

  async invalidatePattern(pattern) {
    const client = getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  },
};

export default getRedisClient;

