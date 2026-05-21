import type { SoundscapeId } from './types';

export interface ProceduralScene {
  output: GainNode;
  start(): void;
  dispose(): void;
}

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + white * 0.04) * 0.98;
      data[i] = last * 4;
    } else {
      data[i] = white * 0.35;
    }
  }
  return buffer;
}

function loopBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  filter?: BiquadFilterNode,
): { source: AudioBufferSourceNode; gain: GainNode } {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  if (filter) {
    source.connect(filter);
    filter.connect(gain);
  } else {
    source.connect(gain);
  }
  return { source, gain };
}

function makeFilter(
  ctx: AudioContext,
  type: BiquadFilterType,
  frequency: number,
  Q = 0.7,
): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = Q;
  return f;
}

export function createProceduralScene(ctx: AudioContext, id: SoundscapeId): ProceduralScene {
  const bus = ctx.createGain();
  const disposers: Array<() => void> = [];
  const sources: AudioBufferSourceNode[] = [];
  const oscillators: OscillatorNode[] = [];

  const attach = (node: AudioNode, level: number) => {
    const g = ctx.createGain();
    g.gain.value = level;
    node.connect(g);
    g.connect(bus);
    return g;
  };

  switch (id) {
    case 'white_noise': {
      const buf = noiseBuffer(ctx, 3, false);
      const { source, gain } = loopBuffer(ctx, buf);
      gain.gain.value = 0.22;
      sources.push(source);
      disposers.push(() => {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      });
      break;
    }
    case 'rain': {
      const buf = noiseBuffer(ctx, 4, true);
      const filter = makeFilter(ctx, 'bandpass', 900, 0.6);
      const { source, gain } = loopBuffer(ctx, buf, filter);
      gain.gain.value = 0.38;
      sources.push(source);
      const drip = ctx.createOscillator();
      drip.type = 'sine';
      drip.frequency.value = 1800;
      const dripGain = ctx.createGain();
      dripGain.gain.value = 0;
      drip.connect(dripGain);
      attach(dripGain, 0.012);
      oscillators.push(drip);
      const pulseDrip = () => {
        const t = ctx.currentTime;
        dripGain.gain.cancelScheduledValues(t);
        dripGain.gain.setValueAtTime(0, t);
        dripGain.gain.linearRampToValueAtTime(0.04, t + 0.008);
        dripGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      };
      const dripInterval = window.setInterval(
        () => {
          if (Math.random() > 0.55) pulseDrip();
        },
        280 + Math.random() * 420,
      );
      disposers.push(() => clearInterval(dripInterval));
      disposers.push(() => {
        try {
          source.stop();
        } catch {
          /* noop */
        }
      });
      break;
    }
    case 'forest': {
      const buf = noiseBuffer(ctx, 5, true);
      const low = makeFilter(ctx, 'lowpass', 420, 0.5);
      const { source, gain } = loopBuffer(ctx, buf, low);
      gain.gain.value = 0.32;
      sources.push(source);
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      oscillators.push(lfo);
      disposers.push(() => {
        try {
          source.stop();
        } catch {
          /* noop */
        }
      });
      break;
    }
    case 'cafe': {
      const buf = noiseBuffer(ctx, 3, true);
      const mid = makeFilter(ctx, 'lowpass', 680, 0.8);
      const { source, gain } = loopBuffer(ctx, buf, mid);
      gain.gain.value = 0.3;
      sources.push(source);
      const hum = ctx.createOscillator();
      hum.type = 'triangle';
      hum.frequency.value = 92;
      attach(hum, 0.018);
      oscillators.push(hum);
      disposers.push(() => {
        try {
          source.stop();
        } catch {
          /* noop */
        }
      });
      break;
    }
  }

  return {
    output: bus,
    start() {
      sources.forEach((s) => {
        try {
          s.start(0);
        } catch {
          /* already started */
        }
      });
      oscillators.forEach((o) => {
        try {
          o.start(0);
        } catch {
          /* noop */
        }
      });
    },
    dispose() {
      disposers.forEach((fn) => fn());
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* noop */
        }
        s.disconnect();
      });
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* noop */
        }
        o.disconnect();
      });
      bus.disconnect();
    },
  };
}
