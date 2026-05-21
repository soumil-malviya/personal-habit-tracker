import { motion } from 'motion/react';
import type { TreeHealth, TreeSpecies } from '../../types';
import { TREE_PALETTES, healthOpacity, healthSway } from './treePalettes';

interface ProceduralTreeProps {
  species: TreeSpecies;
  scale: number;
  health: TreeHealth;
  x: number;
  groundY?: number;
  isLive?: boolean;
  growth?: number;
}

function PineShape({ palette, wilt }: { palette: typeof TREE_PALETTES.pine; wilt: boolean }) {
  return (
    <g>
      <rect x={-2} y={-12} width={4} height={14} fill={palette.trunk} rx={1} />
      <rect x={-1.5} y={-11} width={1} height={12} fill={palette.trunkHighlight} opacity={0.4} rx={0.5} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M0 ${-18 - i * 14} L${-12 + i * 2} ${-6 - i * 12} L${12 - i * 2} ${-6 - i * 12} Z`}
          fill={palette.foliage[i] ?? palette.foliage[2]}
          opacity={0.85 - i * 0.08}
          transform={wilt ? `rotate(${6 - i * 2})` : undefined}
        />
      ))}
      <ellipse cx={0} cy={-30} rx={8} ry={4} fill={palette.foliageGlow} opacity={0.5} />
    </g>
  );
}

function OakShape({ palette, wilt }: { palette: typeof TREE_PALETTES.oak; wilt: boolean }) {
  return (
    <g>
      <rect x={-2.5} y={-14} width={5} height={16} fill={palette.trunk} rx={1.2} />
      <ellipse cx={-6} cy={-28} rx={12} ry={10} fill={palette.foliage[0]} opacity={0.9} transform={wilt ? 'rotate(8)' : undefined} />
      <ellipse cx={6} cy={-30} rx={11} ry={9} fill={palette.foliage[1]} opacity={0.85} />
      <ellipse cx={0} cy={-36} rx={14} ry={12} fill={palette.foliage[2]} opacity={0.95} />
      <ellipse cx={0} cy={-34} rx={18} ry={8} fill={palette.foliageGlow} opacity={0.45} />
    </g>
  );
}

function BirchShape({ palette }: { palette: typeof TREE_PALETTES.birch }) {
  return (
    <g>
      <rect x={-2} y={-16} width={4} height={18} fill={palette.trunk} rx={1} />
      <rect x={-1.8} y={-14} width={0.6} height={14} fill={palette.trunkHighlight} opacity={0.5} />
      <ellipse cx={0} cy={-32} rx={10} ry={14} fill={palette.foliage[1]} />
      <ellipse cx={-4} cy={-28} rx={8} ry={10} fill={palette.foliage[0]} opacity={0.8} />
      <ellipse cx={0} cy={-36} rx={14} ry={6} fill={palette.foliageGlow} opacity={0.4} />
    </g>
  );
}

function MapleShape({ palette }: { palette: typeof TREE_PALETTES.maple }) {
  return (
    <g>
      <rect x={-2} y={-12} width={4} height={14} fill={palette.trunk} rx={1} />
      <circle cx={0} cy={-28} r={13} fill={palette.foliage[2]} />
      <circle cx={-8} cy={-24} r={9} fill={palette.foliage[0]} opacity={0.75} />
      <circle cx={7} cy={-26} r={8} fill={palette.foliage[1]} opacity={0.8} />
      <ellipse cx={0} cy={-30} rx={16} ry={5} fill={palette.foliageGlow} opacity={0.35} />
    </g>
  );
}

export function ProceduralTree({
  species,
  scale,
  health,
  x,
  groundY = 112,
  isLive = false,
  growth = 100,
}: ProceduralTreeProps) {
  const palette = TREE_PALETTES[species];
  const opacity = healthOpacity(health);
  const wilt = health === 'wilting' || health === 'dormant';
  const displayScale = isLive ? 0.38 + (growth / 100) * 0.62 : scale;
  const sway = healthSway(health);

  const shape =
    species === 'pine' ? (
      <PineShape palette={palette} wilt={wilt} />
    ) : species === 'oak' ? (
      <OakShape palette={palette} wilt={wilt} />
    ) : species === 'birch' ? (
      <BirchShape palette={palette} />
    ) : (
      <MapleShape palette={palette} />
    );

  /* Static SVG transform for position — motion must not own translate (it stacks trees at 0,0). */
  return (
    <g transform={`translate(${x}, ${groundY})`}>
      <g transform={`scale(${displayScale})`} style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}>
        <motion.g
          initial={isLive ? { opacity: 0 } : { opacity }}
          animate={{
            opacity,
            rotate: isLive ? 0 : wilt ? [-1, 1, -1] : [0, sway * 0.25, -sway * 0.25, 0],
          }}
          transition={
            isLive
              ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              : { rotate: { duration: 10, repeat: Infinity, ease: 'easeInOut' } }
          }
          style={{ transformOrigin: '0px 0px' }}
        >
          {shape}
        </motion.g>
      </g>
    </g>
  );
}
