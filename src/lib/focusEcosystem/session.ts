import {
  clampVitality,
  dayKey,
  growthPercent,
  growthScaleFromMinutes,
  vitalityDelta,
  weekKey,
} from './growth';
import type {
  FocusEcosystemState,
  FocusSessionOutcome,
  ForestTree,
} from '../../types';

export function finalizeFocusSession(
  state: FocusEcosystemState,
  outcome: FocusSessionOutcome,
  elapsedSeconds: number,
): FocusEcosystemState {
  const sapling = state.activeSapling;
  if (!sapling) return state;

  const growth =
    outcome === 'completed'
      ? 100
      : growthPercent(elapsedSeconds, sapling.plannedMinutes);
  const actualMinutes = Math.max(outcome === 'completed' ? 1 : 0, Math.round(elapsedSeconds / 60));
  const endedAt = new Date().toISOString();
  const day = dayKey();
  const week = weekKey();

  const session = {
    id: sapling.sessionId,
    startedAt: sapling.startedAt,
    endedAt,
    plannedMinutes: sapling.plannedMinutes,
    actualMinutes,
    outcome,
    growthPercent: growth,
    species: sapling.species,
  };

  let trees = state.trees;
  if (outcome === 'completed' && growth >= 100) {
    const tree: ForestTree = {
      id: `tree-${Date.now()}`,
      species: sapling.species,
      plantedAt: endedAt,
      durationMinutes: actualMinutes,
      growthScale: growthScaleFromMinutes(actualMinutes, sapling.plannedMinutes),
      health: 'thriving',
      sessionId: sapling.sessionId,
    };
    trees = [...trees.filter((t) => t.sessionId !== sapling.sessionId), tree].slice(-24);
  }

  const minutesCredit = outcome === 'completed' ? actualMinutes : 0;

  return {
    ...state,
    trees,
    sessions: [...state.sessions, session].slice(-60),
    dailyMinutes: {
      ...state.dailyMinutes,
      [day]: (state.dailyMinutes[day] ?? 0) + minutesCredit,
    },
    weeklyMinutes: {
      ...state.weeklyMinutes,
      [week]: (state.weeklyMinutes[week] ?? 0) + minutesCredit,
    },
    ecosystemVitality: clampVitality(state.ecosystemVitality + vitalityDelta(outcome, growth)),
    activeSapling: null,
  };
}
