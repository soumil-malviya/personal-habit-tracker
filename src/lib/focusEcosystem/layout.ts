import type { ActiveSapling, ForestTree } from '../../types';
import { hashToUnit } from './growth';

export const GROVE_VIEW_W = 480;
export const GROVE_GROUND_Y = 112;

/** Horizontal space a scaled tree needs from its anchor (viewBox units). */
const TREE_RADIUS = 28;
const EDGE_PAD = TREE_RADIUS + 8;
const MIN_GAP = 44;

function clampX(x: number, scale = 1): number {
  const margin = EDGE_PAD + scale * 12;
  return Math.max(margin, Math.min(GROVE_VIEW_W - margin, x));
}

function baseSlotX(index: number, total: number): number {
  const inner = GROVE_VIEW_W - EDGE_PAD * 2;
  if (total <= 1) return GROVE_VIEW_W / 2;
  return EDGE_PAD + (index / (total - 1)) * inner;
}

/** Nudge away from already-used positions. */
function resolveCollision(preferred: number, used: number[]): number {
  let x = clampX(preferred);
  let attempts = 0;
  while (used.some((u) => Math.abs(u - x) < MIN_GAP) && attempts < 24) {
    const dir = attempts % 2 === 0 ? 1 : -1;
    x = clampX(x + dir * (MIN_GAP * 0.55));
    attempts++;
  }
  return x;
}

function dedupeTrees(trees: ForestTree[]): ForestTree[] {
  const byId = new Map<string, ForestTree>();
  for (const tree of trees) {
    byId.set(tree.id, tree);
  }
  return Array.from(byId.values());
}

export function layoutPlantedTrees(trees: ForestTree[]): { tree: ForestTree; x: number }[] {
  const slice = dedupeTrees(trees).slice(-12);
  const used: number[] = [];

  return slice.map((tree, index) => {
    const jitter = (hashToUnit(tree.id) - 0.5) * 18;
    const preferred = baseSlotX(index, slice.length) + jitter;
    const x = resolveCollision(preferred, used);
    used.push(x);
    return { tree, x: clampX(x, tree.growthScale) };
  });
}

export function layoutSaplingX(
  planted: { x: number }[],
  sapling: ActiveSapling | null,
): number {
  if (!sapling) return GROVE_VIEW_W / 2;

  const used = planted.map((p) => p.x);

  if (used.length === 0) {
    return clampX(GROVE_VIEW_W / 2);
  }

  const preferred = clampX(GROVE_VIEW_W * 0.72 + (hashToUnit(sapling.sessionId) - 0.5) * 24);
  return resolveCollision(preferred, used);
}
