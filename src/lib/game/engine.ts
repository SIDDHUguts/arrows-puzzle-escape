// Pure game logic for the Arrows puzzle.
// No React, no DOM — easy to test and reuse.

import type {
  Arrow,
  Direction,
  ExtractResult,
  Level,
} from './types';

export interface RuntimeGrid {
  rows: number;
  cols: number;
  walls: Set<string>;
  /** arrowId by cell key "r,c" — empty string when no arrow. */
  arrows: Map<string, Arrow>;
}

export const key = (r: number, c: number) => `${r},${c}`;

export function buildGrid(level: Level, arrows: Arrow[]): RuntimeGrid {
  const walls = new Set<string>();
  for (const w of level.walls) walls.add(key(w.row, w.col));
  const map = new Map<string, Arrow>();
  for (const a of arrows) map.set(key(a.row, a.col), a);
  return { rows: level.rows, cols: level.cols, walls, arrows: map };
}

const DELTA: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

/**
 * Attempt to extract an arrow from the grid.
 * The arrow slides in its direction one cell at a time.
 * If it would enter a wall or another arrow's cell, the move is rejected
 * (preserves the relaxing, stress-free feel — no fail screen).
 * If it reaches outside the grid, the extraction succeeds.
 */
export function tryExtract(
  grid: RuntimeGrid,
  arrowId: string
): ExtractResult {
  const arrow = [...grid.arrows.values()].find((a) => a.id === arrowId);
  if (!arrow) return { ok: false, reason: 'not-found' };

  const { dr, dc } = DELTA[arrow.direction];
  const path: Array<{ row: number; col: number }> = [
    { row: arrow.row, col: arrow.col },
  ];
  let r = arrow.row;
  let c = arrow.col;

  // Cap iterations at grid size + 1 to avoid infinite loops.
  const maxSteps = grid.rows * grid.cols + 1;
  for (let i = 0; i < maxSteps; i++) {
    const nr = r + dr;
    const nc = c + dc;
    // Exiting the grid → success.
    if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) {
      path.push({ row: nr, col: nc });
      return { ok: true, path };
    }
    // Wall blocks.
    if (grid.walls.has(key(nr, nc))) {
      return {
        ok: false,
        reason: 'blocked',
        blockingCell: { row: nr, col: nc, kind: 'wall' },
      };
    }
    // Another arrow blocks.
    const occupant = grid.arrows.get(key(nr, nc));
    if (occupant && occupant.id !== arrow.id) {
      return {
        ok: false,
        reason: 'blocked',
        blockingCell: {
          row: nr,
          col: nc,
          kind: 'arrow',
          arrowId: occupant.id,
        },
      };
    }
    path.push({ row: nr, col: nc });
    r = nr;
    c = nc;
  }
  return { ok: false, reason: 'blocked' };
}

/**
 * Solver: returns ONE valid extraction order if it exists, else null.
 * Used to power the hint system.
 * Brute-force permutation search — fine for small arrow counts (<=8).
 */
export function solveLevel(level: Level): string[] | null {
  const arrows = [...level.arrows];
  const result = searchSolution(level, arrows, []);
  return result;
}

function searchSolution(
  level: Level,
  remaining: Arrow[],
  order: string[]
): string[] | null {
  if (remaining.length === 0) return order;
  const grid = buildGrid(level, remaining);
  for (const a of remaining) {
    const r = tryExtract(grid, a.id);
    if (r.ok) {
      const next = remaining.filter((x) => x.id !== a.id);
      const sub = searchSolution(level, next, [...order, a.id]);
      if (sub) return sub;
    }
  }
  return null;
}

/**
 * Pick the next correct arrow to extract, given the current state.
 * Returns the arrowId, or null if the level is already unsolvable from here.
 */
export function nextHintMove(level: Level, arrows: Arrow[]): string | null {
  if (arrows.length === 0) return null;
  const grid = buildGrid(level, arrows);
  for (const a of arrows) {
    const r = tryExtract(grid, a.id);
    if (r.ok) {
      // Verify a complete solution still exists from this branch —
      // only recommend moves that lead to a win.
      const remaining = arrows.filter((x) => x.id !== a.id);
      if (searchSolution(level, remaining, [a.id])) {
        return a.id;
      }
    }
  }
  return null;
}

export function isSolved(arrows: Arrow[]): boolean {
  return arrows.length === 0;
}

/**
 * Trophies (stars) awarded based on move efficiency.
 * Optimal = moves equals minimum required (3 stars).
 */
export function computeTrophies(
  moves: number,
  arrowCount: number
): number {
  if (moves <= arrowCount) return 3;
  if (moves <= arrowCount + 2) return 2;
  return 1;
}
