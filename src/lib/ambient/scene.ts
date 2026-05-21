import type { AmbientScene, AmbientSettings } from '../../types/ambient';
import type { ThemeMode } from '../../types';
import { blendPalettes, getPalette } from './palettes';
import { getLocalHour, getPeriodBlend, resolveTimePeriod } from './timeOfDay';

function resolveNightHours(hour: number): boolean {
  return resolveTimePeriod(hour) === 'night';
}

export function buildAmbientScene(
  settings: AmbientSettings,
  theme: ThemeMode,
  now = new Date(),
): AmbientScene {
  const hour = getLocalHour(now);

  let palette;
  let period;

  if (settings.followTimeOfDay) {
    const { from, to, t } = getPeriodBlend(hour);
    period = t < 0.5 ? from : to;
    palette = blendPalettes(getPalette(from, theme), getPalette(to, theme), t);
  } else {
    period = settings.manualPeriod;
    palette = getPalette(period, theme);
  }

  const nightHours = settings.followTimeOfDay
    ? resolveNightHours(hour)
    : settings.manualPeriod === 'night';

  return {
    period,
    progress: hour / 24,
    palette,
    showStars: settings.stars && settings.enabled && nightHours,
    showRain: settings.rain && settings.enabled,
  };
}
