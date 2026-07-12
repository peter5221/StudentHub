import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, MapPin, Loader } from 'lucide-react';

export default function LoginSignup({ mode = 'login' }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', refCode,
    state: '', city: '', address: '',
  });

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-brand-500/30">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl gradient-text">StudentHub</h1>
          <p className="text-slate-400 text-sm mt-1">Campus Marketplace & Rentals Platform</p>
        </div>

        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="input-label">Full Name</label>
                <input className="input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            )}

            <div>
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="student@university.edu" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="input-label">Confirm Password</label>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>

                <div className="divider" />
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={13} className="text-brand-400 flex-shrink-0" />
                  Location is detected automatically after signup. You can also fill it in below.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">State</label>
                    <input className="input" type="text" placeholder="e.g. Lagos" value={form.state} onChange={set('state')} />
                  </div>
                  <div>
                    <label className="input-label">City</label>
                    <input className="input" type="text" placeholder="e.g. Ikeja" value={form.city} onChange={set('city')} />
                  </div>
                </div>

                <div>
                  <label className="input-label">Referral Code (optional)</label>
                  <input className="input" type="text" placeholder="Enter referral code" value={form.refCode} onChange={set('refCode')} />
                </div>
              </>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-2">
              {loading ? (
                <><Loader size={16} className="animate-spin-slow" /> Processing...</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By signing up you agree to our{' '}
          <span className="text-brand-400 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-brand-400 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
