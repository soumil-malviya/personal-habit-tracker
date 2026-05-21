import { useEffect } from 'react';
import { SOUNDSCAPE_TRACKS } from '../lib/soundscape/tracks';
import type { SoundscapeId } from '../lib/soundscape/types';
import type { SoundscapeContextValue } from '../contexts/SoundscapeContext';

const TRACK_HOTKEYS: Record<string, SoundscapeId> = {
  '1': 'rain',
  '2': 'forest',
  '3': 'cafe',
  '4': 'white_noise',
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function useSoundscapeKeyboard(soundscape: SoundscapeContextValue) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || !e.shiftKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === 'p') {
        e.preventDefault();
        void soundscape.togglePlay();
        return;
      }

      if (key === 'm') {
        e.preventDefault();
        soundscape.setMuted(!soundscape.settings.muted);
        return;
      }

      if (key === 'arrowup') {
        e.preventDefault();
        soundscape.setVolume(Math.min(1, soundscape.settings.volume + 0.08));
        return;
      }

      if (key === 'arrowdown') {
        e.preventDefault();
        soundscape.setVolume(Math.max(0, soundscape.settings.volume - 0.08));
        return;
      }

      const track = TRACK_HOTKEYS[key];
      if (track) {
        e.preventDefault();
        void soundscape.selectTrack(track);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [soundscape]);
}

export const SOUNDSCAPE_SHORTCUT_HINT =
  'Alt+Shift+P play · M mute · 1–4 scenes · ↑↓ volume';
