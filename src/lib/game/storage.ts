// LocalStorage persistence for level progress.

import type { Level, ProgressMap } from './types';

const STORAGE_KEY = 'arrows.progress.v1';
const SEEN_TEACH_KEY = 'arrows.teach.v1';

const empty: ProgressMap = {};

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return empty;
  }
}

export function saveProgress(progress: ProgressMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function defaultProgressFor(_level: Level) {
  return { solved: false, bestMoves: null, hintsUsed: 0, trophies: 0 };
}

export function hasSeenTeach(slug: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(SEEN_TEACH_KEY);
    if (!raw) return false;
    const set = new Set<string>(JSON.parse(raw));
    return set.has(slug);
  } catch {
    return false;
  }
}

export function markSeenTeach(slug: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SEEN_TEACH_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(slug)) {
      arr.push(slug);
      window.localStorage.setItem(SEEN_TEACH_KEY, JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
}

export const tierOrder = ['intro', 'core', 'advanced', 'expert'] as const;
export const tierLabel: Record<(typeof tierOrder)[number], string> = {
  intro: 'Intro',
  core: 'Core',
  advanced: 'Advanced',
  expert: 'Expert',
};

export function progressStats(progress: ProgressMap) {
  let solved = 0;
  let totalTrophies = 0;
  for (const key of Object.keys(progress)) {
    const p = progress[key];
    if (p.solved) solved++;
    totalTrophies += p.trophies || 0;
  }
  return { solved, totalTrophies };
}
