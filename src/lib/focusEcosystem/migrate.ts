import { DEFAULT_ECOSYSTEM } from '../../constants/focusEcosystemDefaults';
import type { FocusEcosystemState, ForestTree, TreeSpecies } from '../../types';

function isSpecies(v: unknown): v is TreeSpecies {
  return v === 'pine' || v === 'oak' || v === 'birch' || v === 'maple';
}

function normalizeTree(raw: Record<string, unknown>, index: number): ForestTree {
  const id = typeof raw.id === 'string' ? raw.id : `tree-migrated-${index}`;
  return {
    id,
    species: isSpecies(raw.species) ? raw.species : 'pine',
    plantedAt: typeof raw.plantedAt === 'string' ? raw.plantedAt : new Date().toISOString(),
    durationMinutes: typeof raw.durationMinutes === 'number' ? raw.durationMinutes : 25,
    growthScale:
      typeof raw.growthScale === 'number' ? raw.growthScale : growthScaleFallback(raw.durationMinutes),
    health:
      raw.health === 'thriving' ||
      raw.health === 'stable' ||
      raw.health === 'wilting' ||
      raw.health === 'dormant'
        ? raw.health
        : 'stable',
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : id,
  };
}

function growthScaleFallback(minutes: unknown): number {
  const m = typeof minutes === 'number' ? minutes : 25;
  return Math.min(1.1, 0.5 + m / 50);
}

export function parseFocusEcosystem(raw: unknown): FocusEcosystemState {
  if (!raw) return { ...DEFAULT_ECOSYSTEM };

  if (Array.isArray(raw)) {
    const trees = raw.map((item, i) =>
      normalizeTree(item as Record<string, unknown>, i),
    );
    return {
      ...DEFAULT_ECOSYSTEM,
      trees,
      ecosystemVitality: clampVitalityFromTrees(trees.length),
    };
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const trees = Array.isArray(obj.trees)
      ? obj.trees.map((t, i) => normalizeTree(t as Record<string, unknown>, i))
      : [];

    return {
      trees,
      sessions: Array.isArray(obj.sessions) ? (obj.sessions as FocusEcosystemState['sessions']) : [],
      dailyMinutes:
        obj.dailyMinutes && typeof obj.dailyMinutes === 'object'
          ? (obj.dailyMinutes as Record<string, number>)
          : {},
      weeklyMinutes:
        obj.weeklyMinutes && typeof obj.weeklyMinutes === 'object'
          ? (obj.weeklyMinutes as Record<string, number>)
          : {},
      ecosystemVitality:
        typeof obj.ecosystemVitality === 'number'
          ? Math.max(12, Math.min(100, obj.ecosystemVitality))
          : clampVitalityFromTrees(trees.length),
      activeSapling:
        obj.activeSapling && typeof obj.activeSapling === 'object'
          ? (obj.activeSapling as FocusEcosystemState['activeSapling'])
          : null,
    };
  }

  return { ...DEFAULT_ECOSYSTEM };
}

function clampVitalityFromTrees(count: number): number {
  return Math.max(40, Math.min(88, 55 + count * 3));
}
