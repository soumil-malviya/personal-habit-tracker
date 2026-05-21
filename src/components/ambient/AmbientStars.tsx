import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
}

function buildStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin(i * 78.233) * 43758.5453;
    const b = Math.sin(i * 12.9898) * 43758.5453;
    const c = Math.sin(i * 39.425) * 43758.5453;
    return {
      id: i,
      x: (a - Math.floor(a)) * 100,
      y: (b - Math.floor(b)) * 55,
      r: 0.8 + (c - Math.floor(c)) * 1.4,
      delay: (a - Math.floor(a)) * 6,
    };
  });
}

interface AmbientStarsProps {
  animate: boolean;
}

export function AmbientStars({ animate }: AmbientStarsProps) {
  const stars = useMemo(() => buildStars(52), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-[75%]" preserveAspectRatio="none">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="rgba(186, 230, 252, 0.65)"
            className={animate ? 'ambient-star' : undefined}
            style={animate ? { animationDelay: `${s.delay}s` } : { opacity: 0.4 }}
          />
        ))}
      </svg>
    </div>
  );
}
