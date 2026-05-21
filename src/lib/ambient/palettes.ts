import type { AmbientPalette, TimePeriod } from '../../types/ambient';
import type { ThemeMode } from '../../types';

type PaletteMap = Record<TimePeriod, AmbientPalette>;

const DARK: PaletteMap = {
  night: {
    base: '#030408',
    orbA: 'rgba(45, 85, 130, 0.5)',
    orbB: 'rgba(20, 55, 75, 0.55)',
    orbC: 'rgba(8, 145, 178, 0.22)',
    vignette: 'rgba(0, 0, 0, 0.4)',
  },
  dawn: {
    base: '#0a0c12',
    orbA: 'rgba(251, 191, 136, 0.22)',
    orbB: 'rgba(34, 211, 238, 0.18)',
    orbC: 'rgba(94, 129, 172, 0.28)',
    vignette: 'rgba(0, 0, 0, 0.32)',
  },
  day: {
    base: '#06080c',
    orbA: 'rgba(8, 145, 178, 0.28)',
    orbB: 'rgba(22, 78, 99, 0.32)',
    orbC: 'rgba(71, 85, 105, 0.2)',
    vignette: 'rgba(0, 0, 0, 0.28)',
  },
  dusk: {
    base: '#08060a',
    orbA: 'rgba(200, 130, 95, 0.26)',
    orbB: 'rgba(22, 78, 99, 0.35)',
    orbC: 'rgba(99, 102, 241, 0.14)',
    vignette: 'rgba(0, 0, 0, 0.34)',
  },
};

const LIGHT: PaletteMap = {
  night: {
    base: '#e8ecf2',
    orbA: 'rgba(100, 116, 139, 0.22)',
    orbB: 'rgba(148, 163, 184, 0.28)',
    orbC: 'rgba(8, 145, 178, 0.12)',
    vignette: 'rgba(255, 255, 255, 0.18)',
  },
  dawn: {
    base: '#f2ebe6',
    orbA: 'rgba(251, 180, 120, 0.5)',
    orbB: 'rgba(125, 211, 252, 0.45)',
    orbC: 'rgba(226, 232, 240, 0.55)',
    vignette: 'rgba(255, 255, 255, 0.12)',
  },
  day: {
    base: '#eef1f6',
    orbA: 'rgba(125, 211, 252, 0.55)',
    orbB: 'rgba(153, 246, 228, 0.45)',
    orbC: 'rgba(186, 230, 253, 0.35)',
    vignette: 'rgba(255, 255, 255, 0.08)',
  },
  dusk: {
    base: '#ebe8f0',
    orbA: 'rgba(253, 170, 120, 0.42)',
    orbB: 'rgba(165, 180, 252, 0.32)',
    orbC: 'rgba(226, 232, 240, 0.4)',
    vignette: 'rgba(255, 255, 255, 0.1)',
  },
};

export function getPalette(period: TimePeriod, theme: ThemeMode): AmbientPalette {
  return theme === 'dark' ? DARK[period] : LIGHT[period];
}

function parseRgba(color: string): [number, number, number, number] {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return [0, 0, 0, 1];
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 1)];
}

function lerpRgba(a: string, b: string, t: number): string {
  const [r1, g1, b1, al1] = parseRgba(a);
  const [r2, g2, b2, al2] = parseRgba(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  const al = al1 + (al2 - al1) * t;
  return `rgba(${r}, ${g}, ${bl}, ${al.toFixed(3)})`;
}

function lerpHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function blendPalettes(from: AmbientPalette, to: AmbientPalette, t: number): AmbientPalette {
  return {
    base: lerpHex(from.base, to.base, t),
    orbA: lerpRgba(from.orbA, to.orbA, t),
    orbB: lerpRgba(from.orbB, to.orbB, t),
    orbC: lerpRgba(from.orbC, to.orbC, t),
    vignette: lerpRgba(from.vignette, to.vignette, t),
  };
}
