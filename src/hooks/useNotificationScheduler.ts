import { useEffect, useRef } from 'react';
import { useHabits } from './useHabits';
import { useNotificationPrefs } from './useNotificationPrefs';
import { showAppNotification } from '../lib/notifications/display';
import {
  evaluateScheduledReminders,
  markHabitReminderFired,
  markStreakReminderFired,
} from '../lib/notifications/scheduler';
import { getPermissionState } from '../lib/notifications/permission';

const TICK_MS = 60_000;

export function useNotificationScheduler() {
  const { habits } = useHabits();
  const { prefs, setPrefs, canNotify } = useNotificationPrefs();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const runCheck = async (allowCatchUp = false) => {
    const current = prefsRef.current;
    if (!current.enabled || getPermissionState() !== 'granted') return;

    const due = evaluateScheduledReminders({
      prefs: current,
      habits,
      allowCatchUp,
    });

    for (const payload of due) {
      const shown = await showAppNotification(payload);
      if (!shown) continue;

      if (payload.tag.startsWith('habit-daily')) {
        setPrefs((p) => markHabitReminderFired(p));
      } else if (payload.tag.startsWith('streak-daily')) {
        setPrefs((p) => markStreakReminderFired(p));
      }
    }
  };

  useEffect(() => {
    if (!canNotify) return;

    void runCheck(true);

    const id = window.setInterval(() => void runCheck(false), TICK_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void runCheck(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [canNotify, habits, setPrefs]);
}
