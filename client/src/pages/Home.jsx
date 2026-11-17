import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingBag, Home as HomeIcon, Trees, SlidersHorizontal, X, Plus, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = {
  marketplace: ['Electronics', 'Car', 'Books', 'Clothing', 'Furniture', 'Appliances', 'Sports', 'Other'],
  rental: ['Apartment', 'Room', 'Studio', 'Car', 'House', 'Hostel'],
  property: ['Land', 'House', 'Plot', 'Car', 'Commercial'],
};

const TABS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'rental', label: 'Rentals', icon: HomeIcon },
  { id: 'property', label: 'Land & Property', icon: Trees },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ state: '', minPrice: '', maxPrice: '', category: '' });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('type', activeTab);
      if (searchQ) params.set('q', searchQ);
      if (filters.state) params.set('state', filters.state);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.category) params.set('category', filters.category);

      const { data } = await axios.get(`/api/listings?${params}`);
      setListings(data.listings || []);
    } catch { setListings([]); }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [activeTab, searchQ, filters]);

  const handleDelete = (id) => setListings(prev => prev.filter(l => l.id !== id));
  const clearFilters = () => setFilters({ state: '', minPrice: '', maxPrice: '', category: '' });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3">
          <span className="gradient-text">Student</span>Hub
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Buy, sell, rent — your campus marketplace for everything you need.
        </p>
        {user?.state && (
          <p className="flex items-center gap-1.5 justify-center text-sm text-slate-500 mt-2">
            <MapPin size={13} className="text-brand-400" />
            Showing listings near <span className="text-brand-300">{user.city || user.state}</span>
          </p>
        )}
        {!user && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link to="/signup" className="btn-primary">Get Started Free</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
        )}
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-10 h-12"
            type="text"
            placeholder="Search listings, rentals, properties..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary h-12 px-4 flex items-center gap-2 ${hasFilters ? 'border-brand-500/50 text-brand-300' : ''}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && <span className="badge-blue text-[10px] px-1.5 py-0.5">ON</span>}
        </button>
        {user && (
          <Link to="/post" className="btn-primary h-12 px-4 flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">Post</span>
          </Link>
        )}
      </motion.div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label">State / Location</label>
                <input className="input" placeholder="e.g. Lagos" value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select className="select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                  <option value="">All categories</option>
                  {(CATEGORIES[activeTab] || [...CATEGORIES.marketplace, ...CATEGORIES.rental, ...CATEGORIES.property]).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Min Price (₦)</label>
                <input className="input" type="number" placeholder="0" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Max Price (₦)</label>
                <input className="input" type="number" placeholder="1,000,000" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
              </div>
              <div className="col-span-2 md:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 text-xs text-slate-400">
                  <X size={13} /> Clear filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${activeTab === id
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
              : 'bg-white/6 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200'
              }`}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500 mb-4">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center mx-auto mb-5">
            <Search size={36} className="text-slate-600" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-300 mb-2">No listings found</h3>
          <p className="text-sm text-slate-500 mb-6">Try adjusting your search or filters.</p>
          {user && (
            <Link to="/post" className="btn-primary">Be the first to post</Link>
          )}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
