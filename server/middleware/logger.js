/**
 * server/middleware/logger.js
 * Centralized structured logging using pino
 *
 * Install: npm install pino pino-http
 */
import pino from 'pino';

// ── Base logger ───────────────────────────────────────────────────────────────
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    },
  }),
  base: {
    app: 'studenthub-api',
    env: process.env.NODE_ENV,
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  redact: {
    // Never log these fields
    paths: ['req.headers.authorization', 'body.password', 'body.token', '*.secret'],
    censor: '[REDACTED]',
  },
});

// ── HTTP request logger middleware ────────────────────────────────────────────
import pinoHttp from 'pino-http';

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) =>
      // Skip noisy health/metrics pings from load balancers
      req.url === '/api/health' || req.url === '/api/ready' || req.url === '/api/metrics',
  },
  customLogLevel: (req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} → ${res.statusCode}: ${err?.message}`,
});

// ── Error logger helper ───────────────────────────────────────────────────────
export function logError(err, context = {}) {
  logger.error({ err, ...context }, err.message);
}

// ── Global error middleware ───────────────────────────────────────────────────
export function errorHandler(err, req, res, next) {
  logError(err, { url: req.url, method: req.method, userId: req.user?.id });

  // Don't leak internals in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(err.status || 500).json({ error: message });
}

export default logger;

