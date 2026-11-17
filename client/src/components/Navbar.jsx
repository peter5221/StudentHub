import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { GraduationCap, Home, Plus, MessageCircle, User, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', icon: Home, label: 'Explore' },
  { to: '/post', icon: Plus, label: 'Post' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card rounded-none border-x-0 border-t-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">StudentHub</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                        ? 'bg-brand-500/20 text-brand-300'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/6'
                      }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              {user.is_admin ? (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${location.pathname === '/admin'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                      : 'text-brand-600 hover:text-brand-700 hover:bg-brand-50/80 border border-transparent'
                    }`}
                >
                  <ShieldCheck size={16} className="text-brand-600" />
                  Admin Dashboard
                </Link>
              ) : null}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                    <span className="text-xs text-slate-400">{user.state || user.city || 'Unknown location'}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut size={15} />
                    <span className="text-xs">Logout</span>
                  </button>
                </div>
                {/* Mobile menu toggle */}
                <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/landing" className="btn-ghost py-2 px-3 text-sm hidden md:inline-flex">About</Link>
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-card rounded-none border-x-0 border-t-0 px-4 pb-4"
          >
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-all"
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              {user.is_admin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-amber-400 hover:bg-amber-500/10 transition-all">
                  <ShieldCheck size={18} />
                  Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all text-left">
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
