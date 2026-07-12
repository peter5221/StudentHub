import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Listings, Referrals, genId } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Multer setup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

// GET /api/listings
router.get('/', (req, res) => {
  const { type, state, category, q, minPrice, maxPrice } = req.query;
  const all = Listings.findAll({ type, state, category, q, minPrice, maxPrice });
  return res.json({ listings: all, total: all.length });
});

// GET /api/listings/user/:userId
router.get('/user/:userId', (req, res) => {
  return res.json(Listings.findByUserId(req.params.userId));
});

// GET /api/listings/:id
router.get('/:id', (req, res) => {
  const listing = Listings.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  return res.json(listing);
});

// POST /api/listings
router.post('/', requireAuth, upload.array('images', 6), (req, res) => {
  const {
    type, title, description, price, category, condition,
    bedrooms, bathrooms, availability_date, property_type,
    state, city, address
  } = req.body;

  if (!type || !title || !price) {
    return res.status(400).json({ error: 'type, title, and price are required' });
  }

  const imageUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  const listing = Listings.create({
    id: genId(),
    user_id: req.user.id,
    type, title,
    description: description || '',
    price: Number(price),
    category: category || null,
    condition: condition || null,
    bedrooms: bedrooms ? Number(bedrooms) : null,
    bathrooms: bathrooms ? Number(bathrooms) : null,
    availability_date: availability_date || null,
    property_type: property_type || null,
    state: state || null,
    city: city || null,
    address: address || null,
    images: imageUrls,
  });

  // Mark referral as paid on first listing
  if (Listings.countByUser(req.user.id) === 1) {
    Referrals.markPaidByReferred(req.user.id);
  }

  return res.status(201).json(listing);
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, (req, res) => {
  const listing = Listings.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.user_id !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Not your listing' });
  }
  // Clean up images
  listing.images?.forEach(imgPath => {
    const full = path.join(__dirname, '..', imgPath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  });
  Listings.delete(req.params.id);
  return res.json({ success: true });
});

// PATCH /api/listings/:id/flag
router.patch('/:id/flag', requireAuth, (req, res) => {
  const listing = Listings.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  Listings.update(req.params.id, { flagged: true });
  return res.json({ success: true });
});

export default router;
