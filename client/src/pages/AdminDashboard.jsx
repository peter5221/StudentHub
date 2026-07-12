import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, Package, Flag, Gift, TrendingUp,
  Trash2, CheckCircle, Search, BarChart2, MapPin,
  UserCog, Ban, LayoutDashboard, Settings, Activity,
  ChevronRight, UserCheck, AlertTriangle, RefreshCw,
  DollarSign, ArrowUpRight, Clock, Tag, Home, Zap,
} from 'lucide-react';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const SIDEBAR = [
  { key: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { key: 'listings',  label: 'Listings',  Icon: Package },
  { key: 'users',     label: 'Users',     Icon: Users },
  { key: 'referrals', label: 'Referrals', Icon: Gift },
  { key: 'settings',  label: 'Settings',  Icon: Settings },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();
const rel = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ Icon, label, value, sub, color = 'brand', trend }) {
  const colors = {
    brand:   { bg: 'bg-brand-50',   icon: 'text-brand-600',   border: 'border-brand-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-600',     border: 'border-red-100' },
    purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  border: 'border-purple-100' },
  };
  const c = colors[color] || colors.brand;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${c.border} p-5 flex flex-col gap-3 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend != null && (
          <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
            <ArrowUpRight size={13} /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="font-display font-bold text-3xl text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function TableHeader({ cols }) {
  return (
    <thead>
      <tr className="border-b border-slate-100">
        {cols.map(c => (
          <th key={c} className="text-left px-4 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide whitespace-nowrap">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function EmptyRow({ cols, msg = 'No records found' }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center text-slate-400 py-12 text-sm">
        {msg}
      </td>
    </tr>
  );
}

function ActionBtn({ onClick, color = 'blue', children, icon: Icon }) {
  const cls = {
    red:    'text-red-500 hover:bg-red-50 hover:text-red-600',
    green:  'text-emerald-600 hover:bg-emerald-50',
    amber:  'text-amber-600 hover:bg-amber-50',
    blue:   'text-brand-600 hover:bg-brand-50',
    purple: 'text-purple-600 hover:bg-purple-50',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${cls[color]}`}
    >
      {Icon && <Icon size={11} />} {children}
    </button>
  );
}

function ActivityIcon({ type }) {
  const map = {
    signup:   { Icon: UserCheck, bg: 'bg-brand-50',   color: 'text-brand-600' },
    listing:  { Icon: Tag,       bg: 'bg-purple-50',  color: 'text-purple-600' },
    referral: { Icon: Zap,       bg: 'bg-amber-50',   color: 'text-amber-600' },
  };
  const { Icon, bg, color } = map[type] || { Icon: Activity, bg: 'bg-slate-100', color: 'text-slate-500' };
  return (
    <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={13} className={color} />
    </div>
  );
}

// ─── Listing type bar chart (pure CSS) ────────────────────────────────────────
function BarChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const palette = ['bg-brand-400', 'bg-purple-400', 'bg-amber-400', 'bg-emerald-400'];
  return (
    <div className="flex items-end gap-3 h-28 mt-2">
      {data.map((d, i) => (
        <div key={d.type} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-semibold text-slate-600">{d.count}</span>
          <div
            className={`w-full rounded-t-lg ${palette[i % palette.length]} transition-all duration-700`}
            style={{ height: `${(d.count / max) * 80}px`, minHeight: 4 }}
          />
          <span className="text-[10px] text-slate-400 capitalize">{d.type}</span>
        </div>
      ))}
    </div>
  );
}

// ─── State distribution bar ───────────────────────────────────────────────────
function StateBar({ items }) {
  if (!items?.length) return null;
  const max = items[0]?.count || 1;
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((s, i) => (
        <div key={s.state} className="flex items-center gap-3">
          <span className="text-xs text-slate-400 w-4 shrink-0">{i + 1}</span>
          <span className="text-sm text-slate-600 w-28 truncate shrink-0">{s.state || 'Unknown'}</span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-purple-400 rounded-full transition-all duration-700"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-6 text-right shrink-0">{s.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [listings, setListings] = useState([]);
  const [users, setUsers]       = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showFlagged, setShowFlagged] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l, u, r, a] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/listings'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/referrals'),
        axios.get('/api/admin/activity'),
      ]);
      setStats(s.data);
      setListings(l.data.listings || []);
      setUsers(u.data.users || []);
      setReferrals(r.data || []);
      setActivity(a.data || []);
    } catch (e) {
      console.error('Admin load failed', e);
    }
    setLoading(false);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // ── Listing actions ─────────────────────────────────────────────────────────
  const deleteListing = async (id) => {
    if (!confirm('Permanently delete this listing?')) return;
    await axios.delete(`/api/admin/listings/${id}`);
    setListings(p => p.filter(l => l.id !== id));
  };
  const unflag = async (id) => {
    await axios.patch(`/api/admin/listings/${id}/unflag`);
    setListings(p => p.map(l => l.id === id ? { ...l, flagged: false } : l));
  };
  const approveListing = async (id) => {
    await axios.patch(`/api/admin/listings/${id}/approve`);
    setListings(p => p.map(l => l.id === id ? { ...l, status: 'active', flagged: false } : l));
  };

  // ── User actions ────────────────────────────────────────────────────────────
  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    setUsers(p => p.filter(u => u.id !== id));
  };
  const promoteUser = async (id) => {
    const { data } = await axios.patch(`/api/admin/users/${id}/promote`);
    setUsers(p => p.map(u => u.id === id ? { ...u, is_admin: data.user.is_admin } : u));
  };
  const banUser = async (id) => {
    const { data } = await axios.patch(`/api/admin/users/${id}/ban`);
    setUsers(p => p.map(u => u.id === id ? { ...u, banned: data.user.banned } : u));
  };

  // ── Referral actions ────────────────────────────────────────────────────────
  const markPayout = async (id) => {
    await axios.patch(`/api/admin/referrals/${id}/payout`);
    setReferrals(p => p.map(r => r.id === id ? { ...r, status: 'paid' } : r));
  };

  if (!user?.is_admin) return null;

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredListings = listings.filter(l =>
    (!showFlagged || l.flagged) &&
    (!search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.seller_name?.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex pt-16">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-100 bg-white px-3 py-6 gap-1 fixed top-16 bottom-0 left-0 z-40">
        <div className="px-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow shadow-amber-300/40">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Admin Panel</p>
              <p className="text-[10px] text-slate-400">Platform Owner</p>
            </div>
          </div>
        </div>

        {SIDEBAR.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch(''); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full ${
              tab === key
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon size={16} />
            {label}
            {tab === key && <ChevronRight size={14} className="ml-auto opacity-50" />}
          </button>
        ))}

        <div className="mt-auto px-3 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-300 uppercase tracking-wide">Logged in as</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-56 px-4 md:px-8 py-8 max-w-full overflow-x-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800 capitalize">{tab}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {tab === 'overview' && 'Platform health at a glance'}
              {tab === 'listings' && `${listings.length} total listings`}
              {tab === 'users'    && `${users.length} registered users`}
              {tab === 'referrals'&& `${referrals.length} referral records`}
              {tab === 'settings' && 'Platform configuration'}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >

            {/* ══════════════ OVERVIEW ══════════════ */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-28 skeleton" />
                    ))}
                  </div>
                ) : stats ? (
                  <>
                    {/* KPI row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard Icon={Users}     label="Total Users"      value={fmt(stats.totalUsers)}       color="brand"   />
                      <KpiCard Icon={Package}   label="Active Listings"  value={fmt(stats.activeListings)}   color="emerald" />
                      <KpiCard Icon={Flag}      label="Flagged"          value={fmt(stats.flaggedListings)}  color="red"     />
                      <KpiCard Icon={Gift}      label="Referrals"        value={fmt(stats.totalReferrals)}   color="purple"  />
                    </div>

                    {/* Payouts row */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <KpiCard Icon={DollarSign}  label="Paid Out"         value={`₦${fmt(stats.paidPayouts)}`}    color="emerald" />
                      <KpiCard Icon={Clock}        label="Pending Payouts"  value={`₦${fmt(stats.pendingPayouts)}`} color="amber"   />
                      <KpiCard Icon={BarChart2}    label="Listing Types"    value={stats.byType?.length || 0}       color="brand"
                        sub={stats.byType?.map(t => `${t.type}: ${t.count}`).join(' · ')}
                      />
                    </div>

                    {/* Charts + Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Listings bar chart */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                          <BarChart2 size={15} className="text-brand-500" /> Listings by Type
                        </h3>
                        <BarChart data={stats.byType} />
                      </div>

                      {/* Users by state */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <MapPin size={15} className="text-brand-500" /> Users by State
                        </h3>
                        <StateBar items={stats.byState} />
                      </div>

                      {/* Recent activity */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Activity size={15} className="text-brand-500" /> Recent Activity
                        </h3>
                        <div className="flex flex-col gap-3 max-h-52 overflow-y-auto no-scrollbar">
                          {activity.slice(0, 10).map(ev => (
                            <div key={ev.id + ev.type} className="flex items-start gap-2.5">
                              <ActivityIcon type={ev.type} />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-700 font-medium truncate leading-tight">{ev.label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{ev.sub} · {rel(ev.at)}</p>
                              </div>
                            </div>
                          ))}
                          {activity.length === 0 && <p className="text-xs text-slate-400">No activity yet.</p>}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400">Failed to load statistics.</p>
                )}
              </div>
            )}

            {/* ══════════════ LISTINGS ══════════════ */}
            {tab === 'listings' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input pl-9 h-10 text-sm"
                      placeholder="Search listings or seller…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowFlagged(!showFlagged)}
                    className={`btn-secondary h-10 text-sm flex items-center gap-2 ${showFlagged ? 'border-red-300 text-red-500 bg-red-50' : ''}`}
                  >
                    <AlertTriangle size={14} />
                    {showFlagged ? 'Show All' : 'Show Flagged'}
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <TableHeader cols={['Title', 'Type', 'Seller', 'Price', 'Status', 'Actions']} />
                      <tbody>
                        {filteredListings.map(l => (
                          <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium max-w-44 truncate">{l.title}</td>
                            <td className="px-4 py-3">
                              <span className={
                                l.type === 'marketplace' ? 'badge-blue' :
                                l.type === 'rental' ? 'badge-green' : 'badge-purple'
                              }>{l.type}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{l.seller_name}</td>
                            <td className="px-4 py-3 text-slate-700 font-medium">₦{fmt(l.price)}</td>
                            <td className="px-4 py-3">
                              {l.flagged
                                ? <span className="badge-red">Flagged</span>
                                : <span className="badge-green">Active</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {l.flagged && (
                                  <>
                                    <ActionBtn onClick={() => unflag(l.id)} color="green" icon={CheckCircle}>Unflag</ActionBtn>
                                    <ActionBtn onClick={() => approveListing(l.id)} color="blue" icon={CheckCircle}>Approve</ActionBtn>
                                  </>
                                )}
                                <ActionBtn onClick={() => deleteListing(l.id)} color="red" icon={Trash2}>Delete</ActionBtn>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredListings.length === 0 && <EmptyRow cols={6} msg="No listings found" />}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ USERS ══════════════ */}
            {tab === 'users' && (
              <div>
                <div className="relative mb-5 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-9 h-10 text-sm"
                    placeholder="Search users…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <TableHeader cols={['Name', 'Email', 'Location', 'Role', 'Status', 'Ref Code', 'Actions']} />
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-slate-500">{u.email}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{[u.city, u.state].filter(Boolean).join(', ') || '—'}</td>
                            <td className="px-4 py-3">
                              {u.is_admin
                                ? <span className="badge-amber">Admin</span>
                                : <span className="badge inline-flex bg-slate-100 text-slate-500">User</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              {u.banned
                                ? <span className="badge-red">Banned</span>
                                : <span className="badge-green">Active</span>
                              }
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-brand-600">{u.referral_code}</td>
                            <td className="px-4 py-3">
                              {!u.is_admin && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <ActionBtn onClick={() => promoteUser(u.id)} color="amber" icon={UserCog}>Promote</ActionBtn>
                                  <ActionBtn onClick={() => banUser(u.id)} color="purple" icon={Ban}>
                                    {u.banned ? 'Unban' : 'Ban'}
                                  </ActionBtn>
                                  <ActionBtn onClick={() => deleteUser(u.id)} color="red" icon={Trash2}>Delete</ActionBtn>
                                </div>
                              )}
                              {u.is_admin && (
                                <ActionBtn onClick={() => promoteUser(u.id)} color="red" icon={UserCog}>Demote</ActionBtn>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && <EmptyRow cols={7} msg="No users found" />}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ REFERRALS ══════════════ */}
            {tab === 'referrals' && (
              <div>
                {/* Payout summary */}
                {stats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <KpiCard Icon={DollarSign} label="Paid Out"        value={`₦${fmt(stats.paidPayouts)}`}    color="emerald" />
                    <KpiCard Icon={Clock}      label="Pending Payouts" value={`₦${fmt(stats.pendingPayouts)}`} color="amber"   />
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <TableHeader cols={['Referrer', 'Referred', 'Reward', 'Status', 'Date', 'Action']} />
                      <tbody>
                        {referrals.map(r => (
                          <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium">{r.referrer_name || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{r.referred_name || '—'}</td>
                            <td className="px-4 py-3 text-emerald-600 font-semibold">₦{fmt(r.reward_amount)}</td>
                            <td className="px-4 py-3">
                              <span className={r.status === 'paid' ? 'badge-green' : 'badge-amber'}>{r.status}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              {r.status === 'pending' && (
                                <ActionBtn onClick={() => markPayout(r.id)} color="green" icon={CheckCircle}>Mark Paid</ActionBtn>
                              )}
                            </td>
                          </tr>
                        ))}
                        {referrals.length === 0 && <EmptyRow cols={6} msg="No referrals yet" />}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ SETTINGS ══════════════ */}
            {tab === 'settings' && (
              <div className="max-w-2xl space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-brand-500" /> Platform Configuration
                  </h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Admin Email',       value: user.email,  desc: 'Account that receives admin privileges on signup' },
                      { label: 'Referral Reward',   value: '₦500',      desc: 'Fixed amount per successful referral' },
                      { label: 'Auth Strategy',     value: 'JWT (7d)',   desc: 'Token expires after 7 days' },
                      { label: 'Storage',           value: 'lowdb (JSON)', desc: 'File-based database at server/db.json' },
                    ].map(({ label, value, desc }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                        </div>
                        <span className="text-sm font-mono text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg shrink-0">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <div className="flex gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Danger Zone</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Destructive operations (bulk delete, DB reset) are not exposed through the UI to prevent accidental data loss. Use the server CLI directly if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-brand-500" /> Full Activity Log
                  </h2>
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto no-scrollbar">
                    {activity.map(ev => (
                      <div key={ev.id + ev.type} className="flex items-start gap-3">
                        <ActivityIcon type={ev.type} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-700 font-medium truncate">{ev.label}</p>
                          <p className="text-xs text-slate-400 truncate">{ev.sub}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 pt-0.5">{rel(ev.at)}</span>
                      </div>
                    ))}
                    {activity.length === 0 && <p className="text-sm text-slate-400">No activity recorded yet.</p>}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
