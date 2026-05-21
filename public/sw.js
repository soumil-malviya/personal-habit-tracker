/* NorthHabit — local PWA notifications (no push server) */

const DEFAULT_URL = '/app';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || DEFAULT_URL;
  const absolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absolute);
      }
    }),
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    event.waitUntil(
      self.registration.showNotification(payload.title || 'NorthHabit', {
        body: payload.body || '',
        tag: payload.tag,
        icon: payload.icon || '/favicon.svg',
        badge: '/favicon.svg',
        data: { url: payload.url || DEFAULT_URL },
      }),
    );
  } catch {
    /* ignore malformed push */
  }
});
