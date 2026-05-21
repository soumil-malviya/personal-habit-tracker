import type { Habit, NotificationPayload, NotificationPreferences } from '../../types';
import { getLocalDateString } from '../../utils';
import { calculateStreak } from '../../utils';
import {
  habitReminderPayload,
  morningCheckInPayload,
  pomodoroBreakCompletePayload,
  pomodoroWorkCompletePayload,
  streakReminderPayload,
} from './messages';
import { isInQuietHours } from './quietHours';

const CATCH_UP_WINDOW_MINUTES = 45;

function minutesSinceMidnight(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

function isScheduledMinute(now: Date, timeHHmm: string, windowMinutes = 0): boolean {
  const [h, m] = timeHHmm.split(':').map(Number);
  const target = h * 60 + m;
  const current = minutesSinceMidnight(now);
  if (windowMinutes <= 0) {
    return current === target;
  }
  const diff = current - target;
  return diff >= 0 && diff <= windowMinutes;
}

function shouldRespectQuietHours(prefs: NotificationPreferences, now: Date): boolean {
  if (!prefs.quietHours.enabled) return false;
  return isInQuietHours(now, prefs.quietHours.start, prefs.quietHours.end);
}

export function countPendingHabitsToday(habits: Habit[], today: string): number {
  return habits.filter((h) => !h.logs.includes(today)).length;
}

export function getMaxStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  return Math.max(...habits.map((h) => calculateStreak(h.logs).currentStreak));
}

export interface SchedulerInput {
  prefs: NotificationPreferences;
  habits: Habit[];
  now?: Date;
  /** When true, allow catch-up within window after scheduled time (app just opened). */
  allowCatchUp?: boolean;
}

export function evaluateScheduledReminders({
  prefs,
  habits,
  now = new Date(),
  allowCatchUp = false,
}: SchedulerInput): NotificationPayload[] {
  if (!prefs.enabled) return [];

  const today = getLocalDateString(0);
  const results: NotificationPayload[] = [];
  const inQuiet = shouldRespectQuietHours(prefs, now);

  if (prefs.habitReminders.enabled && habits.length > 0 && !inQuiet) {
    const dueNow = isScheduledMinute(now, prefs.habitReminders.time);
    const dueCatchUp =
      allowCatchUp &&
      isScheduledMinute(now, prefs.habitReminders.time, CATCH_UP_WINDOW_MINUTES);
    const notFiredToday = prefs.lastFired.habitDaily !== today;

    if ((dueNow || dueCatchUp) && notFiredToday) {
      const pending = countPendingHabitsToday(habits, today);
      const shouldNotify = !prefs.habitReminders.onlyIfPending || pending > 0;
      if (shouldNotify) {
        const payload =
          pending > 0 ? habitReminderPayload(pending) : morningCheckInPayload();
        results.push({ ...payload, tag: `habit-daily-${today}` });
      }
    }
  }

  if (prefs.streak.enabled && habits.length > 0 && !inQuiet) {
    const maxStreak = getMaxStreak(habits);
    const dueNow = isScheduledMinute(now, prefs.streak.time);
    const dueCatchUp =
      allowCatchUp && isScheduledMinute(now, prefs.streak.time, CATCH_UP_WINDOW_MINUTES);
    const notFiredToday = prefs.lastFired.streakDaily !== today;

    if (
      maxStreak >= prefs.streak.minStreakDays &&
      (dueNow || dueCatchUp) &&
      notFiredToday
    ) {
      const payload = streakReminderPayload(maxStreak);
      results.push({ ...payload, tag: `streak-daily-${today}` });
    }
  }

  return results;
}

export function markHabitReminderFired(
  prefs: NotificationPreferences,
  date = getLocalDateString(0),
): NotificationPreferences {
  return {
    ...prefs,
    lastFired: { ...prefs.lastFired, habitDaily: date },
  };
}

export function markStreakReminderFired(
  prefs: NotificationPreferences,
  date = getLocalDateString(0),
): NotificationPreferences {
  return {
    ...prefs,
    lastFired: { ...prefs.lastFired, streakDaily: date },
  };
}

export function getPomodoroNotification(
  prefs: NotificationPreferences,
  phase: 'work' | 'break' | 'longBreak',
  now = new Date(),
): NotificationPayload | null {
  if (!prefs.enabled || !prefs.pomodoro.enabled) return null;
  if (shouldRespectQuietHours(prefs, now)) return null;

  if (phase === 'work' && prefs.pomodoro.onWorkComplete) {
    return pomodoroWorkCompletePayload();
  }
  if ((phase === 'break' || phase === 'longBreak') && prefs.pomodoro.onBreakComplete) {
    return pomodoroBreakCompletePayload();
  }
  return null;
}
