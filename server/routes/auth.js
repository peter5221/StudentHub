import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users, Referrals, genId } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function generateReferralCode(name) {
  const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  return base + Math.random().toString(36).substring(2, 7).toUpperCase();
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: !!user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, refCode, state, city, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (Users.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id = genId();
    const referral_code = generateReferralCode(name);
    const isAdmin = email === process.env.ADMIN_EMAIL ? 1 : 0;

    const user = Users.create({
      id, name, email, password_hash, referral_code,
      state: state || null, city: city || null, address: address || null,
      is_admin: isAdmin,
    });

    if (refCode) {
      const referrer = Users.findByReferralCode(refCode);
      if (referrer && referrer.id !== id) {
        Referrals.create({ id: genId(), referrer_id: referrer.id, referred_id: id });
      }
    }

    return res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = Users.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Auto-promote admin on first login if not already flagged
    let currentUser = user;
    if (user.email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() && !user.is_admin) {
      Users.update(user.id, { is_admin: 1 });
      currentUser = Users.findById(user.id);
    }

    return res.json({ token: signToken(currentUser), user: sanitizeUser(currentUser) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// PATCH /api/auth/location
router.patch('/location', requireAuth, (req, res) => {
  const { state, city, address, lat, lng } = req.body;
  const user = Users.update(req.user.id, { state, city, address, lat, lng });
  return res.json({ user: sanitizeUser(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: sanitizeUser(user) });
});

export default router;
