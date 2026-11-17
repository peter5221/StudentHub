import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, ShoppingBag, Home, MessageCircle, Users,
  ArrowRight, CheckCircle2, Star, Zap, Shield, Globe,
  BookOpen, Briefcase, Package
} from 'lucide-react';

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

const stagger = (i) => fadeUp(i * 0.1);

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: ShoppingBag,
    color: 'from-brand-400 to-brand-600',
    title: 'Campus Marketplace',
    desc: 'Buy and sell used textbooks, gadgets, clothes, and more — right within your campus community.',
  },
  {
    icon: Home,
    color: 'from-purple-400 to-purple-600',
    title: 'Student Rentals',
    desc: 'Find affordable off-campus housing, shared apartments, and hostel listings close to your school.',
  },
  {
    icon: MessageCircle,
    color: 'from-emerald-400 to-emerald-600',
    title: 'Real-time Chat',
    desc: 'Message sellers and landlords instantly with our built-in chat — no need to share your phone number.',
  },
  {
    icon: Users,
    color: 'from-amber-400 to-orange-500',
    title: 'Referral Rewards',
    desc: 'Earn ₦500 for every friend you invite who joins the platform. The more you share, the more you earn.',
  },
  {
    icon: Globe,
    color: 'from-sky-400 to-blue-600',
    title: 'Location-aware',
    desc: "Listings are auto-filtered by your state and city so you only see what's near you.",
  },
  {
    icon: Shield,
    color: 'from-rose-400 to-red-600',
    title: 'Safe & Moderated',
    desc: 'Every listing is reviewed by our admin team. Suspicious accounts and posts are flagged and removed.',
  },
];

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up for free in under 60 seconds using your student email.' },
  { n: '02', title: 'Browse or post', desc: 'Explore thousands of listings or post your own item/room in minutes.' },
  { n: '03', title: 'Chat & close the deal', desc: 'Message directly with the other party and arrange a meetup on campus.' },
];

const categories = [
  { icon: BookOpen, label: 'Textbooks' },
  { icon: Package, label: 'Electronics' },
  { icon: Briefcase, label: 'Services' },
  { icon: Home, label: 'Housing' },
  { icon: ShoppingBag, label: 'Clothing' },
  { icon: Zap, label: 'Accessories' },
];

const stats = [
  { value: '10,000+', label: 'Students registered' },
  { value: '5,000+', label: 'Active listings' },
  { value: '30+', label: 'Nigerian states covered' },
  { value: '₦2M+', label: 'Referral rewards paid' },
];

const testimonials = [
  {
    name: 'Chidi O.',
    school: 'University of Lagos',
    text: 'I sold my old laptop in two hours! StudentHub is literally the best thing to happen to campus life.',
    stars: 5,
  },
  {
    name: 'Amaka N.',
    school: 'Covenant University',
    text: 'Found my current apartment through StudentHub. Super affordable and close to school. 10/10.',
    stars: 5,
  },
  {
    name: 'Femi A.',
    school: 'OAU Ile-Ife',
    text: "I've earned over ₦4,500 just from referrals. The platform actually pays you for spreading the word.",
    stars: 5,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-400/10 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-700 border border-brand-200 bg-brand-50 mb-6">
            <Zap size={12} className="text-brand-500" />
            Nigeria's #1 Campus Marketplace
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-tight text-slate-900 mb-6">
            Buy, Sell &amp; Rent{' '}
            <span className="gradient-text">on Campus</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            StudentHub connects Nigerian students to buy &amp; sell second-hand goods,
            find affordable housing, and earn rewards — all in one place.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-base">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 py-4 px-8 text-base">
              Sign In
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p {...fadeUp(0.4)} className="mt-8 text-sm text-slate-400">
            Join over <span className="font-semibold text-slate-600">10,000 students</span> already using StudentHub
          </motion.p>
        </div>

        {/* Hero mockup card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-3xl mx-auto mt-16"
        >
          <div className="glass-card p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'iPhone 13 (used)', price: '₦180,000', badge: 'Electronics', color: 'badge-blue' },
                { label: 'Room in Surulere', price: '₦45,000/mo', badge: 'Housing', color: 'badge-purple' },
                { label: 'Engineering textbooks', price: '₦3,500', badge: 'Books', color: 'badge-green' },
                { label: 'HP Laptop 11th Gen', price: '₦250,000', badge: 'Electronics', color: 'badge-blue' },
                { label: '2-bedroom apartment', price: '₦80,000/mo', badge: 'Housing', color: 'badge-purple' },
                { label: 'Nike Air Force 1', price: '₦12,000', badge: 'Clothing', color: 'badge-amber' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...stagger(i)}
                  className="glass-card-hover p-4 rounded-xl cursor-pointer"
                >
                  <div className={`${item.color} mb-2 self-start`}>{item.badge}</div>
                  <p className="text-sm font-semibold text-slate-700 leading-snug">{item.label}</p>
                  <p className="text-brand-600 font-bold text-sm mt-1">{item.price}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-500 to-purple-600">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((s, i) => (
            <motion.div key={i} {...stagger(i)}>
              <p className="font-display font-extrabold text-3xl md:text-4xl">{s.value}</p>
              <p className="text-brand-100 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <h2 className="section-title text-4xl mb-3">Everything students need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">One platform for all your campus buying, selling, and renting needs.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} {...stagger(i)} className="glass-card-hover p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50/80">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 {...fadeUp()} className="section-title text-3xl mb-10">Browse by category</motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((c, i) => (
              <motion.div key={i} {...stagger(i)}>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-5 py-3 glass-card-hover rounded-full text-sm font-medium text-slate-700"
                >
                  <c.icon size={16} className="text-brand-500" />
                  {c.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <h2 className="section-title text-4xl mb-3">How it works</h2>
            <p className="text-slate-500">Start in 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-200 via-purple-200 to-transparent" />

            {steps.map((s, i) => (
              <motion.div key={i} {...stagger(i)} className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <span className="font-display font-extrabold text-2xl gradient-text">{s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50/80">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="section-title text-4xl mb-3">What students say</h2>
            <p className="text-slate-500">Real stories from our community</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...stagger(i)} className="glass-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.school}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4" id="about">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="glass-card p-10 md:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/30">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h2 className="section-title text-4xl mb-5">About StudentHub</h2>
            <p className="text-slate-500 leading-relaxed mb-5 max-w-2xl mx-auto">
              StudentHub was built by students, for students. We know the struggles of campus life —
              overpriced textbooks, expensive housing, and no trusted place to sell your old stuff.
              So we built one.
            </p>
            <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Our mission is to empower Nigerian students with a safe, affordable, and community-driven
              marketplace that grows with them from 100 Level to graduation. Whether you're looking for
              a place to stay, a buyer for your old laptop, or just want to earn some extra cash —
              StudentHub has you covered.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {['Founded in 2024', 'Nigerian-owned', 'Student-first', 'Free to use'].map((tag) => (
                <span key={tag} className="badge badge-blue">{tag}</span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {[
                { icon: CheckCircle2, text: 'No hidden fees' },
                { icon: CheckCircle2, text: 'Moderated listings' },
                { icon: CheckCircle2, text: 'Instant messaging' },
                { icon: CheckCircle2, text: 'Referral rewards' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon size={15} className="text-brand-500" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 mb-5 leading-tight">
            Ready to join your<br />
            <span className="gradient-text">campus community?</span>
          </h2>
          <p className="text-slate-500 mb-8">Sign up free today and start buying, selling, or renting in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-base">
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 py-4 px-8 text-base">
              Already have an account
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-brand-500 hover:underline">Terms &amp; Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t py-10 px-4" style={{ borderColor: 'rgba(15,23,42,0.07)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">StudentHub</span>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link to="/landing#about" className="hover:text-brand-600 transition-colors">About</Link>
            <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-brand-600 transition-colors">Sign Up</Link>
          </nav>

          <p className="text-xs text-slate-400">© {new Date().getFullYear()} StudentHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

