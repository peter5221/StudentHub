import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

/**
 * PagePreloader — full-screen animated splash shown on first app load.
 * Pass `show={false}` to fade it out once the app is ready.
 */
export default function PagePreloader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f5f3ff 100%)',
          }}
        >
          {/* Logo pulse */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="flex flex-col items-center gap-5"
          >
            {/* Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center shadow-2xl shadow-brand-500/40">
                <GraduationCap size={48} className="text-white" />
              </div>
              {/* Ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-3xl border-2 border-brand-400/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Brand name */}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-display font-bold text-4xl gradient-text"
              >
                StudentHub
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-slate-500 text-sm mt-1"
              >
                Campus Marketplace &amp; Rentals
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden mt-2"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-brand-400 to-purple-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

