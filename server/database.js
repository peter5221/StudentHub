/**
 * database.js — Pure-JS file-based database using lowdb
 * No native compilation required — works on all platforms.
 * Data persists to db.json in the server directory.
 */
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, {
  users: [],
  listings: [],
  referrals: [],
  messages: [],
});

// Load data from file on startup
db.read();

export const genId = () => uuidv4();

// ─── Users ────────────────────────────────────────────────────────────────────
export const Users = {
  findAll: () => db.data.users,

  findById: (id) => db.data.users.find(u => u.id === id),

  findByEmail: (email) => db.data.users.find(u => u.email === email),

  findByReferralCode: (code) => db.data.users.find(u => u.referral_code === code),

  create: (data) => {
    const user = { created_at: new Date().toISOString(), is_admin: 0, ...data };
    db.data.users.push(user);
    db.write();
    return user;
  },

  update: (id, patch) => {
    const idx = db.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.data.users[idx] = { ...db.data.users[idx], ...patch };
    db.write();
    return db.data.users[idx];
  },

  delete: (id) => {
    db.data.users = db.data.users.filter(u => u.id !== id);
    db.write();
  },

  toggleAdmin: (id) => {
    const idx = db.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.data.users[idx].is_admin = db.data.users[idx].is_admin ? 0 : 1;
    db.write();
    return db.data.users[idx];
  },

  toggleBan: (id) => {
    const idx = db.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.data.users[idx].banned = db.data.users[idx].banned ? 0 : 1;
    db.write();
    return db.data.users[idx];
  },

  count: () => db.data.users.length,

  countByState: () => {
    const map = {};
    db.data.users.forEach(u => {
      if (u.state) map[u.state] = (map[u.state] || 0) + 1;
    });
    return Object.entries(map)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },
};

// ─── Listings ─────────────────────────────────────────────────────────────────
export const Listings = {
  findAll: (filters = {}) => {
    let items = db.data.listings.filter(l => l.status === 'active');
    if (filters.type) items = items.filter(l => l.type === filters.type);
    if (filters.state) items = items.filter(l => l.state?.toLowerCase().includes(filters.state.toLowerCase()));
    if (filters.category) items = items.filter(l => l.category?.toLowerCase().includes(filters.category.toLowerCase()));
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(l => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    if (filters.minPrice) items = items.filter(l => l.price >= Number(filters.minPrice));
    if (filters.maxPrice) items = items.filter(l => l.price <= Number(filters.maxPrice));
    items = items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Join seller info
    return items.map(l => {
      const seller = db.data.users.find(u => u.id === l.user_id);
      return {
        ...l,
        seller_name: seller?.name || 'Unknown',
        seller_state: seller?.state || '',
        seller_city: seller?.city || '',
      };
    });
  },

  findById: (id) => {
    const l = db.data.listings.find(l => l.id === id);
    if (!l) return null;
    const seller = db.data.users.find(u => u.id === l.user_id);
    return { ...l, seller_name: seller?.name, seller_state: seller?.state, seller_city: seller?.city };
  },

  findByUserId: (userId) =>
    db.data.listings.filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),

  create: (data) => {
    const listing = {
      status: 'active',
      flagged: false,
      images: [],
      created_at: new Date().toISOString(),
      ...data,
    };
    db.data.listings.push(listing);
    db.write();
    return listing;
  },

  delete: (id) => {
    db.data.listings = db.data.listings.filter(l => l.id !== id);
    db.write();
  },

  approve: (id) => {
    const idx = db.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    db.data.listings[idx].status = 'active';
    db.data.listings[idx].flagged = false;
    db.write();
    return db.data.listings[idx];
  },

  update: (id, patch) => {
    const idx = db.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    db.data.listings[idx] = { ...db.data.listings[idx], ...patch };
    db.write();
    return db.data.listings[idx];
  },

  countByUser: (userId) => db.data.listings.filter(l => l.user_id === userId).length,
  countActive: () => db.data.listings.filter(l => l.status === 'active').length,
  countFlagged: () => db.data.listings.filter(l => l.flagged).length,
  countByType: () => {
    const map = {};
    db.data.listings.filter(l => l.status === 'active').forEach(l => {
      map[l.type] = (map[l.type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  },
  findAllAdmin: (flagged) => {
    let items = flagged ? db.data.listings.filter(l => l.flagged) : db.data.listings;
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(l => {
      const s = db.data.users.find(u => u.id === l.user_id);
      return { ...l, seller_name: s?.name, seller_email: s?.email };
    });
  },
};

// ─── Referrals ────────────────────────────────────────────────────────────────
export const Referrals = {
  findByReferrer: (referrerId) => {
    return db.data.referrals
      .filter(r => r.referrer_id === referrerId)
      .map(r => {
        const referred = db.data.users.find(u => u.id === r.referred_id);
        return { ...r, referred_name: referred?.name, referred_email: referred?.email, referred_at: referred?.created_at };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  create: (data) => {
    const ref = { status: 'pending', reward_amount: 500, created_at: new Date().toISOString(), ...data };
    db.data.referrals.push(ref);
    db.write();
    return ref;
  },

  markPaidByReferred: (referredId) => {
    db.data.referrals = db.data.referrals.map(r =>
      r.referred_id === referredId && r.status === 'pending' ? { ...r, status: 'paid' } : r
    );
    db.write();
  },

  markPaid: (id) => {
    const idx = db.data.referrals.findIndex(r => r.id === id);
    if (idx !== -1) { db.data.referrals[idx].status = 'paid'; db.write(); }
  },

  findAll: () => db.data.referrals.map(r => {
    const rr = db.data.users.find(u => u.id === r.referrer_id);
    const rd = db.data.users.find(u => u.id === r.referred_id);
    return { ...r, referrer_name: rr?.name, referrer_email: rr?.email, referred_name: rd?.name, referred_email: rd?.email };
  }),

  countTotal: () => db.data.referrals.length,
  sumPending: () => db.data.referrals.filter(r => r.status === 'pending').reduce((s, r) => s + r.reward_amount, 0),
  sumPaid: () => db.data.referrals.filter(r => r.status === 'paid').reduce((s, r) => s + r.reward_amount, 0),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const Messages = {
  findConversation: (userId1, userId2) =>
    db.data.messages
      .filter(m =>
        (m.sender_id === userId1 && m.receiver_id === userId2) ||
        (m.sender_id === userId2 && m.receiver_id === userId1)
      )
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(m => {
        const s = db.data.users.find(u => u.id === m.sender_id);
        const r = db.data.users.find(u => u.id === m.receiver_id);
        return { ...m, sender_name: s?.name, receiver_name: r?.name };
      }),

  markRead: (receiverId, senderId) => {
    db.data.messages = db.data.messages.map(m =>
      m.receiver_id === receiverId && m.sender_id === senderId && !m.read_at
        ? { ...m, read_at: new Date().toISOString() }
        : m
    );
    db.write();
  },

  create: (data) => {
    const msg = { created_at: new Date().toISOString(), read_at: null, ...data };
    db.data.messages.push(msg);
    db.write();
    return msg;
  },

  getConversations: (userId) => {
    const seen = new Set();
    const conversations = [];
    const relevant = db.data.messages
      .filter(m => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (const m of relevant) {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        const other = db.data.users.find(u => u.id === otherId);
        const unread = db.data.messages.filter(
          x => x.sender_id === otherId && x.receiver_id === userId && !x.read_at
        ).length;
        conversations.push({
          other_id: otherId,
          other_name: other?.name,
          other_state: other?.state,
          other_city: other?.city,
          last_message: m.body,
          last_at: m.created_at,
          unread_count: unread,
        });
      }
    }
    return conversations;
  },
};

// ─── Recent Activity Feed ─────────────────────────────────────────────────────
export function getRecentActivity(limit = 25) {
  const events = [];

  db.data.users.forEach(u => {
    events.push({
      type: 'signup',
      id: u.id,
      label: `${u.name} signed up`,
      sub: u.email,
      at: u.created_at,
    });
  });

  db.data.listings.forEach(l => {
    const seller = db.data.users.find(u => u.id === l.user_id);
    events.push({
      type: 'listing',
      id: l.id,
      label: `New listing: "${l.title}"`,
      sub: `by ${seller?.name || 'Unknown'} · ${l.type}`,
      at: l.created_at,
    });
  });

  db.data.referrals.forEach(r => {
    const referrer = db.data.users.find(u => u.id === r.referrer_id);
    const referred = db.data.users.find(u => u.id === r.referred_id);
    events.push({
      type: 'referral',
      id: r.id,
      label: `Referral: ${referrer?.name || '?'} → ${referred?.name || '?'}`,
      sub: `₦${r.reward_amount} · ${r.status}`,
      at: r.created_at,
    });
  });

  return events
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}

export default db;
