import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { Messages, Users, genId } from './database.js';

// ── Infrastructure middleware ─────────────────────────────────────────────────
import { initSentry, sentryRequestHandler, sentryErrorHandler } from './middleware/sentry.js';
import { httpLogger, errorHandler } from './middleware/logger.js';
import { createRateLimiter, authLimiter } from './middleware/redis.js';
import { livenessHandler, readinessHandler, metricsHandler } from './middleware/healthcheck.js';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import geocodeRoutes from './routes/geocode.js';
import listingsRoutes from './routes/listings.js';
import referralsRoutes from './routes/referrals.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Sentry init (must be before anything else) ────────────────────────────────
initSentry();

const app = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('send_message', ({ senderId, receiverId, body, listingId }) => {
    if (!senderId || !receiverId || !body) return;
    const msg = Messages.create({ id: genId(), sender_id: senderId, receiver_id: receiverId, body, listing_id: listingId || null });
    const sender = Users.findById(senderId);
    const enriched = { ...msg, sender_name: sender?.name };
    io.to(receiverId).emit('receive_message', enriched);
    io.to(senderId).emit('receive_message', enriched);
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('user_typing', { senderId });
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// ─── Middleware stack ─────────────────────────────────────────────────────────
app.set('trust proxy', 1);                            // trust nginx X-Forwarded-For
app.use(sentryRequestHandler);                        // sentry — first
app.use(httpLogger);                                  // structured request logs
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health / Readiness / Metrics ─────────────────────────────────────────────
app.get('/api/health', livenessHandler);
app.get('/api/ready', readinessHandler);
app.get('/api/metrics', metricsHandler);

// ─── API Routes (with global rate limit) ──────────────────────────────────────
const apiLimiter = createRateLimiter();
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(sentryErrorHandler);  // sentry captures 5xx
app.use(errorHandler);        // structured JSON error responses

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n✅ StudentHub API running → http://localhost:${PORT}`);
  console.log(`   Health  → http://localhost:${PORT}/api/health`);
  console.log(`   Ready   → http://localhost:${PORT}/api/ready`);
  console.log(`   Metrics → http://localhost:${PORT}/api/metrics`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received — shutting down gracefully…');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => { console.error('❌ Force shutdown'); process.exit(1); }, 10_000);
});

process.on('SIGINT', () => process.emit('SIGTERM'));

// ─── Uncaught errors — log before crashing ───────────────────────────────────
process.on('uncaughtException', (err) => { console.error('uncaughtException', err); process.exit(1); });
process.on('unhandledRejection', (err) => { console.error('unhandledRejection', err); process.exit(1); });
