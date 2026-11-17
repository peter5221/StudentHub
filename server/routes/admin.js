import express from 'express';
import bcrypt from 'bcryptjs';
import db, { Users, Listings, Referrals, getRecentActivity, genId } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAdmin, (req, res) => {
  return res.json({
    totalUsers: Users.count(),
    activeListings: Listings.countActive(),
    flaggedListings: Listings.countFlagged(),
    totalReferrals: Referrals.countTotal(),
    pendingPayouts: Referrals.sumPending(),
    paidPayouts: Referrals.sumPaid(),
    byType: Listings.countByType(),
    byState: Users.countByState(),
  });
});

// GET /api/admin/activity
router.get('/activity', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 25;
  return res.json(getRecentActivity(limit));
});

// GET /api/admin/users
router.get('/users', requireAdmin, (req, res) => {
  const { q } = req.query;
  let users = Users.findAll().map(({ password_hash, ...u }) => u);
  if (q) {
    const query = q.toLowerCase();
    users = users.filter(u => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query));
  }
  return res.json({ users, total: users.length });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, (req, res) => {
  Users.delete(req.params.id);
  return res.json({ success: true });
});

// POST /api/admin/users  — admin creates a new user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, state, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (Users.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id = genId();
    const user = Users.create({
      id, name, email, password_hash,
      referral_code: name.replace(/\s+/g, '').toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase(),
      state: state || null,
      city: city || null,
      is_admin: req.body.is_admin ? 1 : 0,
    });

    const { password_hash: _, ...safe } = user;
    return res.status(201).json({ user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/admin/users/:id/promote  — toggle admin status
router.patch('/users/:id/promote', requireAdmin, (req, res) => {
  const user = Users.toggleAdmin(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safe } = user;
  return res.json({ user: safe });
});

// PATCH /api/admin/users/:id/ban  — toggle ban status
router.patch('/users/:id/ban', requireAdmin, (req, res) => {
  const user = Users.toggleBan(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safe } = user;
  return res.json({ user: safe });
});

// GET /api/admin/listings
router.get('/listings', requireAdmin, (req, res) => {
  const listings = Listings.findAllAdmin(req.query.flagged === '1');
  return res.json({ listings, total: listings.length });
});

// DELETE /api/admin/listings/:id
router.delete('/listings/:id', requireAdmin, (req, res) => {
  Listings.delete(req.params.id);
  return res.json({ success: true });
});

// PATCH /api/admin/listings/:id/unflag
router.patch('/listings/:id/unflag', requireAdmin, (req, res) => {
  Listings.update(req.params.id, { flagged: false });
  return res.json({ success: true });
});

// PATCH /api/admin/listings/:id/approve
router.patch('/listings/:id/approve', requireAdmin, (req, res) => {
  const listing = Listings.approve(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  return res.json({ listing });
});

// GET /api/admin/referrals
router.get('/referrals', requireAdmin, (req, res) => {
  return res.json(Referrals.findAll());
});

// PATCH /api/admin/referrals/:id/payout
router.patch('/referrals/:id/payout', requireAdmin, (req, res) => {
  Referrals.markPaid(req.params.id);
  return res.json({ success: true });
});

// ─── Danger Zone Actions ───────────────────────────────────────────────────────
// POST /api/admin/danger/delete-flagged
router.post('/danger/delete-flagged', requireAdmin, (req, res) => {
  const countBefore = db.data.listings.length;
  db.data.listings = db.data.listings.filter(l => !l.flagged);
  const deleted = countBefore - db.data.listings.length;
  db.write();
  return res.json({ success: true, message: `Deleted ${deleted} flagged listing(s)` });
});

// POST /api/admin/danger/delete-all-listings
router.post('/danger/delete-all-listings', requireAdmin, (req, res) => {
  const deleted = db.data.listings.length;
  db.data.listings = [];
  db.write();
  return res.json({ success: true, message: `Cleared all ${deleted} listings` });
});

// POST /api/admin/danger/delete-banned-users
router.post('/danger/delete-banned-users', requireAdmin, (req, res) => {
  const bannedIds = new Set(db.data.users.filter(u => u.banned).map(u => u.id));
  db.data.users = db.data.users.filter(u => !u.banned);
  db.data.listings = db.data.listings.filter(l => !bannedIds.has(l.user_id));
  db.write();
  return res.json({ success: true, message: `Purged ${bannedIds.size} banned account(s)` });
});

// POST /api/admin/danger/reset-database
router.post('/danger/reset-database', requireAdmin, (req, res) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  // Preserve admins
  db.data.users = db.data.users.filter(u => u.is_admin === 1 || u.email?.toLowerCase() === adminEmail);
  db.data.listings = [];
  db.data.referrals = [];
  db.data.messages = [];
  db.write();
  return res.json({ success: true, message: 'Database reset successfully. Admin accounts preserved.' });
});

export default router;
