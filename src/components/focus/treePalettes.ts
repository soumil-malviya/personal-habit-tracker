import type { TreeHealth, TreeSpecies } from '../../types';

export interface TreePalette {
  trunk: string;
  trunkHighlight: string;
  foliage: string[];
  foliageGlow: string;
}

export const TREE_PALETTES: Record<TreeSpecies, TreePalette> = {
  pine: {
    trunk: '#3d4f42',
    trunkHighlight: '#5a6b5e',
    foliage: ['#1e3d32', '#2d5a47', '#3d6b55'],
    foliageGlow: 'rgba(45, 90, 71, 0.35)',
  },
  oak: {
    trunk: '#4a3f35',
    trunkHighlight: '#6b5d4f',
    foliage: ['#2a4a38', '#3a6348', '#4a7a58'],
    foliageGlow: 'rgba(58, 99, 72, 0.3)',
  },
  birch: {
    trunk: '#8a9a94',
    trunkHighlight: '#c5d4ce',
    foliage: ['#3a5c48', '#4d7560', '#5f8f72'],
    foliageGlow: 'rgba(77, 117, 96, 0.28)',
  },
  maple: {
    trunk: '#4a3828',
    trunkHighlight: '#6d5340',
    foliage: ['#3d5240', '#5a7055', '#6d8868'],
    foliageGlow: 'rgba(90, 112, 85, 0.32)',
  },
};

export function healthOpacity(health: TreeHealth): number {
  switch (health) {
    case 'thriving':
      return 1;
    case 'stable':
      return 0.88;
    case 'wilting':
      return 0.55;
    case 'dormant':
      return 0.4;
  }
}

export function healthSway(health: TreeHealth): number {
  return health === 'wilting' ? 4 : health === 'thriving' ? 2 : 1.5;
}
