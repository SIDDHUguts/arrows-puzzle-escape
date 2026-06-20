'use client';

// Modal overlays for the game: teach, win, settings, ad, iap.

import {
  CheckCircle2,
  Lock,
  Star,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArrowsGame } from '@/hooks/use-arrows-game';
import { LEVELS } from '@/lib/game/levels';
import { Button } from '@/components/ui/button';
import { tierLabel, progressStats } from '@/lib/game/storage';

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function GameModals() {
  const {
    showTeach,
    showWin,
    showSettings,
    showAdModal,
    showIapModal,
    closeTeach,
    closeWin,
    nextLevel,
    openSettings,
    openAdModal,
    openIapModal,
    restart,
    resetAllProgress,
    currentLevel,
    moveCount,
    progress,
  } = useArrowsGame();

  return (
    <AnimatePresence>
      {showTeach && currentLevel?.teach && (
        <Backdrop key="teach">
          <button
            onClick={closeTeach}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            How to play
          </div>
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {currentLevel.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {currentLevel.teach}
          </p>
          <div className="mt-6 flex justify-end">
            <Button size="sm" onClick={closeTeach}>
              Got it
            </Button>
          </div>
        </Backdrop>
      )}

      {showWin && currentLevel && (
        <Backdrop key="win">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
              <CheckCircle2 className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Solved
            </div>
            <h3 className="mt-2 text-xl font-medium text-neutral-900 dark:text-neutral-100">
              {currentLevel.title}
            </h3>
            <div className="mt-3 flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => {
                const trophies =
                  progress[currentLevel.slug]?.trophies ?? 0;
                return (
                  <Star
                    key={i}
                    className={
                      i < trophies
                        ? 'h-5 w-5 fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100'
                        : 'h-5 w-5 text-neutral-300 dark:text-neutral-700'
                    }
                  />
                );
              })}
            </div>
            <p className="mt-3 text-xs text-neutral-500 tabular-nums">
              Cleared in {moveCount} moves
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={restart}>
                Replay
              </Button>
              <Button size="sm" onClick={nextLevel} className="gap-1.5">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Backdrop>
      )}

      {showSettings && (
        <Backdrop key="settings">
          <button
            onClick={() => openSettings(false)}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Settings
          </div>
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Options
          </h3>
          <div className="mt-5 space-y-3">
            <button
              onClick={() => {
                openSettings(false);
                openAdModal(true);
              }}
              className="w-full flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span>Watch a sample ad</span>
              <span className="text-xs text-neutral-400">Investor demo</span>
            </button>
            <button
              onClick={() => {
                openSettings(false);
                openIapModal(true);
              }}
              className="w-full flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span>View in-app purchase</span>
              <span className="text-xs text-neutral-400">Investor demo</span>
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all level progress? This cannot be undone.'
                  )
                ) {
                  resetAllProgress();
                }
              }}
              className="w-full flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span>Reset all progress</span>
              <span className="text-xs text-neutral-400">Local only</span>
            </button>
          </div>
          <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Levels solved</span>
              <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                {progressStats(progress).solved}/{LEVELS.length}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Trophies earned</span>
              <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                {progressStats(progress).totalTrophies}/{LEVELS.length * 3}
              </span>
            </div>
          </div>
        </Backdrop>
      )}

      {showAdModal && (
        <Backdrop key="ad">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Advertisement
            </div>
            <div className="mt-6 mx-auto h-44 w-full rounded-md bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="mx-auto h-6 w-6 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-500">
                  Sample rewarded ad placement
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Earn one free hint after watching
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
              In production: 30-second rewarded video via AdMob / AppLovin.
              Removes-ads IAP suppresses this placement entirely.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAdModal(false)}
              >
                Skip
              </Button>
              <Button size="sm" onClick={() => openAdModal(false)}>
                Claim hint
              </Button>
            </div>
          </div>
        </Backdrop>
      )}

      {showIapModal && (
        <Backdrop key="iap">
          <button
            onClick={() => openIapModal(false)}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            In-App Purchase
          </div>
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Arrows Premium
          </h3>
          <div className="mt-5 space-y-2">
            {[
              {
                name: 'Remove Ads',
                price: '$1.99',
                desc: 'Hide every banner, interstitial and rewarded placement, forever.',
              },
              {
                name: 'Hint Pack ×10',
                price: '$0.99',
                desc: 'Ten gentle hints for the levels that resist you.',
              },
              {
                name: 'All-Access',
                price: '$4.99',
                desc: 'Remove ads + unlimited hints + early access to new packs.',
              },
            ].map((sku) => (
              <div
                key={sku.name}
                className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {sku.name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {sku.desc}
                  </div>
                </div>
                <div className="text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                  {sku.price}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
            Investor demo only — no real transactions occur in this prototype.
          </p>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

export { tierLabel };
