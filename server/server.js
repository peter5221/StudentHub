import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { Messages, Users, genId } from './database.js';

import authRoutes from './routes/auth.js';
import geocodeRoutes from './routes/geocode.js';
import listingsRoutes from './routes/listings.js';
import referralsRoutes from './routes/referrals.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('send_message', ({ senderId, receiverId, body, listingId }) => {
    if (!senderId || !receiverId || !body) return;
    const msg = Messages.create({
      id: genId(),
      sender_id: senderId,
      receiver_id: receiverId,
      body,
      listing_id: listingId || null,
    });
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

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n✅ StudentHub API running → http://localhost:${PORT}`);
  console.log(`   Admin email: ${process.env.ADMIN_EMAIL || 'admin@studenthub.com'}`);
});
