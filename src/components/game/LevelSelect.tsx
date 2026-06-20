'use client';

// Level select grid grouped by tier.

import { Check, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useArrowsGame } from '@/hooks/use-arrows-game';
import { LEVELS } from '@/lib/game/levels';
import { tierLabel, tierOrder, progressStats } from '@/lib/game/storage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function LevelSelect() {
  const { loadLevel, progress, goToLanding } = useArrowsGame();
  const stats = progressStats(progress);

  // A level is unlocked if it's the first level, OR the previous level is solved.
  const isUnlocked = (levelId: number) => {
    if (levelId === 1) return true;
    const prev = LEVELS.find((l) => l.id === levelId - 1);
    if (!prev) return false;
    return progress[prev.slug]?.solved === true;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToLanding}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Home
          </Button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Select a level
            </div>
            <div className="text-sm font-medium">
              {stats.solved} / {LEVELS.length} solved
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Star className="h-3.5 w-3.5" />
            <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
              {stats.totalTrophies}
            </span>
            <span className="text-neutral-400">/{LEVELS.length * 3}</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
          {tierOrder.map((tier) => {
            const tierLevels = LEVELS.filter((l) => l.tier === tier);
            return (
              <section key={tier}>
                <h2 className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4">
                  {tierLabel[tier]}
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {tierLevels.map((level) => {
                    const unlocked = isUnlocked(level.id);
                    const lp = progress[level.slug];
                    const solved = lp?.solved === true;
                    const trophies = lp?.trophies ?? 0;
                    return (
                      <motion.button
                        key={level.id}
                        whileHover={unlocked ? { scale: 1.03 } : undefined}
                        whileTap={unlocked ? { scale: 0.97 } : undefined}
                        onClick={() => unlocked && loadLevel(level)}
                        disabled={!unlocked}
                        className={[
                          'relative aspect-square rounded-md border flex flex-col items-center justify-center gap-1',
                          'transition-colors',
                          solved
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900'
                            : unlocked
                              ? 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-neutral-950'
                              : 'border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950 opacity-60 cursor-not-allowed',
                        ].join(' ')}
                        aria-label={
                          unlocked
                            ? `Play level ${level.id}: ${level.title}`
                            : `Level ${level.id} locked`
                        }
                      >
                        {!unlocked ? (
                          <Lock className="h-3 w-3 text-neutral-400" />
                        ) : solved ? (
                          <Check className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100" />
                        ) : (
                          <span className="text-xs tabular-nums text-neutral-500">
                            {level.id}
                          </span>
                        )}
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <Star
                              key={i}
                              className={
                                i < trophies
                                  ? 'h-2 w-2 fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100'
                                  : 'h-2 w-2 text-neutral-300 dark:text-neutral-700'
                              }
                            />
                          ))}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
