import type { SoundscapeTrack } from './types';

export interface MediaLayerHandles {
  element: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
}

/** Resolve catalog path to a fetchable URL (respects Vite base). */
export function resolveAssetUrl(track: SoundscapeTrack): string | null {
  const raw =
    track.file ??
    track.stream ??
    (track.primary.type === 'file' || track.primary.type === 'stream' ? track.primary.src : null);

  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  const base = import.meta.env.BASE_URL || '/';
  const path = raw.replace(/^\//, '');
  return `${base.endsWith('/') ? base : `${base}/`}${path}`;
}

/** Stream via &lt;audio&gt; — handles large MP3s; avoids decoding entire file into RAM. */
export async function createMediaLayer(
  ctx: AudioContext,
  url: string,
  destination: AudioNode,
): Promise<MediaLayerHandles | null> {
  const audio = new Audio(url);
  audio.loop = true;
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';

  try {
    await waitForMediaReady(audio);
    const source = ctx.createMediaElementSource(audio);
    source.connect(destination);
    await audio.play();
    return { element: audio, source };
  } catch {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    return null;
  }
}

function waitForMediaReady(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Failed to load audio: ${audio.src}`));
    };
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('canplaythrough', onReady, { once: true });
    audio.addEventListener('error', onError, { once: true });
    audio.load();
  });
}
