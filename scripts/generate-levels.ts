// Constructive level generator: builds solvable levels with REAL blocking
// dependencies using FORWARD construction with path reservation.
//
// Algorithm:
//   1. Place arrows in EXTRACTION order (a1 extracted first, aN last).
//   2. When placing ai, its path (the cells it sweeps) must be clear of walls
//      AND clear of all LATER arrows (a_{i+1}..aN) — because those are still
//      on the grid when ai is extracted forward.
//   3. To enforce (2), we mark ai's path cells (excluding ai's own position
//      and earlier arrows' positions) as "future-forbidden" — future arrows
//      can't be placed there.
//   4. ai's path MAY contain earlier arrows' positions (a1..a_{i-1}) — those
//      are already gone when ai is extracted. This is what creates blocking
//      dependencies (ai is blocked by aj for j < i if aj's position is in
//      ai's path — but aj is extracted first, so this is fine).
//
// Usage: bun run scripts/generate-levels.ts

import { writeFileSync } from 'fs';
import type { Arrow, Direction, Level } from '../src/lib/game/types';
import { buildGrid, tryExtract } from '../src/lib/game/engine';
import { solveLevel } from '../src/lib/game/engine';

const DIRS: Direction[] = ['up', 'down', 'left', 'right'];

interface Spec {
  id: number;
  slug: string;
  title: string;
  rows: number;
  cols: number;
  arrowCount: number;
  walls: Array<{ row: number; col: number }>;
  hintsAllowed: number;
  subtitle: string;
  tier: Level['tier'];
  teach?: string;
  /** Optional fixed arrow positions. */
  fixedPositions?: Array<{ row: number; col: number }>;
  /** Seed for deterministic generation. */
  seed: number;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(spec: Spec): Level | null {
  const rand = rng(spec.seed);
  const wallSet = new Set(spec.walls.map((w) => `${w.row},${w.col}`));
  const usedCells = new Set<string>(wallSet); // walls + already-placed arrows
  const futureForbidden = new Set<string>(); // cells where future arrows can't go

  // Decide positions (possibly shuffled for retries).
  let positions: Array<{ row: number; col: number }>;
  if (spec.fixedPositions) {
    // Shuffle a copy so retries explore different orderings.
    positions = [...spec.fixedPositions];
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
  } else {
    positions = [];
    while (positions.length < spec.arrowCount) {
      const r = Math.floor(rand() * spec.rows);
      const c = Math.floor(rand() * spec.cols);
      const k = `${r},${c}`;
      if (!usedCells.has(k)) {
        usedCells.add(k);
        positions.push({ row: r, col: c });
      }
    }
  }

  // Reset usedCells to just walls (positions aren't arrows yet).
  usedCells.clear();
  for (const w of spec.walls) usedCells.add(`${w.row},${w.col}`);

  const arrows: Arrow[] = [];
  let id = 0;

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const k = `${pos.row},${pos.col}`;
    if (wallSet.has(k) || usedCells.has(k)) return null;
    if (futureForbidden.has(k)) return null; // this position would block an earlier arrow

    // Find valid directions: path clear of walls (earlier arrows' positions are OK).
    const candidates: Array<{ dir: Direction; pathLen: number; path: Array<{ row: number; col: number }> }> = [];
    for (const dir of DIRS) {
      const tempArrows: Arrow[] = [
        { id: 'tmp', row: pos.row, col: pos.col, direction: dir },
      ];
      const grid = buildGrid(
        { rows: spec.rows, cols: spec.cols, walls: spec.walls, arrows: [] },
        tempArrows
      );
      const r = tryExtract(grid, 'tmp');
      if (r.ok) {
        candidates.push({ dir, pathLen: r.path.length, path: r.path });
      }
    }
    if (candidates.length === 0) return null;
    // Weighted random selection favoring longer paths.
    // Linear weighting (pathLen) gives reasonable preference to longer paths
    // while still allowing immediate-exit moves when needed.
    const weights = candidates.map((c) => c.pathLen);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let pick = rand() * totalWeight;
    let chosenIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      pick -= weights[i];
      if (pick <= 0) {
        chosenIdx = i;
        break;
      }
    }
    const chosen = candidates[chosenIdx];

    // Mark path cells (within grid, excluding own position and earlier arrows) as future-forbidden.
    for (const cell of chosen.path) {
      if (cell.row === pos.row && cell.col === pos.col) continue;
      if (cell.row < 0 || cell.row >= spec.rows || cell.col < 0 || cell.col >= spec.cols) continue;
      const ck = `${cell.row},${cell.col}`;
      if (!usedCells.has(ck)) {
        futureForbidden.add(ck);
      }
    }

    arrows.push({ id: `a${++id}`, row: pos.row, col: pos.col, direction: chosen.dir });
    usedCells.add(k);
  }

  const level: Level = {
    id: spec.id,
    slug: spec.slug,
    title: spec.title,
    rows: spec.rows,
    cols: spec.cols,
    arrows,
    walls: spec.walls,
    hintsAllowed: spec.hintsAllowed,
    subtitle: spec.subtitle,
    tier: spec.tier,
    teach: spec.teach,
  };

  // Sanity-check: must be solvable.
  const sol = solveLevel(level);
  if (!sol) return null;
  return level;
}

const SPECS: Spec[] = [
  // INTRO
  {
    id: 1, slug: 'first-step', title: 'First Step', rows: 3, cols: 3, arrowCount: 1, walls: [],
    hintsAllowed: 1, subtitle: 'Tap the arrow. Watch it glide out.', tier: 'intro',
    teach: 'Tap an arrow to slide it in its pointing direction. Reach the edge to extract it.',
    fixedPositions: [{ row: 1, col: 0 }], seed: 1,
  },
  {
    id: 2, slug: 'two-paths', title: 'Two Paths', rows: 3, cols: 4, arrowCount: 2, walls: [],
    hintsAllowed: 1, subtitle: 'Parallel arrows. Order is yours.', tier: 'intro',
    fixedPositions: [{ row: 0, col: 0 }, { row: 2, col: 0 }], seed: 2,
  },
  {
    id: 3, slug: 'cross-currents', title: 'Cross Currents', rows: 3, cols: 4, arrowCount: 2, walls: [],
    hintsAllowed: 1, subtitle: 'Opposite directions, separate lanes.', tier: 'intro',
    fixedPositions: [{ row: 0, col: 0 }, { row: 2, col: 3 }], seed: 3,
  },
  {
    id: 4, slug: 'one-blocks-one', title: 'One Blocks One', rows: 4, cols: 4, arrowCount: 2, walls: [],
    hintsAllowed: 1, subtitle: 'A sits in B’s lane. Move B first.', tier: 'intro',
    teach: 'If arrow A is in arrow B’s path, extract B first — or B will collide with A.',
    fixedPositions: [{ row: 0, col: 0 }, { row: 0, col: 3 }], seed: 4,
  },
  {
    id: 5, slug: 'four-corners', title: 'Four Corners', rows: 5, cols: 5, arrowCount: 4, walls: [],
    hintsAllowed: 2, subtitle: 'Break the cycle — find the open corner.', tier: 'intro',
    fixedPositions: [{ row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 }], seed: 5,
  },
  {
    id: 6, slug: 'the-chain', title: 'The Chain', rows: 5, cols: 4, arrowCount: 4, walls: [],
    hintsAllowed: 2, subtitle: 'A simple cascade.', tier: 'intro',
    fixedPositions: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }], seed: 6,
  },

  // CORE
  {
    id: 7, slug: 'first-wall', title: 'First Wall', rows: 5, cols: 5, arrowCount: 4,
    walls: [{ row: 2, col: 2 }], hintsAllowed: 2, subtitle: 'A wall reshapes the path.', tier: 'core',
    teach: 'Black walls block arrows. Plan extraction around them.',
    fixedPositions: [{ row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 }], seed: 7,
  },
  {
    id: 8, slug: 'lattice', title: 'Lattice', rows: 5, cols: 5, arrowCount: 4,
    walls: [{ row: 2, col: 2 }], hintsAllowed: 2, subtitle: 'A single wall at the centre.', tier: 'core',
    fixedPositions: [{ row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 4 }, { row: 4, col: 2 }], seed: 8,
  },
  {
    id: 9, slug: 'twin-lanes', title: 'Twin Lanes', rows: 5, cols: 5, arrowCount: 4, walls: [],
    hintsAllowed: 2, subtitle: 'Lanes intersect — order matters.', tier: 'core',
    fixedPositions: [{ row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 }], seed: 9,
  },
  {
    id: 10, slug: 'cornered', title: 'Cornered', rows: 4, cols: 4, arrowCount: 4, walls: [],
    hintsAllowed: 2, subtitle: 'Each arrow blocks another.', tier: 'core',
    fixedPositions: [{ row: 0, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 2 }, { row: 2, col: 0 }], seed: 10,
  },
  {
    id: 11, slug: 'inner-square', title: 'Inner Square', rows: 5, cols: 5, arrowCount: 4, walls: [],
    hintsAllowed: 2, subtitle: 'A square that turns inward.', tier: 'core',
    fixedPositions: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 3 }, { row: 3, col: 1 }], seed: 11,
  },
  {
    id: 12, slug: 'gatekeeper', title: 'Gatekeeper', rows: 5, cols: 5, arrowCount: 5,
    walls: [{ row: 1, col: 2 }, { row: 3, col: 2 }],
    hintsAllowed: 2, subtitle: 'The centre must rise before the sides.', tier: 'core',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 }, { row: 2, col: 2 },
    ], seed: 12,
  },
  {
    id: 13, slug: 'three-deep', title: 'Three Deep', rows: 5, cols: 5, arrowCount: 6, walls: [],
    hintsAllowed: 2, subtitle: 'Six arrows, one calm order.', tier: 'core',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 2, col: 1 }, { row: 2, col: 3 },
      { row: 4, col: 0 }, { row: 4, col: 4 },
    ], seed: 13,
  },
  {
    id: 14, slug: 'windmill', title: 'Windmill', rows: 5, cols: 5, arrowCount: 4,
    walls: [{ row: 2, col: 2 }], hintsAllowed: 2,
    subtitle: 'The wall at centre turns the wheel.', tier: 'core',
    fixedPositions: [{ row: 0, col: 2 }, { row: 2, col: 4 }, { row: 4, col: 2 }, { row: 2, col: 0 }], seed: 14,
  },

  // ADVANCED
  {
    id: 15, slug: 'crosshatch', title: 'Crosshatch', rows: 6, cols: 6, arrowCount: 6,
    walls: [{ row: 2, col: 4 }, { row: 3, col: 1 }],
    hintsAllowed: 2, subtitle: 'Layers within layers.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 5 },
      { row: 2, col: 2 }, { row: 3, col: 3 },
    ], seed: 15,
  },
  {
    id: 16, slug: 'cul-de-sac', title: 'Cul-de-sac', rows: 5, cols: 5, arrowCount: 6,
    walls: [{ row: 1, col: 3 }, { row: 3, col: 1 }],
    hintsAllowed: 2, subtitle: 'Walls create pockets — find what frees them.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 },
      { row: 1, col: 1 }, { row: 3, col: 3 },
    ], seed: 16,
  },
  {
    id: 17, slug: 'mirror', title: 'Mirror', rows: 6, cols: 6, arrowCount: 6,
    walls: [{ row: 1, col: 2 }, { row: 1, col: 3 }, { row: 4, col: 2 }, { row: 4, col: 3 }],
    hintsAllowed: 3, subtitle: 'A symmetry that deceives.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 5 },
      { row: 2, col: 2 }, { row: 3, col: 3 },
    ], seed: 17,
  },
  {
    id: 18, slug: 'long-shot', title: 'Long Shot', rows: 6, cols: 6, arrowCount: 6,
    walls: [{ row: 2, col: 3 }, { row: 3, col: 2 }],
    hintsAllowed: 3, subtitle: 'Long lanes reward patient order.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 5 },
      { row: 2, col: 0 }, { row: 3, col: 5 },
    ], seed: 18,
  },
  {
    id: 19, slug: 'spokes', title: 'Spokes', rows: 7, cols: 7, arrowCount: 8,
    walls: [{ row: 3, col: 3 }],
    hintsAllowed: 3, subtitle: 'Eight arrows radiating from a still centre.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 3 }, { row: 6, col: 3 }, { row: 3, col: 0 }, { row: 3, col: 6 },
      { row: 1, col: 1 }, { row: 5, col: 5 }, { row: 1, col: 5 }, { row: 5, col: 1 },
    ], seed: 19,
  },
  {
    id: 20, slug: 'the-weave', title: 'The Weave', rows: 6, cols: 6, arrowCount: 6,
    walls: [{ row: 2, col: 2 }, { row: 3, col: 3 }],
    hintsAllowed: 3, subtitle: 'Threads cross. Untangle them.', tier: 'advanced',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 2 }, { row: 0, col: 4 },
      { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 },
    ], seed: 20,
  },

  // EXPERT
  {
    id: 21, slug: 'floodgate', title: 'Floodgate', rows: 7, cols: 7, arrowCount: 8,
    walls: [{ row: 3, col: 3 }, { row: 1, col: 3 }, { row: 5, col: 3 }],
    hintsAllowed: 3, subtitle: 'Open the gate in the right sequence.', tier: 'expert',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 6 }, { row: 6, col: 0 }, { row: 6, col: 6 },
      { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 4, col: 2 }, { row: 4, col: 4 },
    ], seed: 21,
  },
  {
    id: 22, slug: 'two-islands', title: 'Two Islands', rows: 7, cols: 7, arrowCount: 6,
    walls: [{ row: 1, col: 3 }, { row: 5, col: 3 }],
    hintsAllowed: 3, subtitle: 'Two chambers, one logic.', tier: 'expert',
    fixedPositions: [
      { row: 0, col: 1 }, { row: 0, col: 5 }, { row: 3, col: 3 },
      { row: 6, col: 1 }, { row: 6, col: 5 }, { row: 3, col: 0 },
    ], seed: 22,
  },
  {
    id: 23, slug: 'concert', title: 'Concert', rows: 7, cols: 7, arrowCount: 8,
    walls: [{ row: 3, col: 3 }],
    hintsAllowed: 3, subtitle: 'Eight voices, one resolution.', tier: 'expert',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 3 }, { row: 0, col: 6 },
      { row: 3, col: 0 }, { row: 3, col: 6 },
      { row: 6, col: 0 }, { row: 6, col: 3 }, { row: 6, col: 6 },
    ], seed: 23,
  },
  {
    id: 24, slug: 'final-bow', title: 'Final Bow', rows: 8, cols: 8, arrowCount: 10,
    walls: [{ row: 3, col: 3 }, { row: 4, col: 4 }],
    hintsAllowed: 3, subtitle: 'The closing movement.', tier: 'expert',
    fixedPositions: [
      { row: 0, col: 0 }, { row: 0, col: 7 }, { row: 7, col: 0 }, { row: 7, col: 7 },
      { row: 2, col: 2 }, { row: 2, col: 5 }, { row: 5, col: 2 }, { row: 5, col: 5 },
      { row: 3, col: 4 }, { row: 4, col: 3 },
    ], seed: 24,
  },
];

// Generate levels. Retry with a different seed on failure.
const generated: Level[] = [];
for (const spec of SPECS) {
  let level: Level | null = null;
  for (let attempt = 0; attempt < 2000 && !level; attempt++) {
    level = generate({ ...spec, seed: spec.seed + attempt * 997 });
  }
  if (!level) {
    console.error(`✗ Failed to generate level ${spec.id} "${spec.title}"`);
    process.exit(1);
  }
  generated.push(level);
  console.log(`✓ Level ${spec.id} "${spec.title}" — ${spec.tier} — ${level.arrows.length} arrows`);
}

// Output TypeScript.
const out: string[] = [];
out.push('// 24 handcrafted Arrows levels — every level verified solvable.');
out.push('// Mechanic: tap an arrow → it slides in its direction until it exits.');
out.push('// Walls and other arrows block the slide. Player finds a valid order.');
out.push('');
out.push("import type { Arrow, Level } from './types';");
out.push('');
out.push('let _id = 0;');
out.push("const aid = () => `a${++_id}`;");
out.push('');
out.push("const arrow = (row: number, col: number, direction: Arrow['direction']): Arrow => ({ id: aid(), row, col, direction });");
out.push('');
out.push('export const LEVELS: Level[] = [');
for (const level of generated) {
  const arrowsStr = level.arrows
    .map((a) => `arrow(${a.row}, ${a.col}, '${a.direction}')`)
    .join(', ');
  const wallsStr = level.walls.map((w) => `{ row: ${w.row}, col: ${w.col} }`).join(', ');
  out.push('  {');
  out.push(`    id: ${level.id},`);
  out.push(`    slug: '${level.slug}',`);
  out.push(`    title: '${level.title}',`);
  out.push(`    rows: ${level.rows},`);
  out.push(`    cols: ${level.cols},`);
  out.push(`    arrows: [${arrowsStr}],`);
  out.push(`    walls: [${wallsStr}],`);
  out.push(`    hintsAllowed: ${level.hintsAllowed},`);
  out.push(`    subtitle: '${level.subtitle.replace(/'/g, "\\'")}',`);
  out.push(`    tier: '${level.tier}',`);
  if (level.teach) {
    out.push(`    teach: '${level.teach.replace(/'/g, "\\'")}',`);
  }
  out.push('  },');
}
out.push('];');
out.push('');
out.push('export const getLevelBySlug = (slug: string) => LEVELS.find((l) => l.slug === slug);');
out.push('export const getLevelById = (id: number) => LEVELS.find((l) => l.id === id);');

writeFileSync('/home/z/my-project/src/lib/game/levels.ts', out.join('\n') + '\n');
console.log('\nWrote generated levels to src/lib/game/levels.ts');
