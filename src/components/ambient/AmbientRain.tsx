import { useMemo } from 'react';

interface Drop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  height: number;
  tilt: number;
  driftStart: number;
  driftMid: number;
  driftEnd: number;
}

function buildDrops(count: number): Drop[] {
  return Array.from({ length: count }, (_, i) => {
    const r = Math.sin(i * 43.758) * 10000 - Math.floor(Math.sin(i * 43.758) * 10000);
    const r2 = Math.sin(i * 91.173) * 10000 - Math.floor(Math.sin(i * 91.173) * 10000);
    const r3 = Math.sin(i * 17.31) * 10000 - Math.floor(Math.sin(i * 17.31) * 10000);
    const wind = 10 + r * 18;
    const wave = 4 + r2 * 8;
    return {
      id: i,
      x: r * 100,
      delay: r2 * 2.8,
      duration: 0.85 + r * 0.75,
      height: 14 + r2 * 24,
      tilt: -8 - r3 * 8,
      driftStart: -wave,
      driftMid: wind * 0.45 + wave * 0.3,
      driftEnd: wind + wave * 0.6,
    };
  });
}

interface AmbientRainProps {
  animate: boolean;
  isDark: boolean;
}

export function AmbientRain({ animate, isDark }: AmbientRainProps) {
  const drops = useMemo(() => buildDrops(20), []);
  const color = isDark ? 'rgba(186, 230, 252, 0.38)' : 'rgba(71, 85, 105, 0.3)';

  return (
    <div className="ambient-rain absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {drops.map((d) => (
        <span
          key={d.id}
          className={
            animate ? 'ambient-rain-drop' : 'ambient-rain-drop ambient-rain-drop--static'
          }
          style={{
            left: `${d.x}%`,
            height: d.height,
            background: `linear-gradient(to bottom, transparent, ${color} 40%, ${color})`,
            ['--rain-tilt' as string]: `${d.tilt}deg`,
            ['--rain-delay' as string]: `${d.delay}s`,
            ['--rain-duration' as string]: `${d.duration}s`,
            ['--rain-drift-start' as string]: `${d.driftStart}px`,
            ['--rain-drift-mid' as string]: `${d.driftMid}px`,
            ['--rain-drift-end' as string]: `${d.driftEnd}px`,
          }}
        />
      ))}
    </div>
  );
}
