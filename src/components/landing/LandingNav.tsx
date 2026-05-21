import { motion } from 'motion/react';
import { Compass, Moon, Sun } from 'lucide-react';
import { BRAND } from '../../constants/brand';

interface LandingNavProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGetStarted: () => void;
  isReturning: boolean;
}

export function LandingNav({ theme, onToggleTheme, onGetStarted, isReturning }: LandingNavProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4 sm:pt-5"
    >
      <nav
        className="landing-glass max-w-5xl mx-auto rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-4"
        aria-label="Landing"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600/90 to-teal-800 flex items-center justify-center shadow-lg shadow-cyan-500/15 shrink-0">
            <Compass className="w-4 h-4 text-cyan-50" strokeWidth={2.25} />
          </div>
          <span className="font-semibold text-sm tracking-tight truncate">{BRAND.name}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-colors"
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 hover:bg-cyan-500 transition-colors"
          >
            {isReturning ? 'Continue' : 'Get Started'}
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
}
