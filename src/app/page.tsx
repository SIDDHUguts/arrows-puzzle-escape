'use client';

import { useEffect } from 'react';
import { useArrowsGame, hydrateProgress } from '@/hooks/use-arrows-game';
import { Landing } from '@/components/game/Landing';
import { LevelSelect } from '@/components/game/LevelSelect';
import { GameHud } from '@/components/game/GameHud';
import { ArrowGrid } from '@/components/game/ArrowGrid';
import { GameModals } from '@/components/game/GameModals';

export default function Home() {
  const { screen, currentLevel, arrows } = useArrowsGame();

  useEffect(() => {
    hydrateProgress();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {screen === 'landing' && <Landing />}
      {screen === 'level-select' && <LevelSelect />}
      {screen === 'play' && currentLevel && (
        <div className="min-h-screen flex flex-col">
          <GameHud />
          <div className="flex-1 flex items-start justify-center px-4 pb-10">
            <ArrowGrid level={currentLevel} arrows={arrows} />
          </div>
          <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 py-4 text-center text-xs text-neutral-400">
            Arrows — Puzzle Escape · Investor prototype by Lessmore GmbH
          </footer>
        </div>
      )}
      <GameModals />
    </main>
  );
}
