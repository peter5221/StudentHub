import express from 'express';
import { Messages, genId } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages — all conversations
router.get('/', requireAuth, (req, res) => {
  return res.json(Messages.getConversations(req.user.id));
});

// GET /api/messages/:otherId — message thread
router.get('/:otherId', requireAuth, (req, res) => {
  const messages = Messages.findConversation(req.user.id, req.params.otherId);
  Messages.markRead(req.user.id, req.params.otherId);
  return res.json(messages);
});

// POST /api/messages — send (HTTP fallback)
router.post('/', requireAuth, (req, res) => {
  const { receiverId, body, listingId } = req.body;
  if (!receiverId || !body) return res.status(400).json({ error: 'receiverId and body required' });
  const msg = Messages.create({
    id: genId(),
    sender_id: req.user.id,
    receiver_id: receiverId,
    body,
    listing_id: listingId || null,
  });
  return res.status(201).json(msg);
});

export default router;
