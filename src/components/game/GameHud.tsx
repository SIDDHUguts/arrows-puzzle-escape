'use client';

// Top bar shown while playing a level.

import { ArrowLeft, Lightbulb, RotateCcw, Settings, Trophy } from 'lucide-react';
import { useArrowsGame } from '@/hooks/use-arrows-game';
import { Button } from '@/components/ui/button';

export function GameHud() {
  const {
    currentLevel,
    moveCount,
    hintsUsed,
    useHint,
    restart,
    goToLevelSelect,
    openSettings,
    progress,
  } = useArrowsGame();
  if (!currentLevel) return null;
  const lp = progress[currentLevel.slug];
  const hintsLeft = Math.max(0, currentLevel.hintsAllowed - hintsUsed);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToLevelSelect}
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Levels
        </Button>

        <div className="flex-1 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Level {currentLevel.id}
          </div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {currentLevel.title}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => openSettings(true)}
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span className="tabular-nums">
          Moves <span className="text-neutral-900 dark:text-neutral-100">{moveCount}</span>
        </span>
        <span className="italic text-neutral-400">{currentLevel.subtitle}</span>
        <span className="flex items-center gap-1 tabular-nums">
          <Trophy className="h-3.5 w-3.5" />
          <span className="text-neutral-900 dark:text-neutral-100">
            {lp?.trophies ?? 0}
          </span>
          <span className="text-neutral-400">/3</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={useHint}
          disabled={hintsLeft === 0}
          className="gap-1.5"
        >
          <Lightbulb className="h-4 w-4" />
          Hint
          <span className="text-neutral-400 tabular-nums">{hintsLeft}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={restart}
          className="gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>
    </div>
  );
}
