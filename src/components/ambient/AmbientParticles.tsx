import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
}

function seededParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const r = s - Math.floor(s);
    const s2 = Math.sin((i + 1) * 269.5) * 43758.5453;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin((i + 2) * 419.2) * 43758.5453;
    const r3 = s3 - Math.floor(s3);
    const s4 = Math.sin((i + 3) * 73.13) * 43758.5453;
    const r4 = s4 - Math.floor(s4);
    return {
      id: i,
      x: r * 100,
      y: r2 * 100,
      size: 2 + r3 * 3,
      delay: r * 8,
      duration: 12 + r2 * 14,
      driftX: 4 + r4 * 10,
      driftY: 18 + r3 * 22,
    };
  });
}

interface AmbientParticlesProps {
  animate: boolean;
  intensity: 'soft' | 'normal';
  isDark: boolean;
}

export function AmbientParticles({ animate, intensity, isDark }: AmbientParticlesProps) {
  const count = intensity === 'soft' ? 18 : 28;
  const particles = useMemo(() => seededParticles(count), [count]);
  const color = isDark ? 'rgba(186, 230, 252, 0.75)' : 'rgba(71, 85, 105, 0.5)';

  return (
    <div className="ambient-particles absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className={animate ? 'ambient-particle' : 'ambient-particle ambient-particle--static'}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: isDark ? `0 0 ${p.size * 2}px ${color}` : undefined,
            ['--particle-delay' as string]: `${p.delay}s`,
            ['--particle-duration' as string]: `${p.duration}s`,
            ['--particle-drift-x' as string]: `${p.driftX}px`,
            ['--particle-drift-y' as string]: `${p.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}
