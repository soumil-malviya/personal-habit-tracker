import { useState, useCallback } from 'react';
import { BellRing, Smartphone } from 'lucide-react';
import { NotificationSettingsForm } from '../components/notifications/NotificationSettingsForm';
import {
  enableNotificationsFlow,
} from '../components/notifications/NotificationPermissionBanner';
import { useNotificationPrefs } from '../hooks/useNotificationPrefs';
import { showAppNotification } from '../lib/notifications/display';
import { getNotificationSupport } from '../lib/notifications/permission';

const TEST_COOLDOWN_MS = 60_000;

export default function RemindersPage() {
  const { prefs, setPrefs, permission } = useNotificationPrefs();
  const [testCooldown, setTestCooldown] = useState(false);

  const handleRequestPermission = useCallback(async () => {
    await enableNotificationsFlow(setPrefs);
  }, [setPrefs]);

  const handleTest = useCallback(async () => {
    const ok = await showAppNotification({
      title: 'NorthHabit is listening',
      body: 'Reminders will stay calm — one gentle nudge at a time.',
      tag: 'test-notification',
      url: '/app/reminders',
    });
    if (ok) {
      setTestCooldown(true);
      window.setTimeout(() => setTestCooldown(false), TEST_COOLDOWN_MS);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto pb-8 animate-entrance">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-cyan-600/10 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-800">
              Reminders
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Calm, optional nudges — you stay in control.
            </p>
          </div>
        </div>
      </header>

      <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 border border-cyan-500/10 flex gap-3">
        <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p>
            <strong className="text-[var(--text-primary)] font-semibold">PWA tip:</strong> Add
            NorthHabit to your home screen for reliable reminders while the app runs in the
            background.
          </p>
          <p>
            Reminders are scheduled locally on your device — private, no server, no spam. We check
            about once a minute when the app is open.
          </p>
        </div>
      </div>

      <NotificationSettingsForm
        prefs={prefs}
        permission={permission}
        onChange={setPrefs}
        onRequestPermission={handleRequestPermission}
        onSendTest={handleTest}
        testCooldown={testCooldown}
      />

      {!getNotificationSupport() && (
        <p className="text-center text-xs text-[var(--text-muted)] mt-8">
          Use Chrome, Edge, Safari, or Firefox for notification support.
        </p>
      )}
    </div>
  );
}
