import type { SoundscapeSettings } from '../lib/soundscape/types';

export const DEFAULT_SOUNDSCAPE_SETTINGS: SoundscapeSettings = {
  enabled: false,
  trackId: 'rain',
  volume: 0.62,
  muted: false,
  fadeMs: 1400,
  duckOnBreak: true,
  syncWithTimer: true,
};
