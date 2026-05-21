import { useEffect, useState } from 'react';

/** Keeps a Date in sync with the device local clock (timezone-aware). */
export function useLocalClock(options?: { enabled?: boolean; intervalMs?: number }) {
  const enabled = options?.enabled ?? true;
  const intervalMs = options?.intervalMs ?? 15_000;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;

    const sync = () => setNow(new Date());
    sync();

    const id = window.setInterval(sync, intervalMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs]);

  return now;
}
