'use client';

// Zustand store for the Arrows game state.

import { create } from 'zustand';
import { LEVELS } from '@/lib/game/levels';
import {
  buildGrid,
  computeTrophies,
  nextHintMove,
  tryExtract,
} from '@/lib/game/engine';
import type { Arrow, ExtractResult, Level, ProgressMap } from '@/lib/game/types';
import {
  hasSeenTeach,
  loadProgress,
  markSeenTeach,
  saveProgress,
} from '@/lib/game/storage';

export type Screen = 'landing' | 'level-select' | 'play';

interface GameState {
  screen: Screen;
  currentLevel: Level | null;
  arrows: Arrow[];
  moveCount: number;
  hintsUsed: number;
  hintArrowId: string | null;
  extracting: string | null;
  lastResult: ExtractResult | null;
  showTeach: boolean;
  showWin: boolean;
  progress: ProgressMap;
  showSettings: boolean;
  showAdModal: boolean;
  showIapModal: boolean;

  goToLanding: () => void;
  goToLevelSelect: () => void;
  loadLevel: (level: Level) => void;
  extract: (arrowId: string) => void;
  restart: () => void;
  useHint: () => void;
  closeTeach: () => void;
  closeWin: () => void;
  nextLevel: () => void;
  openSettings: (open: boolean) => void;
  openAdModal: (open: boolean) => void;
  openIapModal: (open: boolean) => void;
  resetAllProgress: () => void;
}

export const useArrowsGame = create<GameState>((set, get) => ({
  screen: 'landing',
  currentLevel: null,
  arrows: [],
  moveCount: 0,
  hintsUsed: 0,
  hintArrowId: null,
  extracting: null,
  lastResult: null,
  showTeach: false,
  showWin: false,
  progress: {},
  showSettings: false,
  showAdModal: false,
  showIapModal: false,

  goToLanding: () => set({ screen: 'landing' }),
  goToLevelSelect: () => set({ screen: 'level-select' }),

  loadLevel: (level) => {
    // Deep clone arrows so we never mutate the level definition.
    const arrows: Arrow[] = level.arrows.map((a) => ({ ...a }));
    const teach = level.teach ? !hasSeenTeach(level.slug) : false;
    set({
      currentLevel: level,
      arrows,
      moveCount: 0,
      hintsUsed: 0,
      hintArrowId: null,
      extracting: null,
      lastResult: null,
      showTeach: teach,
      showWin: false,
      screen: 'play',
    });
  },

  extract: (arrowId) => {
    const state = get();
    if (state.extracting || state.showWin) return;
    const level = state.currentLevel;
    if (!level) return;
    const grid = buildGrid(level, state.arrows);
    const result = tryExtract(grid, arrowId);
    if (!result.ok) {
      set({ lastResult: result, hintArrowId: null });
      // Auto-clear the "blocked" indicator after a brief moment.
      window.setTimeout(() => {
        if (get().lastResult === result) set({ lastResult: null });
      }, 900);
      return;
    }
    const arrow = state.arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    set({
      extracting: arrowId,
      lastResult: null,
      hintArrowId: null,
    });
    // Synced with the CSS animation in ArrowGrid (0.7s) + a small buffer.
    const duration = 780;
    window.setTimeout(() => {
      const cur = get();
      const remaining = cur.arrows.filter((a) => a.id !== arrowId);
      const moveCount = cur.moveCount + 1;
      if (remaining.length === 0) {
        // Solved.
        const trophies = computeTrophies(moveCount, level.arrows.length);
        const prev = cur.progress[level.slug];
        const updated: ProgressMap = {
          ...cur.progress,
          [level.slug]: {
            solved: true,
            bestMoves:
              prev?.bestMoves == null
                ? moveCount
                : Math.min(prev.bestMoves, moveCount),
            hintsUsed: Math.min(
              prev?.hintsUsed ?? Infinity,
              cur.hintsUsed
            ),
            trophies: Math.max(prev?.trophies ?? 0, trophies),
          },
        };
        saveProgress(updated);
        set({
          arrows: remaining,
          moveCount,
          extracting: null,
          showWin: true,
          progress: updated,
        });
      } else {
        set({ arrows: remaining, moveCount, extracting: null });
      }
    }, duration);
  },

  restart: () => {
    const level = get().currentLevel;
    if (!level) return;
    const arrows: Arrow[] = level.arrows.map((a) => ({ ...a }));
    set({
      arrows,
      moveCount: 0,
      hintsUsed: 0,
      hintArrowId: null,
      extracting: null,
      lastResult: null,
      showWin: false,
    });
  },

  useHint: () => {
    const state = get();
    if (!state.currentLevel) return;
    if (state.hintsUsed >= state.currentLevel.hintsAllowed) return;
    const hint = nextHintMove(state.currentLevel, state.arrows);
    if (!hint) return;
    set({ hintArrowId: hint, hintsUsed: state.hintsUsed + 1 });
    // Auto-clear hint highlight after a few seconds.
    window.setTimeout(() => {
      if (get().hintArrowId === hint) set({ hintArrowId: null });
    }, 4500);
  },

  closeTeach: () => {
    const level = get().currentLevel;
    if (level) markSeenTeach(level.slug);
    set({ showTeach: false });
  },

  closeWin: () => set({ showWin: false }),
  nextLevel: () => {
    const cur = get().currentLevel;
    if (!cur) return;
    const idx = LEVELS.findIndex((l) => l.id === cur.id);
    const next = LEVELS[idx + 1];
    if (next) get().loadLevel(next);
    else set({ showWin: false, screen: 'level-select' });
  },

  openSettings: (open) => set({ showSettings: open }),
  openAdModal: (open) => set({ showAdModal: open }),
  openIapModal: (open) => set({ showIapModal: open }),

  resetAllProgress: () => {
    saveProgress({});
    set({ progress: {} });
  },
}));

// Hydrate progress on the client (call once on mount).
export function hydrateProgress() {
  const progress = loadProgress();
  useArrowsGame.setState({ progress });
}
