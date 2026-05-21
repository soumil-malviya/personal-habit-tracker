/** Schedule a smooth gain ramp on an AudioParam. */
export function rampGain(
  param: AudioParam,
  target: number,
  durationMs: number,
  ctx: AudioContext,
  when = ctx.currentTime,
): void {
  const end = when + Math.max(durationMs, 0) / 1000;
  param.cancelScheduledValues(when);
  param.setValueAtTime(param.value, when);
  param.linearRampToValueAtTime(Math.max(0, Math.min(1, target)), end);
}
