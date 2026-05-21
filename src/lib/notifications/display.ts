import type { NotificationPayload } from '../../types';
import { getNotificationSupport, getPermissionState } from './permission';

const ICON = '/favicon.svg';

export async function showAppNotification(payload: NotificationPayload): Promise<boolean> {
  if (!getNotificationSupport() || getPermissionState() !== 'granted') {
    return false;
  }

  const options: NotificationOptions = {
    body: payload.body,
    tag: payload.tag,
    icon: ICON,
    badge: ICON,
    data: { url: payload.url ?? '/app' },
    silent: false,
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, options);
    return true;
  } catch {
    try {
      new Notification(payload.title, options);
      return true;
    } catch {
      return false;
    }
  }
}
