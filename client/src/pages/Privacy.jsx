import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Lock } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    body: `When you create an account, we collect your name, email address, password (hashed), and optional location data (state/city). When you post a listing, we collect listing details and any uploaded images. We may also automatically collect device information, browser type, IP address, and usage data to improve our services.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to: provide and operate the StudentHub platform; personalise your experience and show location-relevant listings; send important service notifications; process referral rewards; detect and prevent fraud or abuse; comply with legal obligations; and improve the Platform through anonymised analytics.`,
  },
  {
    title: '3. Data Sharing',
    body: `We do not sell your personal data. We may share limited data with: trusted service providers (e.g. cloud hosting, email delivery) under strict data processing agreements; law enforcement or regulatory authorities when required by law; and other users to the extent necessary (e.g. your display name and state appearing on your listings). We will never share your email address or contact details without your consent.`,
  },
  {
    title: '4. Location Data',
    body: `We collect your approximate location (state and city) to filter listings relevant to your area. Location is captured automatically via your browser's geolocation API or estimated via your IP address. You can decline geolocation permission — the Platform will still work, but listing results may be less relevant. You can update your location at any time from your profile.`,
  },
  {
    title: '5. Cookies & Tracking',
    body: `We use essential cookies to maintain your login session and remember your preferences. We do not use third-party advertising cookies or tracking pixels. You can disable cookies in your browser settings, but this may affect Platform functionality.`,
  },
  {
    title: '6. Data Security',
    body: `We implement industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), JWT authentication, and rate limiting on sensitive endpoints. However, no system is 100% secure. We encourage you to use a strong, unique password and to log out from shared devices.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or legitimate business reasons. Anonymised, aggregated data may be retained indefinitely for analytics purposes.`,
  },
  {
    title: '8. Your Rights',
    body: `You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your account and personal data; withdraw consent where processing is based on consent; and lodge a complaint with the Nigeria Data Protection Commission (NDPC). To exercise any of these rights, email us at privacy@studenthub.com.ng.`,
  },
  {
    title: '9. Children\'s Privacy',
    body: `StudentHub is not intended for children under 16. We do not knowingly collect personal data from children. If we become aware that a child under 16 has provided us with personal data, we will delete it promptly.`,
  },
  {
    title: '10. Third-party Links',
    body: `The Platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies before providing any personal information.`,
  },
  {
    title: '11. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you via email or an in-app notice before changes take effect. Your continued use of the Platform after the effective date constitutes your acceptance of the updated Policy.`,
  },
  {
    title: '12. Contact & Data Controller',
    body: `StudentHub is the data controller for the purposes of the Nigeria Data Protection Act 2023. For privacy-related questions, contact our Data Protection Officer at: privacy@studenthub.com.ng.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/landing" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-brand-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Lock size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl gradient-text">Privacy Policy</h1>
              <p className="text-slate-400 text-sm mt-0.5">Last updated: November 2024</p>
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Your privacy matters to us. This Privacy Policy explains how StudentHub collects, uses,
            and protects your personal information when you use our platform. We comply with the
            <strong className="text-slate-700"> Nigeria Data Protection Act (NDPA) 2023</strong>.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="font-display font-semibold text-slate-800 text-lg mb-3">{s.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold gradient-text">StudentHub</span>
          </div>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/signup" className="hover:text-brand-600 transition-colors">Sign Up</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

