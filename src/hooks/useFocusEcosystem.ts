import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { DEFAULT_ECOSYSTEM } from '../constants/focusEcosystemDefaults';
import { parseFocusEcosystem } from '../lib/focusEcosystem/migrate';
import {
  growthPercent,
  healthFromGrowth,
  pickSpecies,
} from '../lib/focusEcosystem/growth';
import { finalizeFocusSession } from '../lib/focusEcosystem/session';
import { focusSound } from '../lib/focusEcosystem/sounds';
import type { FocusEcosystemState } from '../types';

function mergeState(raw: FocusEcosystemState): FocusEcosystemState {
  return parseFocusEcosystem(raw);
}

export function useFocusEcosystem() {
  const [raw, setRaw] = useLocalStorage<FocusEcosystemState>(
    STORAGE_KEYS.focusEcosystem,
    DEFAULT_ECOSYSTEM,
  );

  const state = useMemo(() => mergeState(raw), [raw]);

  const setState = useCallback(
    (updater: (s: FocusEcosystemState) => FocusEcosystemState) => {
      setRaw((prev) => updater(mergeState(prev)));
    },
    [setRaw],
  );

  useEffect(() => {
    try {
      const legacy = localStorage.getItem(STORAGE_KEYS.forest);
      if (!legacy || state.trees.length > 0) return;
      const parsed = JSON.parse(legacy) as unknown;
      const migrated = parseFocusEcosystem(parsed);
      if (migrated.trees.length > 0) {
        setRaw(migrated);
      }
    } catch {
      /* ignore */
    }
  }, [state.trees.length, setRaw]);

  const startWorkSession = useCallback(
    (plannedMinutes: number) => {
      const sessionId = `session-${Date.now()}`;
      const species = pickSpecies(Date.now() % 997);
      setState((s) => ({
        ...s,
        activeSapling: {
          sessionId,
          species,
          growth: 0,
          health: 'dormant',
          startedAt: new Date().toISOString(),
          plannedMinutes,
          elapsedSeconds: 0,
        },
      }));
      focusSound.emit('session_start', { species });
    },
    [setState],
  );

  const syncSaplingProgress = useCallback(
    (elapsedSeconds: number, isPaused: boolean) => {
      setState((s) => {
        if (!s.activeSapling) return s;
        const growth = growthPercent(elapsedSeconds, s.activeSapling.plannedMinutes);
        return {
          ...s,
          activeSapling: {
            ...s.activeSapling,
            growth,
            health: healthFromGrowth(growth, isPaused),
            elapsedSeconds,
          },
        };
      });
    },
    [setState],
  );

  const pauseWork = useCallback(() => {
    setState((s) => {
      if (!s.activeSapling) return s;
      return {
        ...s,
        activeSapling: { ...s.activeSapling, health: 'wilting' },
      };
    });
    focusSound.emit('session_pause');
  }, [setState]);

  const resumeWork = useCallback(() => {
    setState((s) => {
      if (!s.activeSapling) return s;
      const health = healthFromGrowth(s.activeSapling.growth, false);
      return {
        ...s,
        activeSapling: { ...s.activeSapling, health },
      };
    });
    focusSound.emit('session_resume');
  }, [setState]);

  const completeWork = useCallback(
    (elapsedSeconds: number) => {
      setState((s) => {
        const next = finalizeFocusSession(s, 'completed', elapsedSeconds);
        if (next !== s) focusSound.emit('session_complete');
        return next;
      });
    },
    [setState],
  );

  const abandonWork = useCallback(
    (elapsedSeconds: number) => {
      setState((s) => {
        const next = finalizeFocusSession(s, 'abandoned', elapsedSeconds);
        if (next !== s) focusSound.emit('session_abandon');
        return next;
      });
    },
    [setState],
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const week = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().slice(0, 10);
    })();

    return {
      todayMinutes: state.dailyMinutes[today] ?? 0,
      weekMinutes: state.weeklyMinutes[week] ?? 0,
      treeCount: state.trees.length,
      vitality: state.ecosystemVitality,
      sessionCount: state.sessions.filter((s) => s.outcome === 'completed').length,
    };
  }, [state]);

  return {
    state,
    stats,
    startWorkSession,
    syncSaplingProgress,
    pauseWork,
    resumeWork,
    completeWork,
    abandonWork,
  };
}
