'use client';

// Investor landing page for Arrows – Puzzle Escape.

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Infinity as InfinityIcon,
  Lightbulb,
  Trophy,
  Grid3x3,
  Wind,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useArrowsGame } from '@/hooks/use-arrows-game';
import { LEVELS } from '@/lib/game/levels';
import { Button } from '@/components/ui/button';
import { ArrowGlyph } from './ArrowGlyph';

export function Landing() {
  const { goToLevelSelect, loadLevel } = useArrowsGame();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
              <ArrowGlyph direction="up-right" size={18} />
            </div>
            <span className="text-sm font-medium tracking-tight">
              Arrows
            </span>
            <span className="text-xs text-neutral-400 ml-1 hidden sm:inline">
              by SiddManeA productions
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadLevel(LEVELS[0])}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Demo
            </Button>
            <Button size="sm" onClick={goToLevelSelect} className="gap-1.5">
              Play
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Investor Prototype
            </div>
            <h1 className="mt-4 text-4xl sm:text-6xl font-light leading-[1.05] tracking-tight text-neutral-900 dark:text-neutral-100">
              A puzzle that asks you
              <br />
              <span className="italic font-serif">to slow down.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Arrows is a minimalist logic puzzle where you extract arrows from
              intricate grids without causing collisions. No timers. No streaks.
              Just thousands of handcrafted mazes and a steady, meditative
              difficulty curve.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={goToLevelSelect} size="lg" className="gap-2">
                Try the prototype
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => loadLevel(LEVELS[0])}
                variant="outline"
                size="lg"
              >
                Play level one
              </Button>
              <span className="text-xs text-neutral-400">
                {LEVELS.length} levels · playable in browser
              </span>
            </div>
          </motion.div>

          {/* Floating grid preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="mt-16 mx-auto max-w-md"
          >
            <PreviewGrid />
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Wind,
                title: 'Stress-free by design',
                body: 'No timers. No fail screens. A wrong move simply slides back, inviting you to look again.',
              },
              {
                icon: Grid3x3,
                title: 'Handcrafted mazes',
                body: 'Thousands of grids composed by hand, each tuned to introduce one new idea at a time.',
              },
              {
                icon: InfinityIcon,
                title: 'A curve that never ends',
                body: 'New arrow types and movement mechanics arrive every few dozen levels, indefinitely.',
              },
            ].map((p) => (
              <div key={p.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800">
                  <p.icon className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                </div>
                <h3 className="mt-4 text-sm font-medium">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Core features
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight">
            Everything a relaxing puzzle needs.
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
            {[
              {
                icon: Smartphone,
                title: 'Minimalist interface',
                body: 'Sleek, clean visual language designed for focused solving. Black, white, and one accent — nothing else competes for attention.',
              },
              {
                icon: Wind,
                title: 'No timers',
                body: 'Play at your own pace. The game removes time pressure entirely, inviting experimentation and quiet reflection.',
              },
              {
                icon: Lightbulb,
                title: 'Hint system',
                body: 'Stuck on a complex maze? Use a hint for a gentle push in the right direction — never a spoiler. Limited uses per level.',
              },
              {
                icon: Trophy,
                title: 'Progression & trophies',
                body: 'Unlock trophies, track records, and discover new arrow types as you progress through different maze patterns.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-neutral-950 p-6 sm:p-8"
              >
                <f.icon className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                <h3 className="mt-4 text-sm font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market & monetization */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid sm:grid-cols-2 gap-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Availability
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight">
                Free-to-play,
                <br />
                gentle to monetize.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Arrows ships on iOS and Android with a low-friction free tier.
                Ads are present but never interrupt the meditative flow; every
                placement can be silenced with a single one-time IAP.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['iOS', 'Android', 'Rewarded video', 'Banner', 'IAP'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Revenue mix (target)
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Remove ads IAP', value: 48 },
                  { label: 'Hint packs IAP', value: 22 },
                  { label: 'Rewarded video', value: 20 },
                  { label: 'Banner', value: 10 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {row.label}
                      </span>
                      <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                        {row.value}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-neutral-900 dark:bg-neutral-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Projections shown for prototype illustration only. Live figures
                depend on store conversion, retention curves, and ad fill rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '5M+', label: 'Downloads target' },
              { value: '4.7★', label: 'Store rating goal' },
              { value: 'D1 45%', label: 'Retention target' },
              { value: '$0.18', label: 'ARPDAU projection' },
            ].map((kpi) => (
              <div key={kpi.label}>
                <div className="text-2xl sm:text-3xl font-light tabular-nums">
                  {kpi.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] opacity-70">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-20 sm:py-28 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-neutral-400" />
          <h2 className="mt-4 text-3xl sm:text-4xl font-light tracking-tight">
            Solve one. You’ll want another.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The prototype includes {LEVELS.length} handcrafted levels spanning
            four difficulty tiers. Tap any arrow to begin.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={goToLevelSelect} size="lg" className="gap-2">
              Open level select
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div>
            Arrows — Puzzle Escape · SiddManeA productions · Investor prototype
          </div>
          <div className="opacity-70">
            Minimalist logic puzzles · No timers · Handcrafted
          </div>
        </div>
      </footer>
    </div>
  );
}

// Decorative grid in the hero — purely visual, no interaction.
function PreviewGrid() {
  return (
    <div className="relative aspect-square w-full">
      <div className="grid grid-cols-5 grid-rows-5 gap-[2px] bg-neutral-200 dark:bg-neutral-800 p-[2px] rounded-md">
        {Array.from({ length: 25 }).map((_, i) => {
          const r = Math.floor(i / 5);
          const c = i % 5;
          const wall = (r === 2 && c === 2) || (r === 1 && c === 3);
          const arrows: Record<string, { dir: 'up' | 'down' | 'left' | 'right' }> = {
            '0,0': { dir: 'right' },
            '0,4': { dir: 'down' },
            '4,0': { dir: 'up' },
            '4,4': { dir: 'left' },
            '2,4': { dir: 'left' },
          };
          const k = `${r},${c}`;
          const a = arrows[k];
          return (
            <div
              key={i}
              className={[
                'aspect-square flex items-center justify-center',
                wall
                  ? 'bg-neutral-900 dark:bg-neutral-100'
                  : 'bg-white dark:bg-neutral-950',
              ].join(' ')}
            >
              {a && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.02, duration: 0.4 }}
                  className="text-neutral-900 dark:text-neutral-100"
                >
                  <ArrowGlyph direction={a.dir} size={20} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
