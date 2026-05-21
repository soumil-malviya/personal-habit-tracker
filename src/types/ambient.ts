export type TimePeriod = 'night' | 'dawn' | 'day' | 'dusk';

export type AmbientIntensity = 'soft' | 'normal';

export interface AmbientSettings {
  enabled: boolean;
  followTimeOfDay: boolean;
  /** Used when followTimeOfDay is false */
  manualPeriod: TimePeriod;
  particles: boolean;
  stars: boolean;
  rain: boolean;
  intensity: AmbientIntensity;
}

export interface AmbientPalette {
  base: string;
  orbA: string;
  orbB: string;
  orbC: string;
  vignette: string;
}

export interface AmbientScene {
  period: TimePeriod;
  progress: number;
  palette: AmbientPalette;
  showStars: boolean;
  showRain: boolean;
}
