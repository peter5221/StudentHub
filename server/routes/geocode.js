import express from 'express';
const router = express.Router();

// GET /api/geocode?lat=...&lng=...
router.get('/', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'StudentHub/1.0 (student-marketplace-app)' }
    });
    const data = await response.json();
    const addr = data.address || {};

    return res.json({
      state: addr.state || addr.region || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      address: data.display_name || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return res.status(500).json({ error: 'Geocoding failed' });
  }
});

// GET /api/geocode/ip
router.get('/ip', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';
    const url = `https://ipapi.co/${ip}/json/`;
    const response = await fetch(url);
    const data = await response.json();

    return res.json({
      state: data.region || '',
      city: data.city || '',
      address: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`,
      lat: data.latitude || null,
      lng: data.longitude || null,
    });
  } catch (err) {
    console.error('IP geocode error:', err.message);
    return res.status(500).json({ error: 'IP geocoding failed' });
  }
});

export default router;
