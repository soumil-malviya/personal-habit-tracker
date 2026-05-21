import { motion } from 'motion/react';

interface AmbientLayersProps {
  vitality: number;
  isGrowing: boolean;
  phase: 'work' | 'break' | 'longBreak' | 'idle';
}

export function AmbientLayers({ vitality, isGrowing, phase }: AmbientLayersProps) {
  const glow = 0.35 + (vitality / 100) * 0.35;
  const workGlow = phase === 'work' && isGrowing;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'var(--focus-ambient-base)' }} />
      <div className="absolute inset-0" style={{ background: 'var(--focus-ambient-wash)' }} />

      <motion.div
        className="absolute -top-[20%] left-[15%] w-[55%] h-[50%] rounded-full blur-[80px]"
        style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--accent-primary) ${Math.round(glow * 36)}%, transparent) 0%, transparent 70%)` }}
        animate={{
          opacity: workGlow ? [0.5, 0.85, 0.5] : [0.35, 0.5, 0.35],
          scale: workGlow ? [1, 1.08, 1] : [1, 1.03, 1],
        }}
        transition={{ duration: workGlow ? 4 : 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-[10%] right-[5%] w-[45%] h-[40%] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--state-success) ${Math.round(glow * 32)}%, transparent) 0%, transparent 65%)` }}
        animate={{
          x: [0, 12, 0],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-[25%] inset-x-0 h-[40%] opacity-30"
        style={{ background: 'var(--focus-ambient-ground)' }}
        animate={{ opacity: workGlow ? [0.25, 0.4, 0.25] : 0.3 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
