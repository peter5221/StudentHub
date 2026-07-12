import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Home, Trees, Upload, X, Loader, CheckCircle } from 'lucide-react';

const TYPES = [
  { id: 'marketplace', label: 'Sell Item', icon: ShoppingBag, color: 'from-blue-500 to-brand-600' },
  { id: 'rental', label: 'Rent House', icon: Home, color: 'from-emerald-500 to-teal-600' },
  { id: 'property', label: 'Land & Property', icon: Trees, color: 'from-purple-500 to-violet-600' },
];

const CATEGORIES = {
  marketplace: ['Electronics', 'Books', 'Clothing', 'Furniture', 'Appliances', 'Sports', 'Other'],
  rental: ['Apartment', 'Room', 'Studio', 'House', 'Hostel'],
  property: ['Land', 'House', 'Plot', 'Commercial'],
};

export default function PostListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('marketplace');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '',
    condition: 'Good', bedrooms: '', bathrooms: '', availability_date: '',
    property_type: '', state: user?.state || '', city: user?.city || '', address: user?.address || '',
  });

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('type', type);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach(img => fd.append('images', img));

      await axios.post('/api/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-200 mb-4">Login Required</h2>
        <p className="text-slate-400 mb-6">You need to be logged in to post a listing.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Login Now</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-emerald-300 mb-2">Listing Created!</h2>
          <p className="text-slate-400 text-sm">Redirecting to the marketplace...</p>
        </motion.div>
      </div>
    );
  }

  const activeType = TYPES.find(t => t.id === type);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl text-slate-100 mb-2">Create a Listing</h1>
        <p className="text-slate-400 text-sm mb-8">Choose a type, fill in the details, and publish.</p>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {TYPES.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setType(id)}
              className={`glass-card p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 cursor-pointer ${
                type === id
                  ? 'border-brand-500/60 bg-white/8 shadow-lg shadow-brand-500/15'
                  : 'hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className={`text-xs font-semibold ${type === id ? 'text-brand-300' : 'text-slate-400'}`}>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="input-label">Title *</label>
            <input className="input" type="text" placeholder={
              type === 'marketplace' ? 'e.g. HP Laptop in great condition' :
              type === 'rental' ? 'e.g. Self-contain in Yaba' :
              'e.g. 3-bedroom plot in Lekki'
            } value={form.title} onChange={set('title')} required />
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Description</label>
            <textarea className="textarea" rows={3} placeholder="Describe the item, condition, unique features..." value={form.description} onChange={set('description')} />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">
                Price (₦) * {type === 'rental' ? '/ month' : ''}
              </label>
              <input className="input" type="number" min="0" placeholder="50000" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select className="select" value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {(CATEGORIES[type] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Marketplace-specific */}
          {type === 'marketplace' && (
            <div>
              <label className="input-label">Condition</label>
              <select className="select" value={form.condition} onChange={set('condition')}>
                {['Brand New', 'Like New', 'Good', 'Fair', 'Used'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Rental-specific */}
          {type === 'rental' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="input-label">Bedrooms</label>
                <input className="input" type="number" min="1" placeholder="2" value={form.bedrooms} onChange={set('bedrooms')} />
              </div>
              <div>
                <label className="input-label">Bathrooms</label>
                <input className="input" type="number" min="1" placeholder="1" value={form.bathrooms} onChange={set('bathrooms')} />
              </div>
              <div>
                <label className="input-label">Available From</label>
                <input className="input" type="date" value={form.availability_date} onChange={set('availability_date')} />
              </div>
            </div>
          )}

          {/* Property-specific */}
          {type === 'property' && (
            <div>
              <label className="input-label">Property Type</label>
              <select className="select" value={form.property_type} onChange={set('property_type')}>
                <option value="">Select type</option>
                {['Land', 'Bungalow', 'Duplex', 'Flat', 'Commercial', 'Estate'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Location */}
          <div className="divider" />
          <h3 className="text-sm font-semibold text-slate-300">Location Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">State</label>
              <input className="input" type="text" placeholder="e.g. Lagos" value={form.state} onChange={set('state')} />
            </div>
            <div>
              <label className="input-label">City</label>
              <input className="input" type="text" placeholder="e.g. Surulere" value={form.city} onChange={set('city')} />
            </div>
          </div>
          <div>
            <label className="input-label">Address (optional)</label>
            <input className="input" type="text" placeholder="Full address or area" value={form.address} onChange={set('address')} />
          </div>

          {/* Images */}
          <div className="divider" />
          <div>
            <label className="input-label">Photos (up to 6)</label>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 rounded-xl p-8 cursor-pointer hover:border-brand-500/50 hover:bg-white/3 transition-all">
              <Upload size={24} className="text-slate-500" />
              <span className="text-sm text-slate-400">Click to upload images</span>
              <span className="text-xs text-slate-600">JPG, PNG, WebP · Max 5MB each</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary py-4 flex items-center justify-center gap-2 text-base mt-2">
            {loading ? <><Loader size={18} className="animate-spin-slow" /> Publishing...</> : 'Publish Listing'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
