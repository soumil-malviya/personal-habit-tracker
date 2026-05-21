import { useAmbientScene } from '../../hooks/useAmbientScene';
import type { ThemeMode } from '../../types';
import { AmbientGradientLayer } from './AmbientGradientLayer';
import { AmbientParticles } from './AmbientParticles';
import { AmbientStars } from './AmbientStars';
import { AmbientRain } from './AmbientRain';

interface AmbientBackgroundProps {
  theme: ThemeMode;
}

export function AmbientBackground({ theme }: AmbientBackgroundProps) {
  const { settings, scene, reducedMotion } = useAmbientScene(theme);
  const animate = settings.enabled && !reducedMotion;
  const isDark = theme === 'dark';

  if (!settings.enabled) {
    return (
      <div
        className="ambient-layer ambient-layer--off"
        style={{ backgroundColor: isDark ? '#040405' : '#eef1f6' }}
        aria-hidden
      />
    );
  }

  return (
    <div className="ambient-layer" aria-hidden>
      <AmbientGradientLayer
        palette={scene.palette}
        animate={animate}
        intensity={settings.intensity}
      />

      {settings.particles && (
        <AmbientParticles animate={animate} intensity={settings.intensity} isDark={isDark} />
      )}

      {scene.showStars && <AmbientStars animate={animate} />}

      {scene.showRain && <AmbientRain animate={animate} isDark={isDark} />}
    </div>
  );
}
