# Project Worklog — Arrows: Puzzle Escape (Investor Prototype)

---
Task ID: 1
Agent: Super Z (main)
Task: Build a playable web prototype of "Arrows — Puzzle Escape" for investors. Full prototype with 20+ levels, minimalist mono visual style, English, with all five core mechanics (basic extract, collision rule, directional types, obstacles, hints).

Work Log:
- Initialized Next.js 16 project via `fullstack-dev` skill (dev server up on port 3000).
- Designed pure game engine in `src/lib/game/`:
  - `types.ts` — Direction, Arrow, Level, Progress types.
  - `engine.ts` — `tryExtract`, `solveLevel` (DFS brute-force), `nextHintMove`, `computeTrophies`.
  - `storage.ts` — localStorage persistence for level progress + seen-teach flags.
- Built 24 levels via constructive generator (`scripts/generate-levels.ts`):
  - Forward-construction algorithm with path reservation to create REAL blocking dependencies.
  - Weighted-random direction selection (linear in path length) for variety.
  - All 24 levels verified solvable via `scripts/verify-levels.ts` (solution lengths 1–10).
  - 4 tiers: intro (1–6), core (7–14), advanced (15–20), expert (21–24).
  - Largest grid: 8×8 with 10 arrows (Level 24 "Final Bow").
- Zustand store in `src/hooks/use-arrows-game.ts` for game state (screen, arrows, moves, hints, modals, progress).
- UI components in `src/components/game/`:
  - `ArrowGlyph.tsx` — minimalist SVG arrow, rotates per direction.
  - `ArrowGrid.tsx` — interactive grid + framer-motion extract animation overlay + blocked shake + hint pulse.
  - `GameHud.tsx` — top bar (level, moves, trophies, hint, restart).
  - `GameModals.tsx` — teach, win, settings, ad, IAP (all backdropped).
  - `LevelSelect.tsx` — tier-grouped grid with progressive unlock + trophies.
  - `Landing.tsx` — investor landing page (hero, pillars, feature grid, monetization breakdown, KPI strip, CTA, footer).
- Single-page composition in `src/app/page.tsx` switches between landing / level-select / play.
- Layout uses Inter font, minimalist color tokens (oklch grayscale), tighter radius (0.375rem) for cleaner look.
- All UI text in English with elegant/calm tone per spec.

Stage Summary:
- Lint: passes (`bun run lint`).
- Dev server: healthy, 200 OK in ~35ms.
- Browser-verified flows: landing render → play level 1 → extract arrow → win modal → next level → level select (with progressive unlock) → settings → ad modal → IAP modal → hint decrements → blocked move rejected with shake.
- Mobile responsive: 390×844 viewport, no horizontal overflow, even on 8×8 Level 24.
- All 24 levels solvable; hint system uses solver to recommend next correct move.
- No runtime errors in browser console or dev.log.
- Deliverable: live Next.js app at the preview URL (Open in New Tab to view externally).
