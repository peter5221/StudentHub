import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using StudentHub ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the Platform. These Terms apply to all users, including browsers, students, sellers, and landlords.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 16 years old and a current or prospective student at a Nigerian educational institution to create an account. By registering, you represent and warrant that you meet these requirements. We reserve the right to verify your student status at any time.`,
  },
  {
    title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use. You may not share your account with others or create multiple accounts. We reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    title: '4. Listings & Content',
    body: `You are solely responsible for all content you post. You agree not to post: counterfeit, stolen, or illegal goods; sexually explicit or offensive material; misleading or fraudulent listings; content that infringes any third-party intellectual property rights; or anything that violates Nigerian law. We reserve the right to remove any listing at our discretion and may ban repeat offenders.`,
  },
  {
    title: '5. Transactions',
    body: `StudentHub is a marketplace platform only. We do not facilitate payments, hold funds, or act as a party to any transaction between buyers and sellers. All transactions are strictly between users. We strongly encourage meeting in safe, public locations on campus and exercising caution with high-value transactions. StudentHub is not liable for any losses arising from transactions.`,
  },
  {
    title: '6. Referral Programme',
    body: `The referral programme pays ₦500 for each new user who signs up using your referral code. Rewards are subject to verification and may be withheld in cases of fraud, self-referral, or manipulation. We reserve the right to modify or discontinue the referral programme at any time without notice.`,
  },
  {
    title: '7. Prohibited Conduct',
    body: `You agree not to: scrape or harvest data from the Platform; use automated bots or scripts; harass, threaten, or abuse other users; attempt to gain unauthorised access to any part of the Platform; or use the Platform for spam or commercial advertising without our consent.`,
  },
  {
    title: '8. Disclaimer of Warranties',
    body: `The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses. StudentHub does not endorse or verify any listing, user, or transaction.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the fullest extent permitted by applicable law, StudentHub, its directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: '10. Modifications to Terms',
    body: `We may update these Terms at any time. We will notify users via email or an in-app notice. Continued use of the Platform after such changes constitutes your acceptance of the new Terms.`,
  },
  {
    title: '11. Governing Law',
    body: `These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.`,
  },
  {
    title: '12. Contact Us',
    body: `If you have any questions about these Terms, please contact us at legal@studenthub.com.ng.`,
  },
];

export default function Terms() {
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl gradient-text">Terms &amp; Conditions</h1>
              <p className="text-slate-400 text-sm mt-0.5">Last updated: November 2024</p>
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Please read these Terms and Conditions carefully before using the StudentHub platform.
            These terms govern your access to and use of our website and services.
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
            <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/signup" className="hover:text-brand-600 transition-colors">Sign Up</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

