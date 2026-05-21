import { useEffect, useMemo, useState } from 'react';
import { buildAmbientScene } from '../lib/ambient/scene';
import { useAmbientSettings } from './useAmbientSettings';
import { useLocalClock } from './useLocalClock';
import type { ThemeMode } from '../types';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useAmbientScene(theme: ThemeMode) {
  const { settings } = useAmbientSettings();
  const reducedMotion = useReducedMotion();
  const now = useLocalClock({
    enabled: settings.followTimeOfDay,
    intervalMs: 15_000,
  });

  const scene = useMemo(
    () => buildAmbientScene(settings, theme, now),
    [settings, theme, now],
  );

  return {
    settings,
    scene,
    reducedMotion,
    now,
    periodLabel: scene.period,
  };
}
