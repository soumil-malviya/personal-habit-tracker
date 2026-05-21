import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { DEFAULT_NOTIFICATION_PREFS } from '../constants/notificationDefaults';
import type { NotificationPreferences } from '../types';
import { getPermissionState } from '../lib/notifications/permission';

function mergePrefs(stored: NotificationPreferences): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...stored,
    habitReminders: { ...DEFAULT_NOTIFICATION_PREFS.habitReminders, ...stored.habitReminders },
    pomodoro: { ...DEFAULT_NOTIFICATION_PREFS.pomodoro, ...stored.pomodoro },
    streak: { ...DEFAULT_NOTIFICATION_PREFS.streak, ...stored.streak },
    quietHours: { ...DEFAULT_NOTIFICATION_PREFS.quietHours, ...stored.quietHours },
    lastFired: { ...DEFAULT_NOTIFICATION_PREFS.lastFired, ...stored.lastFired },
  };
}

export function useNotificationPrefs() {
  const [raw, setRaw] = useLocalStorage<NotificationPreferences>(
    STORAGE_KEYS.notifications,
    DEFAULT_NOTIFICATION_PREFS,
  );

  const prefs = useMemo(() => mergePrefs(raw), [raw]);

  const setPrefs = useCallback(
    (value: NotificationPreferences | ((p: NotificationPreferences) => NotificationPreferences)) => {
      setRaw((prev) => {
        const merged = mergePrefs(prev);
        const next = value instanceof Function ? value(merged) : value;
        return next;
      });
    },
    [setRaw],
  );

  const permission = getPermissionState();
  const canNotify = permission === 'granted' && prefs.enabled;

  return { prefs, setPrefs, permission, canNotify };
}
