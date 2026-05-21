import type { ReactNode } from 'react';
import { Bell, Clock, Flame, Moon, Timer, Leaf } from 'lucide-react';
import type { NotificationPreferences } from '../../types';
import { getNotificationSupport } from '../../lib/notifications/permission';
import { isInQuietHours } from '../../lib/notifications/quietHours';

interface NotificationSettingsFormProps {
  prefs: NotificationPreferences;
  permission: 'default' | 'granted' | 'denied';
  onChange: (prefs: NotificationPreferences) => void;
  onRequestPermission: () => void;
  onSendTest: () => void;
  testCooldown: boolean;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 py-3 ${
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
      }`}
    >
      <span className="min-w-0">
        <span className="text-sm font-semibold text-[var(--text-primary)] block">{label}</span>
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
        className="w-11 h-6 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-cyan-600 relative shrink-0 cursor-pointer transition-colors
          before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
          checked:before:translate-x-5 before:shadow-sm"
        style={{ position: 'relative' }}
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
        {label}
      </span>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100/80 dark:bg-slate-900/50 border border-[var(--border-light)] rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
      />
    </label>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6 border border-[var(--border-light)]">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-light)]">
        <div className="w-9 h-9 rounded-xl bg-cyan-600/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-600/90 dark:text-cyan-400/90">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function NotificationSettingsForm({
  prefs,
  permission,
  onChange,
  onRequestPermission,
  onSendTest,
  testCooldown,
}: NotificationSettingsFormProps) {
  const supported = getNotificationSupport();
  const masterDisabled = !supported || permission !== 'granted';
  const inQuietNow =
    prefs.quietHours.enabled &&
    isInQuietHours(new Date(), prefs.quietHours.start, prefs.quietHours.end);

  const patch = (partial: Partial<NotificationPreferences>) => onChange({ ...prefs, ...partial });

  return (
    <div className="space-y-5">
      {!supported && (
        <p className="text-sm text-amber-600 dark:text-amber-400 glass-panel rounded-xl p-4">
          Notifications are not supported in this browser. Install NorthHabit as a PWA on mobile for
          the best experience.
        </p>
      )}

      {supported && permission === 'denied' && (
        <p className="text-sm text-[var(--text-secondary)] glass-panel rounded-xl p-4">
          Notifications are blocked. Open your browser site settings for NorthHabit, allow
          notifications, then return here.
        </p>
      )}

      {supported && permission === 'default' && (
        <button
          type="button"
          onClick={onRequestPermission}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 transition-colors"
        >
          Allow notifications
        </button>
      )}

      <Section icon={Bell} title="Reminders">
        <Toggle
          checked={prefs.enabled}
          onChange={(enabled) => patch({ enabled })}
          disabled={masterDisabled}
          label="Enable gentle reminders"
          description="At most one habit and one streak nudge per day. Never while you are in quiet hours."
        />
        {permission === 'granted' && (
          <button
            type="button"
            disabled={!prefs.enabled || testCooldown}
            onClick={onSendTest}
            className="mt-2 w-full py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400 disabled:opacity-40 transition-colors"
          >
            {testCooldown ? 'Test sent — wait a moment' : 'Send a test notification'}
          </button>
        )}
      </Section>

      <Section icon={Leaf} title="Daily habits">
        <Toggle
          checked={prefs.habitReminders.enabled}
          onChange={(enabled) =>
            patch({ habitReminders: { ...prefs.habitReminders, enabled } })
          }
          disabled={masterDisabled || !prefs.enabled}
          label="Morning habit reminder"
          description="A soft prompt at your chosen time."
        />
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <TimeField
            label="Reminder time"
            value={prefs.habitReminders.time}
            onChange={(time) => patch({ habitReminders: { ...prefs.habitReminders, time } })}
            disabled={masterDisabled || !prefs.enabled || !prefs.habitReminders.enabled}
          />
        </div>
        <Toggle
          checked={prefs.habitReminders.onlyIfPending}
          onChange={(onlyIfPending) =>
            patch({ habitReminders: { ...prefs.habitReminders, onlyIfPending } })
          }
          disabled={masterDisabled || !prefs.enabled || !prefs.habitReminders.enabled}
          label="Only when habits are open"
          description="Skip the nudge if you have already checked in today."
        />
      </Section>

      <Section icon={Flame} title="Streak warmth">
        <Toggle
          checked={prefs.streak.enabled}
          onChange={(enabled) => patch({ streak: { ...prefs.streak, enabled } })}
          disabled={masterDisabled || !prefs.enabled}
          label="Evening streak reminder"
          description="A quiet note when you have an active streak worth tending."
        />
        <TimeField
          label="Reminder time"
          value={prefs.streak.time}
          onChange={(time) => patch({ streak: { ...prefs.streak, time } })}
          disabled={masterDisabled || !prefs.enabled || !prefs.streak.enabled}
        />
      </Section>

      <Section icon={Timer} title="Pomodoro">
        <Toggle
          checked={prefs.pomodoro.enabled}
          onChange={(enabled) => patch({ pomodoro: { ...prefs.pomodoro, enabled } })}
          disabled={masterDisabled || !prefs.enabled}
          label="Focus session alerts"
          description="Only when a timer finishes — never random pings."
        />
        <Toggle
          checked={prefs.pomodoro.onWorkComplete}
          onChange={(onWorkComplete) =>
            patch({ pomodoro: { ...prefs.pomodoro, onWorkComplete } })
          }
          disabled={masterDisabled || !prefs.enabled || !prefs.pomodoro.enabled}
          label="After focus block"
        />
        <Toggle
          checked={prefs.pomodoro.onBreakComplete}
          onChange={(onBreakComplete) =>
            patch({ pomodoro: { ...prefs.pomodoro, onBreakComplete } })
          }
          disabled={masterDisabled || !prefs.enabled || !prefs.pomodoro.enabled}
          label="After break ends"
        />
      </Section>

      <Section icon={Moon} title="Quiet hours">
        <Toggle
          checked={prefs.quietHours.enabled}
          onChange={(enabled) => patch({ quietHours: { ...prefs.quietHours, enabled } })}
          disabled={!prefs.enabled}
          label="Respect quiet hours"
          description="All reminders pause overnight — including Pomodoro, so nothing disturbs your rest."
        />
        <div className="grid grid-cols-2 gap-3 mt-2">
          <TimeField
            label="From"
            value={prefs.quietHours.start}
            onChange={(start) => patch({ quietHours: { ...prefs.quietHours, start } })}
            disabled={!prefs.enabled || !prefs.quietHours.enabled}
          />
          <TimeField
            label="Until"
            value={prefs.quietHours.end}
            onChange={(end) => patch({ quietHours: { ...prefs.quietHours, end } })}
            disabled={!prefs.enabled || !prefs.quietHours.enabled}
          />
        </div>
        {inQuietNow && prefs.quietHours.enabled && (
          <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            You are in quiet hours right now.
          </p>
        )}
      </Section>
    </div>
  );
}
