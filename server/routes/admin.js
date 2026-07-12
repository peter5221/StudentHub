import express from 'express';
import { Users, Listings, Referrals, getRecentActivity } from '../database.js';
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

export default router;
