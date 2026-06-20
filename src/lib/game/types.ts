// Core type definitions for the Arrows puzzle game.

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CellType = 'empty' | 'wall';

export interface Arrow {
  id: string;
  row: number;
  col: number;
  direction: Direction;
  /** Color group — used for visual variety in advanced levels. */
  group?: 1 | 2 | 3;
}

export interface Level {
  id: number;
  /** Stable slug used for localStorage keys. */
  slug: string;
  title: string;
  rows: number;
  cols: number;
  arrows: Arrow[];
  walls: Array<{ row: number; col: number }>;
  /** Soft cap on hints per attempt. */
  hintsAllowed: number;
  /** Short atmospheric subtitle shown in the HUD. */
  subtitle: string;
  /** Difficulty tier drives the level-select grouping. */
  tier: 'intro' | 'core' | 'advanced' | 'expert';
  /** Optional teaching note shown the first time the level is opened. */
  teach?: string;
}

export interface LevelProgress {
  solved: boolean;
  bestMoves: number | null;
  hintsUsed: number;
  trophies: number; // 0–3 stars based on efficiency
}

export type ProgressMap = Record<string, LevelProgress>;

export interface ExtractionStep {
  arrowId: string;
  /** The full path the arrow takes from start to exit, in cell coordinates. */
  path: Array<{ row: number; col: number }>;
}

export type ExtractResult =
  | { ok: true; path: Array<{ row: number; col: number }> }
  | { ok: false; reason: 'blocked' | 'not-found'; blockingCell?: { row: number; col: number; kind: 'wall' | 'arrow'; arrowId?: string } };
