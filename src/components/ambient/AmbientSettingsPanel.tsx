import { Sparkles } from 'lucide-react';
import { useAmbientSettings } from '../../hooks/useAmbientSettings';
import { buildAmbientScene } from '../../lib/ambient/scene';
import { periodLabel, PERIOD_ORDER, formatLocalTime } from '../../lib/ambient/timeOfDay';
import { useLocalClock } from '../../hooks/useLocalClock';
import type { ThemeMode } from '../../types';
import type { TimePeriod } from '../../types/ambient';

interface AmbientSettingsPanelProps {
  theme: ThemeMode;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-3 py-2.5 ${disabled ? 'opacity-45 pointer-events-none' : 'cursor-pointer'}`}
    >
      <span className="min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)] block">{label}</span>
        {description && (
          <span className="text-xs text-[var(--text-secondary)] mt-0.5 block leading-relaxed">
            {description}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-10 h-5 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-cyan-600 relative shrink-0 mt-0.5 cursor-pointer transition-colors
          before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
          checked:before:translate-x-5"
        style={{ position: 'relative' }}
      />
    </label>
  );
}

export function AmbientSettingsPanel({ theme }: AmbientSettingsPanelProps) {
  const { settings, setSettings } = useAmbientSettings();
  const now = useLocalClock({ enabled: settings.followTimeOfDay, intervalMs: 30_000 });
  const scene = buildAmbientScene(settings, theme, now);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Ambient atmosphere
        </h4>
        <span className="text-[9px] font-mono text-[var(--text-muted)] ml-auto">
          {settings.followTimeOfDay ? periodLabel(scene.period) : periodLabel(settings.manualPeriod)}
        </span>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
        Calm gradients that follow your day — sunrise, daylight, sunset, and night. Designed to
        stay subtle and easy on battery.
      </p>

      <ToggleRow
        label="Ambient background"
        checked={settings.enabled}
        onChange={(enabled) => setSettings((s) => ({ ...s, enabled }))}
      />

      <ToggleRow
        label="Adapt to time of day"
        description="Uses your device clock and timezone for sunrise, day, sunset, and night."
        checked={settings.followTimeOfDay}
        onChange={(followTimeOfDay) => setSettings((s) => ({ ...s, followTimeOfDay }))}
        disabled={!settings.enabled}
      />

      {settings.followTimeOfDay && settings.enabled && (
        <p className="text-[10px] text-[var(--text-muted)] mb-3 -mt-1 font-mono">
          Device time: {formatLocalTime(now)} · {periodLabel(scene.period)}
        </p>
      )}

      {!settings.followTimeOfDay && settings.enabled && (
        <div className="mb-3 pl-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
            Time of day
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PERIOD_ORDER.map((period: TimePeriod) => (
              <button
                key={period}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, manualPeriod: period }))}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  settings.manualPeriod === period
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-light)]'
                }`}
              >
                {periodLabel(period)}
              </button>
            ))}
          </div>
        </div>
      )}

      <ToggleRow
        label="Floating particles"
        checked={settings.particles}
        onChange={(particles) => setSettings((s) => ({ ...s, particles }))}
        disabled={!settings.enabled}
      />

      <ToggleRow
        label="Night stars"
        description={
          settings.followTimeOfDay
            ? 'Appears during evening and night hours.'
            : 'Shows when Time of day is set to Night.'
        }
        checked={settings.stars}
        onChange={(stars) => setSettings((s) => ({ ...s, stars }))}
        disabled={!settings.enabled}
      />

      <ToggleRow
        label="Gentle rain"
        description="Very light — off by default."
        checked={settings.rain}
        onChange={(rain) => setSettings((s) => ({ ...s, rain }))}
        disabled={!settings.enabled}
      />

      <div className="mt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
          Intensity
        </span>
        <div className="flex gap-2">
          {(['soft', 'normal'] as const).map((level) => (
            <button
              key={level}
              type="button"
              disabled={!settings.enabled}
              onClick={() => setSettings((s) => ({ ...s, intensity: level }))}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                settings.intensity === level
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-light)]'
              } disabled:opacity-40`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
