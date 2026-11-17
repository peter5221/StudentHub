/**
 * server/middleware/sentry.js
 * Error monitoring via Sentry SDK
 */
import * as Sentry from '@sentry/node';

let nodeProfilingIntegration = null;

try {
  const profilingModule = await import('@sentry/profiling-node');
  nodeProfilingIntegration = profilingModule.nodeProfilingIntegration;
} catch (error) {
  console.warn('⚠️  Sentry profiling disabled; native profiler package is unavailable in this runtime.');
}

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not set — error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production',
    integrations: nodeProfilingIntegration ? [nodeProfilingIntegration()] : [],
    // Performance: capture 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling: 10% of sampled transactions
    profilesSampleRate: 0.1,
    // Filter out noise
    ignoreErrors: [
      'TokenExpiredError',
      'JsonWebTokenError',
      'UnauthorizedError',
    ],
    beforeSend(event, hint) {
      const err = hint.originalException;

      // Drop 404s
      if (err?.status === 404) return null;

      // Scrub PII from request bodies
      if (event.request?.data) {
        const body = event.request.data;
        if (body.password) body.password = '[REDACTED]';
        if (body.token) body.token = '[REDACTED]';
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized');
}

// ── Sentry request handler (must be FIRST middleware) ─────────────────────────
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

// ── Sentry error handler (must be BEFORE your own error handler) ──────────────
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(err) {
    return err.status >= 500 || !err.status;
  },
});

// ── Manual capture helpers ────────────────────────────────────────────────────
export const captureException = (err, context = {}) => {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(err);
  });
};

export const captureMessage = (msg, level = 'info') => {
  Sentry.captureMessage(msg, level);
};

