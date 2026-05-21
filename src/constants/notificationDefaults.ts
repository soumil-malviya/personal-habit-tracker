import type { NotificationPreferences } from '../types';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: false,
  permissionAsked: false,
  habitReminders: {
    enabled: true,
    time: '09:00',
    onlyIfPending: true,
  },
  pomodoro: {
    enabled: true,
    onWorkComplete: true,
    onBreakComplete: false,
  },
  streak: {
    enabled: true,
    time: '20:30',
    minStreakDays: 1,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
  lastFired: {},
};
