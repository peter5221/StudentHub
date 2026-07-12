import { motion } from 'framer-motion';
import { MapPin, Tag, BedDouble, Clock, Flag, MessageCircle, Trash2, ShoppingBag, Home, Trees } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TYPE_META = {
  marketplace: { label: 'For Sale', icon: ShoppingBag, badge: 'badge-blue' },
  rental: { label: 'For Rent', icon: Home, badge: 'badge-green' },
  property: { label: 'Property', icon: Trees, badge: 'badge-purple' },
};

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%231d1f38' width='400' height='300'/%3E%3Ctext fill='%23475569' font-size='40' font-family='sans-serif' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3E🏷️%3C/text%3E%3C/svg%3E";

export default function ListingCard({ listing, onDelete, onChat }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const meta = TYPE_META[listing.type] || TYPE_META.marketplace;
  const Icon = meta.icon;
  const image = listing.images?.[0] || PLACEHOLDER_IMG;
  const isOwner = user && listing.user_id === user.id;

  const handleFlag = async (e) => {
    e.stopPropagation();
    try {
      await axios.patch(`/api/listings/${listing.id}/flag`);
      alert('Listing reported for review');
    } catch {
      alert('Failed to report listing');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/api/listings/${listing.id}`);
      onDelete?.(listing.id);
    } catch {
      alert('Failed to delete listing');
    }
  };

  const handleChat = (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    onChat?.(listing);
    navigate(`/chat?userId=${listing.user_id}&listingId=${listing.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col"
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = PLACEHOLDER_IMG; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`${meta.badge} flex items-center gap-1`}>
            <Icon size={11} />
            {meta.label}
          </span>
        </div>

        {/* Flagged badge */}
        {listing.flagged && (
          <div className="absolute top-3 right-3">
            <span className="badge badge-red">⚠ Flagged</span>
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-display font-bold text-lg drop-shadow-lg">
            ₦{Number(listing.price).toLocaleString()}
            {listing.type === 'rental' ? <span className="text-xs font-normal opacity-80">/mo</span> : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2">
          {listing.category && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Tag size={11} />
              {listing.category}
            </span>
          )}
          {listing.bedrooms && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <BedDouble size={11} />
              {listing.bedrooms} bed
            </span>
          )}
          {listing.availability_date && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {new Date(listing.availability_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Location */}
        {(listing.city || listing.state || listing.seller_city || listing.seller_state) && (
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} />
            {[listing.city || listing.seller_city, listing.state || listing.seller_state]
              .filter(Boolean).join(', ')}
          </p>
        )}

        {/* Seller */}
        <p className="text-xs text-slate-500 mt-auto">
          By <span className="text-slate-300">{listing.seller_name || 'Unknown'}</span>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/8">
          {!isOwner && (
            <button
              onClick={handleChat}
              className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={13} />
              Message Seller
            </button>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="flex-1 btn-danger text-xs flex items-center justify-center gap-1.5">
              <Trash2 size={13} />
              Delete
            </button>
          )}
          {!isOwner && (
            <button onClick={handleFlag} className="btn-ghost p-2 text-slate-500 hover:text-red-400" title="Report listing">
              <Flag size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
