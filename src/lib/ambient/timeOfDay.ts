import type { TimePeriod } from '../../types/ambient';

/** Hour 0–24 fractional from local clock */
export function getLocalHour(now = new Date()): number {
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

const PERIOD_ORDER: TimePeriod[] = ['night', 'dawn', 'day', 'dusk'];

const BLEND_SEGMENTS: { from: TimePeriod; to: TimePeriod; start: number; end: number }[] = [
  { from: 'night', to: 'dawn', start: 0, end: 5.5 },
  { from: 'dawn', to: 'day', start: 5.5, end: 8 },
  { from: 'day', to: 'dusk', start: 8, end: 17 },
  { from: 'dusk', to: 'night', start: 17, end: 21 },
  { from: 'night', to: 'night', start: 21, end: 24 },
];

export function resolveTimePeriod(hour: number): TimePeriod {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 21 || h < 5.5) return 'night';
  if (h < 8) return 'dawn';
  if (h < 17) return 'day';
  return 'dusk';
}

/** Blend between two periods for smooth transitions. Returns [from, to, t]. */
export function getPeriodBlend(hour: number): {
  from: TimePeriod;
  to: TimePeriod;
  t: number;
} {
  const h = ((hour % 24) + 24) % 24;

  for (const seg of BLEND_SEGMENTS) {
    if (h >= seg.start && h < seg.end) {
      const span = seg.end - seg.start;
      const t = span > 0 ? (h - seg.start) / span : 0;
      return { from: seg.from, to: seg.to, t: easeInOutCubic(t) };
    }
  }

  return { from: 'night', to: 'night', t: 0 };
}

/** Human-readable local time from the device clock */
export function formatLocalTime(now = new Date()): string {
  return now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function periodLabel(period: TimePeriod): string {
  switch (period) {
    case 'night':
      return 'Night';
    case 'dawn':
      return 'Sunrise';
    case 'day':
      return 'Day';
    case 'dusk':
      return 'Sunset';
  }
}

export { PERIOD_ORDER };
