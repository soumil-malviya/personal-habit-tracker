import { createMediaLayer, resolveAssetUrl } from './assets';
import { rampGain } from './fade';
import { createProceduralScene } from './procedural';
import { getTrack } from './tracks';
import type { ProceduralScene } from './procedural';
import type { MediaLayerHandles } from './assets';
import type { SoundscapeId, SoundscapePlaybackState } from './types';

interface ActiveLayer {
  scene: ProceduralScene | null;
  bufferSource: AudioBufferSourceNode | null;
  media: MediaLayerHandles | null;
  gain: GainNode;
}

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layer: ActiveLayer | null = null;
  private targetVolume = 0.65;
  private duckMultiplier = 1;
  private muted = false;
  private fadeMs = 1200;
  private currentTrack: SoundscapeId | null = null;
  private _state: SoundscapePlaybackState = 'idle';
  private unlocked = false;
  /** True when the active layer is playing an MP3/file (not procedural). */
  private _usingFile = false;

  get state(): SoundscapePlaybackState {
    return this._state;
  }

  get trackId(): SoundscapeId | null {
    return this.currentTrack;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  get usingFile(): boolean {
    return this._usingFile;
  }

  async unlock(): Promise<boolean> {
    const ctx = await this.ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    this.unlocked = ctx.state === 'running';
    return this.unlocked;
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
    if (this.layer?.media?.element && this.layer.media.element.paused) {
      try {
        await this.layer.media.element.play();
      } catch {
        /* needs user gesture */
      }
    }
  }

  setFadeMs(ms: number): void {
    this.fadeMs = Math.max(200, Math.min(4000, ms));
  }

  setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    this.applyMasterGain(this.fadeMs * 0.35);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain(400);
  }

  setDuck(multiplier: number): void {
    this.duckMultiplier = Math.max(0, Math.min(1, multiplier));
    this.applyMasterGain(600);
  }

  async play(trackId: SoundscapeId, volume: number, fadeMs?: number): Promise<void> {
    const fade = fadeMs ?? this.fadeMs;
    this.targetVolume = Math.max(0, Math.min(1, volume));
    await this.ensureContext();
    if (this.currentTrack === trackId && this._state === 'playing') {
      this.applyMasterGain(fade * 0.35);
      return;
    }
    if (this._state === 'idle' && this.master) {
      this.master.gain.value = 0;
    }
    await this.crossfadeTo(trackId, fade);
  }

  async stop(fadeMs?: number): Promise<void> {
    const fade = fadeMs ?? this.fadeMs;
    if (!this.ctx || !this.master) {
      this._state = 'idle';
      this.currentTrack = null;
      this._usingFile = false;
      return;
    }
    this._state = 'fading';
    rampGain(this.master.gain, 0, fade, this.ctx);
    await wait(fade + 40);
    this.disposeLayer();
    this.currentTrack = null;
    this._usingFile = false;
    this._state = 'idle';
  }

  async crossfadeTo(trackId: SoundscapeId, fadeMs?: number): Promise<void> {
    const fade = fadeMs ?? this.fadeMs;
    const ctx = await this.ensureContext();
    const master = this.master!;
    this._state = 'loading';

    const built = await this.buildLayer(ctx, trackId);
    built.gain.connect(master);

    if (built.scene) built.scene.start();

    const prev = this.layer;
    this.layer = built;

    const now = ctx.currentTime;
    const end = now + fade / 1000;

    built.gain.gain.setValueAtTime(0, now);
    built.gain.gain.linearRampToValueAtTime(1, end);

    if (prev) {
      prev.gain.gain.cancelScheduledValues(now);
      prev.gain.gain.setValueAtTime(prev.gain.gain.value, now);
      prev.gain.gain.linearRampToValueAtTime(0, end);
    }

    await wait(fade + 30);
    this.disposeLayerNodes(prev);

    this.currentTrack = trackId;
    this._state = 'playing';
    this.applyMasterGain(Math.min(fade, 600));
  }

  dispose(): void {
    this.disposeLayer();
    if (this.master) this.master.disconnect();
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.master = null;
    this.currentTrack = null;
    this._usingFile = false;
    this._state = 'idle';
    this.unlocked = false;
  }

  private async buildLayer(ctx: AudioContext, trackId: SoundscapeId): Promise<ActiveLayer> {
    const track = getTrack(trackId);
    const assetUrl = resolveAssetUrl(track);
    const gain = ctx.createGain();
    gain.gain.value = 1;

    if (assetUrl) {
      const media = await createMediaLayer(ctx, assetUrl, gain);
      if (media) {
        this._usingFile = true;
        if (import.meta.env.DEV) {
          console.info('[soundscape] Playing file:', assetUrl);
        }
        return { scene: null, bufferSource: null, media, gain };
      }
      if (import.meta.env.DEV) {
        console.warn('[soundscape] File failed, using procedural:', assetUrl);
      }
    }

    this._usingFile = false;
    const scene = createProceduralScene(ctx, trackId);
    scene.output.connect(gain);
    return { scene, bufferSource: null, media: null, gain };
  }

  private async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) throw new Error('Web Audio not supported');
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.unlocked = this.ctx.state === 'running';
    return this.ctx;
  }

  private effectiveVolume(): number {
    if (this.muted) return 0;
    return this.targetVolume * this.duckMultiplier;
  }

  private applyMasterGain(ms: number): void {
    if (!this.ctx || !this.master) return;
    rampGain(this.master.gain, this.effectiveVolume(), ms, this.ctx);
  }

  private disposeLayerNodes(layer: ActiveLayer | null): void {
    if (!layer) return;
    if (layer.scene) layer.scene.dispose();
    if (layer.bufferSource) {
      try {
        layer.bufferSource.stop();
      } catch {
        /* noop */
      }
      layer.bufferSource.disconnect();
    }
    if (layer.media) {
      layer.media.element.pause();
      layer.media.element.removeAttribute('src');
      layer.media.element.load();
      layer.media.source.disconnect();
    }
    layer.gain.disconnect();
  }

  private disposeLayer(): void {
    this.disposeLayerNodes(this.layer);
    this.layer = null;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Singleton for app-wide playback */
export const soundscapeEngine = new SoundscapeEngine();
