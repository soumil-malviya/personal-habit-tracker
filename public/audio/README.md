# Soundscape audio assets

Place optional high-quality loops here. The app uses procedural audio when a file is missing.

| File | Soundscape |
|------|------------|
| `rain.mp3` | Rain |
| `forest.mp3` | Forest |
| `cafe.mp3` | Café |
| `white-noise.mp3` | White noise |

Use seamless loops (MP3 or AAC), **30–90 seconds** per file, normalized to roughly -18 LUFS.

**Keep files small** (under ~5 MB each). Very long MP3s (e.g. 20+ MB) can fail in-browser; the app streams via `<audio>` but short loops work best.

Future streaming URLs can be added in `src/lib/soundscape/tracks.ts` under each track’s `stream` field.
