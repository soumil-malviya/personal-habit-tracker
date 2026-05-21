import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_SOUNDSCAPE_SETTINGS } from '../constants/soundscapeDefaults';
import { STORAGE_KEYS } from '../constants/storage';
import { focusSound, type TimerPhasePayload } from '../lib/focusEcosystem/sounds';
import { soundscapeEngine } from '../lib/soundscape/engine';
import type { SoundscapeId, SoundscapePlaybackState, SoundscapeSettings } from '../lib/soundscape/types';
import { getTrack } from '../lib/soundscape/tracks';
import { useLocalStorage } from '../hooks/useLocalStorage';

function mergeSettings(raw: Partial<SoundscapeSettings> | SoundscapeSettings): SoundscapeSettings {
  const trackId =
    raw.trackId && getTrack(raw.trackId as SoundscapeId) ? (raw.trackId as SoundscapeId) : DEFAULT_SOUNDSCAPE_SETTINGS.trackId;

  return {
    ...DEFAULT_SOUNDSCAPE_SETTINGS,
    ...raw,
    trackId,
    volume: typeof raw.volume === 'number' ? Math.max(0, Math.min(1, raw.volume)) : DEFAULT_SOUNDSCAPE_SETTINGS.volume,
    fadeMs: typeof raw.fadeMs === 'number' ? Math.max(200, Math.min(4000, raw.fadeMs)) : DEFAULT_SOUNDSCAPE_SETTINGS.fadeMs,
  };
}

export interface SoundscapeContextValue {
  settings: SoundscapeSettings;
  setSettings: (value: SoundscapeSettings | ((p: SoundscapeSettings) => SoundscapeSettings)) => void;
  playbackState: SoundscapePlaybackState;
  isPlaying: boolean;
  isUnlocked: boolean;
  activeTrackId: SoundscapeId | null;
  unlock: () => Promise<boolean>;
  togglePlay: () => Promise<void>;
  selectTrack: (id: SoundscapeId) => Promise<void>;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

const SoundscapeContext = createContext<SoundscapeContextValue | null>(null);

export function SoundscapeProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useLocalStorage<SoundscapeSettings>(
    STORAGE_KEYS.soundscape,
    DEFAULT_SOUNDSCAPE_SETTINGS,
  );
  const settings = useMemo(() => mergeSettings(raw), [raw]);
  const [playbackState, setPlaybackState] = useState<SoundscapePlaybackState>('idle');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const timerPhaseRef = useRef<TimerPhasePayload>({ phase: 'idle', running: false });

  const setSettings = useCallback(
    (value: SoundscapeSettings | ((p: SoundscapeSettings) => SoundscapeSettings)) => {
      setRaw((prev) => {
        const merged = mergeSettings(prev);
        const next = value instanceof Function ? value(merged) : mergeSettings(value);
        return next;
      });
    },
    [setRaw],
  );

  const syncEnginePrefs = useCallback(() => {
    soundscapeEngine.setFadeMs(settings.fadeMs);
    soundscapeEngine.setVolume(settings.volume);
    soundscapeEngine.setMuted(settings.muted);
  }, [settings.fadeMs, settings.volume, settings.muted]);

  const applyTimerDuck = useCallback(() => {
    if (!settings.syncWithTimer || !settings.enabled) {
      soundscapeEngine.setDuck(1);
      return;
    }
    const { phase, running } = timerPhaseRef.current;
    const onBreak = phase === 'break' || phase === 'longBreak';
    if (settings.duckOnBreak && onBreak) {
      soundscapeEngine.setDuck(0.38);
    } else if (phase === 'idle' && !running) {
      soundscapeEngine.setDuck(0.72);
    } else {
      soundscapeEngine.setDuck(1);
    }
  }, [settings.syncWithTimer, settings.duckOnBreak, settings.enabled]);

  const startPlayback = useCallback(async () => {
    syncEnginePrefs();
    await soundscapeEngine.unlock();
    setIsUnlocked(soundscapeEngine.isUnlocked);
    await soundscapeEngine.play(settings.trackId, settings.volume, settings.fadeMs);
    setPlaybackState('playing');
    applyTimerDuck();
  }, [settings.trackId, settings.volume, settings.fadeMs, syncEnginePrefs, applyTimerDuck]);

  const stopPlayback = useCallback(async () => {
    await soundscapeEngine.stop(settings.fadeMs);
    setPlaybackState(soundscapeEngine.state);
  }, [settings.fadeMs]);

  useEffect(() => {
    syncEnginePrefs();
  }, [syncEnginePrefs]);

  useEffect(() => {
    applyTimerDuck();
  }, [applyTimerDuck]);

  useEffect(() => {
    if (settings.enabled) void startPlayback();
    return () => {
      void soundscapeEngine.stop(400);
      soundscapeEngine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPhase = (payload?: TimerPhasePayload) => {
      if (payload) timerPhaseRef.current = payload;
      applyTimerDuck();
    };
    const unsub = focusSound.on('timer_phase', onPhase);
    return unsub;
  }, [applyTimerDuck]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void soundscapeEngine.resume();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const unlock = useCallback(async () => {
    const ok = await soundscapeEngine.unlock();
    setIsUnlocked(ok);
    return ok;
  }, []);

  const togglePlay = useCallback(async () => {
    await unlock();
    if (settings.enabled && playbackState === 'playing') {
      setSettings((s) => ({ ...s, enabled: false }));
      await stopPlayback();
    } else {
      setSettings((s) => ({ ...s, enabled: true }));
      await startPlayback();
    }
  }, [unlock, settings.enabled, playbackState, setSettings, startPlayback, stopPlayback]);

  const selectTrack = useCallback(
    async (id: SoundscapeId) => {
      await unlock();
      setSettings((s) => ({ ...s, trackId: id, enabled: true }));
      syncEnginePrefs();
      await soundscapeEngine.crossfadeTo(id, settings.fadeMs);
      setPlaybackState('playing');
      applyTimerDuck();
    },
    [unlock, setSettings, syncEnginePrefs, settings.fadeMs, applyTimerDuck],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const v = Math.max(0, Math.min(1, volume));
      setSettings((s) => ({ ...s, volume: v }));
      soundscapeEngine.setVolume(v);
    },
    [setSettings],
  );

  const setMuted = useCallback(
    (muted: boolean) => {
      setSettings((s) => ({ ...s, muted }));
      soundscapeEngine.setMuted(muted);
    },
    [setSettings],
  );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      playbackState,
      isPlaying: settings.enabled && playbackState === 'playing',
      isUnlocked,
      activeTrackId: soundscapeEngine.trackId,
      unlock,
      togglePlay,
      selectTrack,
      setVolume,
      setMuted,
    }),
    [
      settings,
      setSettings,
      playbackState,
      isUnlocked,
      unlock,
      togglePlay,
      selectTrack,
      setVolume,
      setMuted,
    ],
  );

  return <SoundscapeContext.Provider value={value}>{children}</SoundscapeContext.Provider>;
}

export function useSoundscapeContext(): SoundscapeContextValue {
  const ctx = useContext(SoundscapeContext);
  if (!ctx) throw new Error('useSoundscapeContext must be used within SoundscapeProvider');
  return ctx;
}
