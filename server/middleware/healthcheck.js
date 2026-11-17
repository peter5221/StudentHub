/**
 * server/middleware/healthcheck.js
 * Liveness + Readiness probes for /api/health and /api/ready
 */
import { getRedisClient } from './redis.js';

// ── /api/health — Liveness probe ─────────────────────────────────────────────
// Should return 200 as long as the process is alive.
// Kubernetes/Docker will restart the container if this fails.
export function livenessHandler(req, res) {
  res.json({
    status: 'alive',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

// ── /api/ready — Readiness probe ─────────────────────────────────────────────
// Should return 200 only when ALL dependencies are reachable.
// Load balancer will stop routing traffic here if this fails.
export async function readinessHandler(req, res) {
  const checks = {};
  let healthy = true;

  // 1. Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = 'ok';
  } catch (err) {
    checks.redis = `error: ${err.message}`;
    healthy = false;
  }

  // 2. Database (lowdb — always local, just verify file is readable)
  try {
    const { default: db } = await import('../database.js');
    const userCount = db.data?.users?.length ?? 0;
    checks.database = `ok (${userCount} users)`;
  } catch (err) {
    checks.database = `error: ${err.message}`;
    healthy = false;
  }

  // 3. Memory — warn if heap > 400 MB
  const heapMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  checks.memory = `${heapMB}MB`;
  if (heapMB > 400) {
    checks.memoryWarning = 'heap > 400MB';
    // Don't fail readiness for memory alone — just warn
  }

  const status = healthy ? 200 : 503;
  res.status(status).json({
    status: healthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  });
}

// ── /api/metrics — Basic Prometheus-compatible text metrics ──────────────────
export function metricsHandler(req, res) {
  const mem = process.memoryUsage();
  const uptime = process.uptime();

  const lines = [
    '# HELP nodejs_process_uptime_seconds Process uptime in seconds',
    '# TYPE nodejs_process_uptime_seconds gauge',
    `nodejs_process_uptime_seconds ${uptime.toFixed(2)}`,
    '',
    '# HELP nodejs_heap_used_bytes Heap used in bytes',
    '# TYPE nodejs_heap_used_bytes gauge',
    `nodejs_heap_used_bytes ${mem.heapUsed}`,
    '',
    '# HELP nodejs_heap_total_bytes Total heap allocated in bytes',
    '# TYPE nodejs_heap_total_bytes gauge',
    `nodejs_heap_total_bytes ${mem.heapTotal}`,
    '',
    '# HELP nodejs_rss_bytes Resident set size in bytes',
    '# TYPE nodejs_rss_bytes gauge',
    `nodejs_rss_bytes ${mem.rss}`,
  ];

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(lines.join('\n'));
}

