import type { TreeHealth, TreeSpecies } from '../../types';

const SPECIES: TreeSpecies[] = ['pine', 'oak', 'birch', 'maple'];

export function pickSpecies(seed: number): TreeSpecies {
  return SPECIES[Math.abs(seed) % SPECIES.length];
}

/** 0.45–1.15 visual scale from session length (longer focus → larger tree). */
export function growthScaleFromMinutes(actualMinutes: number, plannedMinutes: number): number {
  const ratio = plannedMinutes > 0 ? actualMinutes / plannedMinutes : 1;
  const base = 0.45 + Math.min(ratio, 1.15) * 0.55;
  return Math.round(base * 100) / 100;
}

export function growthPercent(elapsedSeconds: number, plannedMinutes: number): number {
  const total = plannedMinutes * 60;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((elapsedSeconds / total) * 100));
}

export function vitalityDelta(outcome: 'completed' | 'abandoned' | 'paused', growth: number): number {
  if (outcome === 'completed') return 3 + Math.floor(growth / 25);
  if (outcome === 'abandoned') return growth > 20 ? -6 : -2;
  return 0;
}

export function clampVitality(v: number): number {
  return Math.max(12, Math.min(100, v));
}

export function healthFromGrowth(growth: number, isPaused: boolean): TreeHealth {
  if (isPaused && growth > 0) return 'wilting';
  if (growth >= 85) return 'thriving';
  if (growth >= 40) return 'stable';
  if (growth > 0) return 'wilting';
  return 'dormant';
}

export function weekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function hashToUnit(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return (Math.abs(h) % 1000) / 1000;
}
