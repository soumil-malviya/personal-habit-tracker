import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotificationPrefs } from '../hooks/useNotificationPrefs';
import { useFocusEcosystem } from '../hooks/useFocusEcosystem';
import { showAppNotification } from '../lib/notifications/display';
import { getPomodoroNotification } from '../lib/notifications/scheduler';
import { Play, Pause, RotateCcw, Settings, Timer } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { FocusEcosystem } from './focus/FocusEcosystem';
import { focusSound } from '../lib/focusEcosystem/sounds';
import type { PomodoroSettings } from '../types';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

type Phase = 'work' | 'break' | 'longBreak' | 'idle';

export function PomodoroTimer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    STORAGE_KEYS.pomodoro,
    DEFAULT_SETTINGS,
  );
  const {
    state: ecosystem,
    stats,
    startWorkSession,
    syncSaplingProgress,
    pauseWork,
    resumeWork,
    completeWork,
    abandonWork,
  } = useFocusEcosystem();

  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const phaseRef = useRef(phase);
  const sessionsRef = useRef(sessionsCompleted);
  const prevPhaseRef = useRef<Phase>(phase);
  const lastAutoStartRef = useRef('');
  const { prefs: notifPrefs } = useNotificationPrefs();

  phaseRef.current = phase;
  sessionsRef.current = sessionsCompleted;

  const getDuration = useCallback(
    (p: Phase) => {
      if (p === 'work') return settings.workMinutes * 60;
      if (p === 'longBreak') return settings.longBreakMinutes * 60;
      if (p === 'break') return settings.breakMinutes * 60;
      return settings.workMinutes * 60;
    },
    [settings],
  );

  const workTotal = settings.workMinutes * 60;
  const elapsedSeconds = phase === 'work' ? workTotal - secondsLeft : 0;

  useEffect(() => {
    if (phase !== 'work') return;
    syncSaplingProgress(elapsedSeconds, !running);
  }, [phase, elapsedSeconds, running, syncSaplingProgress]);

  useEffect(() => {
    focusSound.emit('timer_phase', { phase, running });
  }, [phase, running]);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (prev === phase) return;

    if (prev === 'work' && (phase === 'break' || phase === 'longBreak')) {
      const payload = getPomodoroNotification(notifPrefs, 'work');
      if (payload) void showAppNotification(payload);
    } else if (
      (prev === 'break' || prev === 'longBreak') &&
      phase === 'work' &&
      running
    ) {
      const payload = getPomodoroNotification(
        notifPrefs,
        prev === 'longBreak' ? 'longBreak' : 'break',
      );
      if (payload) void showAppNotification(payload);
    }

    prevPhaseRef.current = phase;
  }, [phase, running, notifPrefs]);

  const resetToPhase = (p: Phase) => {
    setPhase(p);
    setSecondsLeft(getDuration(p === 'idle' ? 'work' : p));
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;

        const currentPhase = phaseRef.current;
        if (currentPhase === 'work') {
          completeWork(workTotal);
          const nextSessions = sessionsRef.current + 1;
          setSessionsCompleted(nextSessions);
          const useLong = nextSessions % settings.sessionsBeforeLongBreak === 0;
          const nextPhase: Phase = useLong ? 'longBreak' : 'break';
          setPhase(nextPhase);
          return getDuration(nextPhase);
        }
        setPhase('work');
        startWorkSession(settings.workMinutes);
        return getDuration('work');
      });
    }, 1000);
    return () => clearInterval(id);
  }, [
    running,
    settings.sessionsBeforeLongBreak,
    settings.workMinutes,
    getDuration,
    completeWork,
    workTotal,
    startWorkSession,
  ]);

  const toggleRun = () => {
    if (phase === 'idle') {
      setPhase('work');
      setSecondsLeft(settings.workMinutes * 60);
      startWorkSession(settings.workMinutes);
      setRunning(true);
      return;
    }

    if (phase === 'work') {
      if (running) {
        pauseWork();
      } else {
        resumeWork();
      }
    }
    setRunning((r) => !r);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') !== 'start') return;
    if (lastAutoStartRef.current === location.key) return;
    lastAutoStartRef.current = location.key;

    if (phaseRef.current === 'idle') {
      setPhase('work');
      setSecondsLeft(settings.workMinutes * 60);
      startWorkSession(settings.workMinutes);
      setRunning(true);
    } else if (phaseRef.current === 'work') {
      resumeWork();
      setRunning(true);
    }

    window.setTimeout(() => {
      navigate('/app/pomodoro', { replace: true });
    }, 80);
  }, [location.key, location.search, navigate, resumeWork, settings.workMinutes, startWorkSession]);

  const handleReset = () => {
    if (phase === 'work' && ecosystem.activeSapling && elapsedSeconds > 0) {
      abandonWork(elapsedSeconds);
    }
    setRunning(false);
    setSessionsCompleted(0);
    resetToPhase('idle');
  };

  const currentGrowth = ecosystem.activeSapling?.growth ?? 0;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = getDuration(phase === 'idle' ? 'work' : phase);
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const phaseLabel =
    phase === 'work'
      ? 'Focus'
      : phase === 'break'
        ? 'Short break'
        : phase === 'longBreak'
          ? 'Long break'
          : 'Ready';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <FocusEcosystem
          state={ecosystem}
          phase={phase}
          isGrowing={running && phase === 'work'}
          stats={stats}
        />

        <div className="p-6 sm:p-8 text-center relative">
          <MotionGlow progress={progress} active={phase === 'work' && running} />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-[var(--accent-primary)]" strokeWidth={1.75} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">
                {phaseLabel}
              </span>
            </div>

            <div className="text-5xl sm:text-6xl font-light tabular-nums tracking-tight text-[var(--text-primary)] my-5 font-display">
              {String(mins).padStart(2, '0')}
              <span className="opacity-40 mx-0.5">:</span>
              {String(secs).padStart(2, '0')}
            </div>

            <p className="text-[10px] text-[var(--text-muted)] mb-6 font-medium tracking-wide">
              Session {sessionsCompleted + 1} · {settings.workMinutes}m focus
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleRun}
                className="px-7 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-900/25 active:scale-[0.98] transition-all"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : phase === 'idle' ? 'Begin focus' : 'Resume'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-3 rounded-2xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-all"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSettings((s) => !s)}
                className={`p-3 rounded-2xl border transition-all ${
                  showSettings
                    ? 'bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-[var(--border-light)] text-[var(--text-secondary)]'
                }`}
                aria-label="Timer settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {phase === 'work' && !running && currentGrowth > 0 && currentGrowth < 100 && (
        <p className="text-center text-[11px] text-[var(--state-warning)] font-medium leading-relaxed max-w-sm mx-auto">
          Paused — growth rests with you. Finish the session to plant this tree in your grove.
        </p>
      )}

      {phase === 'work' && !running && currentGrowth === 0 && ecosystem.activeSapling && (
        <p className="text-center text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
          Your sapling is ready. Press resume when you return.
        </p>
      )}

      {showSettings && (
        <form
          className="glass-panel p-5 rounded-2xl animate-entrance space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setShowSettings(false);
            if (!running && phase === 'idle') {
              setSecondsLeft(settings.workMinutes * 60);
            }
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)]">
            Interval settings
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">
                Work (min)
              </span>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.workMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    workMinutes: Math.max(1, Number(e.target.value) || 25),
                  }))
                }
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">
                Break (min)
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.breakMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    breakMinutes: Math.max(1, Number(e.target.value) || 5),
                  }))
                }
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">
                Long break (min)
              </span>
              <input
                type="number"
                min={1}
                max={45}
                value={settings.longBreakMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    longBreakMinutes: Math.max(1, Number(e.target.value) || 15),
                  }))
                }
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">
                Sessions before long
              </span>
              <input
                type="number"
                min={2}
                max={8}
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    sessionsBeforeLongBreak: Math.max(2, Number(e.target.value) || 4),
                  }))
                }
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-bold rounded-xl"
          >
            Save settings
          </button>
        </form>
      )}
    </div>
  );
}

function MotionGlow({ progress, active }: { progress: number; active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]"
      style={{
        opacity: active ? 0.35 : 0.12,
        background: `radial-gradient(ellipse 80% 60% at 50% 80%, rgba(34, 211, 238, ${0.08 + (progress / 100) * 0.12}) 0%, transparent 70%)`,
      }}
    />
  );
}
