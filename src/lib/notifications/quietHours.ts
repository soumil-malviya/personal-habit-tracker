/** Minutes since midnight for HH:mm */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

/** True when `now` falls inside quiet window (supports overnight e.g. 22:00–07:00). */
export function isInQuietHours(now: Date, start: string, end: string): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);

  if (startM === endM) return false;
  if (startM < endM) {
    return current >= startM && current < endM;
  }
  return current >= startM || current < endM;
}
