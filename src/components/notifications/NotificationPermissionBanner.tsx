import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { getNotificationSupport, requestNotificationPermission } from '../../lib/notifications/permission';

interface NotificationPermissionBannerProps {
  visible: boolean;
  permission: 'default' | 'granted' | 'denied';
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationPermissionBanner({
  visible,
  permission,
  onEnable,
  onDismiss,
}: NotificationPermissionBannerProps) {
  if (!getNotificationSupport()) return null;

  const isDenied = permission === 'denied';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="mb-4 overflow-hidden"
        >
          <div className="landing-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 border border-cyan-500/15">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isDenied ? 'Notifications are off' : 'Gentle reminders?'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {isDenied
                    ? 'Enable them in your browser settings, then turn reminders on in Reminders.'
                    : 'Optional habit nudges and focus alerts — calm, never spammy. You choose the times.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
              {!isDenied && (
                <button
                  type="button"
                  onClick={onEnable}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                >
                  Allow
                </button>
              )}
              <button
                type="button"
                onClick={onDismiss}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-white/5 light-theme:hover:bg-slate-900/5"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export async function enableNotificationsFlow(
  setPrefs: (fn: (p: import('../../types').NotificationPreferences) => import('../../types').NotificationPreferences) => void,
): Promise<'granted' | 'denied' | 'default'> {
  const result = await requestNotificationPermission();
  setPrefs((p) => ({
    ...p,
    permissionAsked: true,
    enabled: result === 'granted' ? true : p.enabled,
  }));
  return result;
}
