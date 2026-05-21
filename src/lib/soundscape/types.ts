export type SoundscapeId = 'rain' | 'forest' | 'cafe' | 'white_noise';

export type SoundscapeSourceType = 'procedural' | 'file' | 'stream';

export interface SoundscapeSource {
  type: SoundscapeSourceType;
  /** Local path under /public or future stream URL */
  src?: string;
}

export interface SoundscapeTrack {
  id: SoundscapeId;
  label: string;
  description: string;
  primary: SoundscapeSource;
  /** Optional higher-quality local file (falls back to procedural) */
  file?: string;
  /** Reserved for future streaming */
  stream?: string;
}

export interface SoundscapeSettings {
  enabled: boolean;
  trackId: SoundscapeId;
  volume: number;
  muted: boolean;
  /** Fade duration in ms */
  fadeMs: number;
  /** Lower volume during Pomodoro breaks */
  duckOnBreak: boolean;
  /** React to focus timer phase (work / break / idle) */
  syncWithTimer: boolean;
}

export interface TimerPhasePayload {
  phase: 'work' | 'break' | 'longBreak' | 'idle';
  running: boolean;
}

export type SoundscapePlaybackState = 'idle' | 'loading' | 'playing' | 'fading';
