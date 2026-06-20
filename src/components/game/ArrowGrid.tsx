'use client';

// The interactive Arrows grid.

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowGlyph } from './ArrowGlyph';
import { useArrowsGame } from '@/hooks/use-arrows-game';
import { key } from '@/lib/game/engine';
import type { Arrow, Level } from '@/lib/game/types';

interface Props {
  level: Level;
  arrows: Arrow[];
}

const CELL_BASE = 64; // px on desktop; CSS will scale down on small screens via container queries.

export function ArrowGrid({ level, arrows }: Props) {
  const { extract, extracting, hintArrowId, lastResult } = useArrowsGame();
  const wallSet = new Set(level.walls.map((w) => key(w.row, w.col)));
  const arrowMap = new Map<string, Arrow>();
  for (const a of arrows) arrowMap.set(key(a.row, a.col), a);

  // Determine the cell currently being extracted so we can render its traveling arrow.
  const extractingArrow = extracting
    ? arrows.find((a) => a.id === extracting)
    : null;

  return (
    <div
      className="relative mx-auto"
      style={{
        // CSS grid scales with viewport.
        width: 'min(92vw, 520px)',
        aspectRatio: `${level.cols} / ${level.rows}`,
      }}
    >
      <div
        className="grid w-full h-full gap-[2px] bg-neutral-200 dark:bg-neutral-800 p-[2px] rounded-sm"
        style={{
          gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
          gridTemplateRows: `repeat(${level.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: level.rows * level.cols }).map((_, idx) => {
          const r = Math.floor(idx / level.cols);
          const c = idx % level.cols;
          const k = key(r, c);
          const isWall = wallSet.has(k);
          const arrow = arrowMap.get(k);
          const isExtracting = arrow?.id === extracting;
          const isHinted = arrow?.id === hintArrowId;
          const isBlocking =
            lastResult &&
            !lastResult.ok &&
            lastResult.blockingCell &&
            lastResult.blockingCell.row === r &&
            lastResult.blockingCell.col === c;

          return (
            <div
              key={k}
              className={[
                'relative flex items-center justify-center transition-colors',
                isWall
                  ? 'bg-neutral-900 dark:bg-neutral-100'
                  : 'bg-white dark:bg-neutral-950',
              ].join(' ')}
            >
              {!isWall && arrow && !isExtracting && (
                <motion.button
                  type="button"
                  onClick={() => extract(arrow.id)}
                  initial={false}
                  animate={
                    isHinted
                      ? { scale: [1, 1.08, 1] }
                      : isBlocking
                        ? { x: [0, -3, 3, -3, 3, 0] }
                        : { scale: 1 }
                  }
                  transition={{
                    duration: isHinted ? 1.2 : isBlocking ? 0.4 : 0.3,
                    repeat: isHinted ? Infinity : 0,
                  }}
                  className={[
                    'absolute inset-1 flex items-center justify-center rounded-sm',
                    'text-neutral-900 dark:text-neutral-100',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-900',
                    'transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400',
                    isHinted
                      ? 'bg-neutral-100 dark:bg-neutral-900 ring-1 ring-neutral-900 dark:ring-neutral-100'
                      : '',
                  ].join(' ')}
                  aria-label={`Arrow ${arrow.direction} at row ${r + 1}, column ${c + 1}`}
                >
                  <ArrowGlyph direction={arrow.direction} size={28} />
                </motion.button>
              )}
              {isWall && (
                <div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-100" />
              )}
            </div>
          );
        })}
      </div>

      {/* Travelling arrow overlay (extract animation) */}
      <AnimatePresence>
        {extractingArrow && (
          <ExtractOverlay
            key={extractingArrow.id}
            arrow={extractingArrow}
            rows={level.rows}
            cols={level.cols}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExtractOverlay({
  arrow,
  rows,
  cols,
}: {
  arrow: Arrow;
  rows: number;
  cols: number;
}) {
  // Animate `left`/`top` (percentages of the parent container) so the arrow
  // travels from its current cell to outside the grid.
  const dir = arrow.direction;
  const startX = (arrow.col / cols) * 100;
  const startY = (arrow.row / rows) * 100;
  let endX = startX;
  let endY = startY;
  if (dir === 'right') endX = 105;
  if (dir === 'left') endX = -5;
  if (dir === 'down') endY = 105;
  if (dir === 'up') endY = -5;

  return (
    <motion.div
      className="pointer-events-none absolute flex items-center justify-center text-neutral-900 dark:text-neutral-100"
      style={{
        width: `${100 / cols}%`,
        height: `${100 / rows}%`,
      }}
      initial={{ left: `${startX}%`, top: `${startY}%`, opacity: 1 }}
      animate={{ left: `${endX}%`, top: `${endY}%`, opacity: [1, 1, 0.5] }}
      transition={{
        duration: 0.7,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      <ArrowGlyph direction={dir} size={28} />
    </motion.div>
  );
}
