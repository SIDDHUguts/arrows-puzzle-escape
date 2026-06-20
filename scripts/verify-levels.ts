// Verify all levels are solvable using the engine's solver.
// Run with: bun run /home/z/my-project/scripts/verify-levels.ts

import { LEVELS } from '../src/lib/game/levels';
import { solveLevel, buildGrid, tryExtract } from '../src/lib/game/engine';

let pass = 0;
let fail = 0;
for (const level of LEVELS) {
  const solution = solveLevel(level);
  if (solution) {
    // Verify the solution actually works step-by-step.
    let arrows = [...level.arrows];
    let ok = true;
    for (const arrowId of solution) {
      const grid = buildGrid(level, arrows);
      const r = tryExtract(grid, arrowId);
      if (!r.ok) { ok = false; break; }
      arrows = arrows.filter(a => a.id !== arrowId);
    }
    if (ok && arrows.length === 0) {
      pass++;
      console.log(`✓ Level ${level.id} "${level.title}" — ${level.tier} — solution length ${solution.length}`);
    } else {
      fail++;
      console.log(`✗ Level ${level.id} "${level.title}" — solver returned a solution but verification failed`);
    }
  } else {
    fail++;
    console.log(`✗ Level ${level.id} "${level.title}" — ${level.tier} — NO SOLUTION FOUND`);
  }
}
console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
