import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CardSkeleton } from '../components/SkeletonLoader';
import ListingCard from '../components/ListingCard';
import {
  User, MapPin, Copy, Check, Gift, TrendingUp, Package,
  ExternalLink, Loader, Edit3, Save
} from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [referrals, setReferrals] = useState({ referrals: [], totalEarned: 0, pending: 0 });
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [locationForm, setLocationForm] = useState({ state: '', city: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setLocationForm({ state: user.state || '', city: user.city || '', address: user.address || '' });
    Promise.all([
      axios.get(`/api/listings/user/${user.id}`),
      axios.get('/api/referrals/my'),
      axios.get('/api/referrals/link'),
    ]).then(([l, r, lk]) => {
      setMyListings(l.data);
      setReferrals(r.data);
      setReferralLink(lk.data.referralLink);
    }).finally(() => setLoading(false));
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/auth/location', locationForm);
      setUser(data.user);
      setEditing(false);
    } catch { alert('Failed to update location'); }
    setSaving(false);
  };

  const handleDelete = (id) => setMyListings(prev => prev.filter(l => l.id !== id));

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 flex flex-col md:flex-row gap-5 items-start md:items-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-brand-500/30 flex-shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-slate-100">{user.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>

          {/* Location display / edit */}
          {editing ? (
            <div className="mt-3 flex flex-wrap gap-2 items-end">
              <input
                className="input max-w-28 text-xs py-2"
                placeholder="State"
                value={locationForm.state}
                onChange={e => setLocationForm(p => ({ ...p, state: e.target.value }))}
              />
              <input
                className="input max-w-28 text-xs py-2"
                placeholder="City"
                value={locationForm.city}
                onChange={e => setLocationForm(p => ({ ...p, city: e.target.value }))}
              />
              <input
                className="input max-w-52 text-xs py-2"
                placeholder="Address"
                value={locationForm.address}
                onChange={e => setLocationForm(p => ({ ...p, address: e.target.value }))}
              />
              <button onClick={handleSaveLocation} disabled={saving} className="btn-primary py-2 px-3 text-xs flex items-center gap-1">
                {saving ? <Loader size={12} className="animate-spin-slow" /> : <Save size={12} />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs py-2">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <p className="flex items-center gap-1.5 text-sm text-slate-400">
                <MapPin size={13} className="text-brand-400" />
                {[user.city, user.state].filter(Boolean).join(', ') || 'Location not set'}
              </p>
              <button onClick={() => setEditing(true)} className="btn-ghost text-xs flex items-center gap-1 text-slate-500 py-1 px-2">
                <Edit3 size={12} /> Edit
              </button>
            </div>
          )}
        </div>

        {user.is_admin === 1 && (
          <span className="badge badge-amber flex-shrink-0">
            👑 Admin
          </span>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats + Referrals */}
        <div className="flex flex-col gap-5">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-400" />
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Listings', value: myListings.length, icon: Package },
                { label: 'Referrals', value: referrals.referrals.length, icon: Gift },
                { label: 'Earned', value: `₦${referrals.totalEarned.toLocaleString()}`, icon: TrendingUp },
                { label: 'Pending', value: referrals.pending, icon: User },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-surface-2 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="font-display font-bold text-lg gradient-text">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Referral box */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Gift size={16} className="text-brand-400" />
              Referral Program
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Invite friends and earn <span className="text-emerald-400 font-semibold">₦500</span> when they post their first listing!
            </p>

            <div className="bg-surface-2 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-500 mb-1">Your referral code</p>
              <p className="font-mono text-brand-300 font-bold text-lg">{user.referral_code}</p>
            </div>

            <button onClick={copyLink} className="btn-secondary w-full text-xs flex items-center justify-center gap-2">
              {copied ? <><Check size={14} className="text-emerald-400" /> Copied!</> : <><Copy size={14} /> Copy Referral Link</>}
            </button>

            {referralLink && (
              <a href={referralLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-400 mt-2 hover:underline">
                <ExternalLink size={11} />
                Preview link
              </a>
            )}
          </motion.div>

          {/* Referral history */}
          {referrals.referrals.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="font-semibold text-slate-200 mb-3 text-sm">Referral History</h3>
              <div className="flex flex-col gap-2">
                {referrals.referrals.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-300">{r.referred_name}</p>
                      <p className="text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={r.status === 'paid' ? 'badge-green' : 'badge-amber'}>
                      {r.status === 'paid' ? `+₦${r.reward_amount}` : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-slate-100">My Listings</h2>
            <button onClick={() => navigate('/post')} className="btn-primary text-xs py-2">+ New Listing</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : myListings.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Package size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No listings yet.</p>
              <button onClick={() => navigate('/post')} className="btn-primary mt-4 text-sm">Post Your First Listing</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myListings.map(l => (
                <ListingCard key={l.id} listing={l} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
