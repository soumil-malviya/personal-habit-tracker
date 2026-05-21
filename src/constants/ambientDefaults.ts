import type { AmbientSettings } from '../types/ambient';

export const DEFAULT_AMBIENT_SETTINGS: AmbientSettings = {
  enabled: true,
  followTimeOfDay: true,
  manualPeriod: 'day',
  particles: true,
  stars: true,
  rain: false,
  intensity: 'soft',
};
