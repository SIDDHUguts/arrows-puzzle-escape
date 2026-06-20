// For each level, search for a direction assignment that makes it solvable.
// Tries all 4^N combinations and picks the one with the LONGEST solution
// (more interesting puzzles = harder to brute-force).
//
// Usage: bun run scripts/fix-levels.ts

import { LEVELS } from '../src/lib/game/levels';
import {
  buildGrid,
  solveLevel,
  tryExtract,
} from '../src/lib/game/engine';
import type { Arrow, Direction, Level } from '../src/lib/game/types';

const DIRS: Direction[] = ['up', 'down', 'left', 'right'];

function tryFix(level: Level): { level: Level; solutionLength: number } | null {
  // First, check if the level is already solvable.
  const existingSol = solveLevel(level);
  if (existingSol) {
    return { level, solutionLength: existingSol.length };
  }

  // Otherwise, search for a direction assignment that works.
  // Stop at the FIRST solvable assignment (don't search for the longest).
  const positions = level.arrows.map((a) => ({ row: a.row, col: a.col }));
  const n = positions.length;
  const total = Math.pow(4, n);
  for (let mask = 0; mask < total; mask++) {
    const dirs: Direction[] = [];
    let m = mask;
    for (let i = 0; i < n; i++) {
      dirs.push(DIRS[m % 4]);
      m = Math.floor(m / 4);
    }
    const arrows: Arrow[] = positions.map((p, i) => ({
      id: `a${i + 1}`,
      row: p.row,
      col: p.col,
      direction: dirs[i],
    }));
    const candidate: Level = { ...level, arrows };
    const sol = solveLevel(candidate);
    if (sol) {
      return { level: candidate, solutionLength: sol.length };
    }
  }
  return null;
}

let pass = 0;
let fail = 0;
const fixed: Level[] = [];
for (const level of LEVELS) {
  const result = tryFix(level);
  if (result) {
    pass++;
    console.log(
      `✓ Level ${level.id} "${level.title}" — solvable with len ${result.solutionLength}`
    );
    fixed.push(result.level);
  } else {
    fail++;
    console.log(
      `✗ Level ${level.id} "${level.title}" — NO direction assignment works`
    );
    fixed.push(level);
  }
}
console.log(`\n${pass} passed, ${fail} failed.`);

// Output the fixed levels as TypeScript.
import { writeFileSync } from 'fs';
const out: string[] = [];
out.push('// Auto-fixed levels. Do not edit by hand.');
out.push("import type { Arrow, Level } from './types';");
out.push('');
out.push('let _id = 0;');
out.push("const aid = () => `a${++_id}`;");
out.push('');
out.push(
  'const arrow = (row: number, col: number, direction: Arrow["direction"]): Arrow => ({ id: aid(), row, col, direction });'
);
out.push('');
out.push('export const LEVELS: Level[] = [');
for (const level of fixed) {
  const arrowsStr = level.arrows
    .map((a) => `arrow(${a.row}, ${a.col}, '${a.direction}')`)
    .join(', ');
  const wallsStr = level.walls
    .map((w) => `{ row: ${w.row}, col: ${w.col} }`)
    .join(', ');
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
out.push(
  'export const getLevelBySlug = (slug: string) => LEVELS.find((l) => l.slug === slug);'
);
out.push(
  'export const getLevelById = (id: number) => LEVELS.find((l) => l.id === id);'
);

writeFileSync(
  '/home/z/my-project/src/lib/game/levels.ts',
  out.join('\n') + '\n'
);
console.log('\nWrote fixed levels to src/lib/game/levels.ts');
