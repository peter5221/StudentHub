import express from 'express';
import { Referrals, Users } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/referrals/my
router.get('/my', requireAuth, (req, res) => {
  const referrals = Referrals.findByReferrer(req.user.id);
  const totalEarned = referrals.filter(r => r.status === 'paid').reduce((s, r) => s + r.reward_amount, 0);
  const pending = referrals.filter(r => r.status === 'pending').length;
  return res.json({ referrals, totalEarned, pending });
});

// GET /api/referrals/link
router.get('/link', requireAuth, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    referralCode: user.referral_code,
    referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${user.referral_code}`,
  });
});

export default router;
