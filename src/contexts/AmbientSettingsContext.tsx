import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { DEFAULT_AMBIENT_SETTINGS } from '../constants/ambientDefaults';
import type { AmbientSettings, TimePeriod } from '../types/ambient';

const PERIODS: TimePeriod[] = ['night', 'dawn', 'day', 'dusk'];

function mergeSettings(raw: Partial<AmbientSettings> | AmbientSettings): AmbientSettings {
  const manualPeriod = PERIODS.includes(raw.manualPeriod as TimePeriod)
    ? (raw.manualPeriod as TimePeriod)
    : DEFAULT_AMBIENT_SETTINGS.manualPeriod;

  return {
    ...DEFAULT_AMBIENT_SETTINGS,
    ...raw,
    enabled: raw.enabled !== false,
    followTimeOfDay: raw.followTimeOfDay !== false,
    manualPeriod,
  };
}

interface AmbientSettingsContextValue {
  settings: AmbientSettings;
  setSettings: (value: AmbientSettings | ((p: AmbientSettings) => AmbientSettings)) => void;
}

const AmbientSettingsContext = createContext<AmbientSettingsContextValue | null>(null);

export function AmbientSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useLocalStorage<AmbientSettings>(
    STORAGE_KEYS.ambient,
    DEFAULT_AMBIENT_SETTINGS,
  );

  const settings = useMemo(() => mergeSettings(raw), [raw]);

  const setSettings = useCallback(
    (value: AmbientSettings | ((p: AmbientSettings) => AmbientSettings)) => {
      setRaw((prev) => {
        const merged = mergeSettings(prev);
        const next = value instanceof Function ? value(merged) : mergeSettings(value);
        return next;
      });
    },
    [setRaw],
  );

  return (
    <AmbientSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </AmbientSettingsContext.Provider>
  );
}

export function useAmbientSettingsContext(): AmbientSettingsContextValue {
  const ctx = useContext(AmbientSettingsContext);
  if (!ctx) {
    throw new Error('useAmbientSettingsContext must be used within AmbientSettingsProvider');
  }
  return ctx;
}
