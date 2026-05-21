/** Sound-ready event bus — wire Web Audio / Howler later without touching UI. */

export type FocusSoundEvent =
  | 'session_start'
  | 'session_pause'
  | 'session_resume'
  | 'growth_milestone'
  | 'session_complete'
  | 'session_abandon'
  | 'ambient_breath'
  | 'timer_phase';

export interface TimerPhasePayload {
  phase: 'work' | 'break' | 'longBreak' | 'idle';
  running: boolean;
}

export type FocusSoundPayload = {
  growth?: number;
  species?: string;
} & Partial<TimerPhasePayload>;

type Listener = (payload?: FocusSoundPayload) => void;

const listeners = new Map<FocusSoundEvent, Set<Listener>>();

export const focusSound = {
  on(event: FocusSoundEvent, fn: Listener) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(fn);
    return () => listeners.get(event)?.delete(fn);
  },
  emit(event: FocusSoundEvent, payload?: FocusSoundPayload) {
    listeners.get(event)?.forEach((fn) => fn(payload));
  },
};
