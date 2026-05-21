import type { SoundscapeId, SoundscapeTrack } from './types';

/** Central catalog — swap `file` / `stream` without touching UI or engine. */
export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'rain',
    label: 'Rain',
    description: 'Soft rainfall on glass',
    primary: { type: 'procedural' },
    file: '/audio/rain.mp3',
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Woodland air and distant breeze',
    primary: { type: 'procedural' },
    file: '/audio/forest.mp3',
  },
  {
    id: 'cafe',
    label: 'Café',
    description: 'Warm room hum and murmur',
    primary: { type: 'procedural' },
    file: '/audio/cafe.mp3',
  },
  {
    id: 'white_noise',
    label: 'White noise',
    description: 'Steady focus mask',
    primary: { type: 'procedural' },
    file: '/audio/white-noise.mp3',
  },
];

export const SOUNDSCAPE_TRACK_MAP = Object.fromEntries(
  SOUNDSCAPE_TRACKS.map((t) => [t.id, t]),
) as Record<SoundscapeId, SoundscapeTrack>;

export function getTrack(id: SoundscapeId): SoundscapeTrack {
  return SOUNDSCAPE_TRACK_MAP[id];
}
