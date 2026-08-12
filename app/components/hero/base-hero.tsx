'use client';

import dynamic from 'next/dynamic';
import { useUI } from '@components/ui-provider';
import { useEffect, useState } from 'react';

const AnimatedHero = dynamic(() => import('@components/hero/animated-hero'), {
  ssr: false,
});

const DOTS = [
  { x: 8, y: 76, size: 5, color: 'cyan', delay: -2, duration: 13 },
  { x: 14, y: 42, size: 3, color: 'blue', delay: -7, duration: 17 },
  { x: 19, y: 83, size: 5, color: 'green', delay: -11, duration: 15 },
  { x: 25, y: 61, size: 3, color: 'cyan', delay: -5, duration: 18 },
  { x: 31, y: 30, size: 5, color: 'blue', delay: -9, duration: 14 },
  { x: 36, y: 72, size: 4, color: 'green', delay: -3, duration: 16 },
  { x: 41, y: 48, size: 5, color: 'cyan', delay: -13, duration: 19 },
  { x: 46, y: 78, size: 3, color: 'blue', delay: -6, duration: 15 },
  { x: 51, y: 35, size: 5, color: 'green', delay: -10, duration: 17 },
  { x: 56, y: 67, size: 3, color: 'cyan', delay: -1, duration: 14 },
  { x: 61, y: 25, size: 5, color: 'blue', delay: -8, duration: 18 },
  { x: 66, y: 81, size: 4, color: 'green', delay: -12, duration: 16 },
  { x: 71, y: 52, size: 5, color: 'cyan', delay: -4, duration: 19 },
  { x: 76, y: 70, size: 3, color: 'blue', delay: -14, duration: 15 },
  { x: 82, y: 36, size: 5, color: 'green', delay: -7, duration: 17 },
  { x: 88, y: 77, size: 3, color: 'cyan', delay: -11, duration: 14 },
  { x: 93, y: 48, size: 5, color: 'blue', delay: -3, duration: 18 },

  { x: 11, y: 58, size: 4, color: 'green', delay: -9, duration: 16 },
  { x: 22, y: 22, size: 5, color: 'cyan', delay: -6, duration: 19 },
  { x: 29, y: 88, size: 3, color: 'blue', delay: -12, duration: 15 },
  { x: 38, y: 18, size: 5, color: 'green', delay: -2, duration: 17 },
  { x: 48, y: 56, size: 4, color: 'cyan', delay: -10, duration: 14 },
  { x: 58, y: 15, size: 5, color: 'blue', delay: -5, duration: 18 },
  { x: 69, y: 90, size: 3, color: 'green', delay: -13, duration: 16 },
  { x: 79, y: 20, size: 5, color: 'cyan', delay: -8, duration: 19 },
  { x: 91, y: 63, size: 4, color: 'blue', delay: -1, duration: 15 },
];

const DOT_COLORS = {
  cyan: 'rgba(0, 210, 255, 0.65)',
  blue: 'rgba(0, 100, 255, 0.55)',
  green: 'rgba(0, 255, 150, 0.55)',
};

function StaticHero({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden">
      {/* Ambient center glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[55vw] w-[55vw] max-h-200 max-w-200 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 100, 255, 0.09) 0%, rgba(20, 40, 180, 0.055) 35%, rgba(80, 0, 180, 0.025) 55%, transparent 72%)',
        }}
      />

      {/* CSS-only particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className="static-hero-particle"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              background: DOT_COLORS[dot.color as keyof typeof DOT_COLORS],
              boxShadow: `0 0 ${dot.size * 4}px ${
                DOT_COLORS[dot.color as keyof typeof DOT_COLORS]
              }`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
      </div>

      {children}

      {/* Bottom fade keeps particles subtle near the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, transparent 35%, rgba(3, 4, 14, 0.35) 100%)',
        }}
      />
    </div>
  );
}

function HeroText({ exiting = false }: { exiting?: boolean }) {
  return (
    <div className="relative z-10 flex max-w-[95vw] flex-col items-center text-center">
      {/* Name */}
      <h1
        className="whitespace-nowrap font-bold tracking-[-0.045em]"
        style={{
          fontSize: 'clamp(3.25rem, 9vw, 9rem)',
          lineHeight: 0.95,
        }}
      >
        <span
          className={`hero-word hero-word-left ${exiting ? 'hero-word-exit-left' : ''}`}
          style={{
            background: 'linear-gradient(30deg, #90d5ff 5%, #b9f8ff 42%, #6fffd0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter:
              'drop-shadow(0 0 18px rgba(0, 210, 255, 0.14)) drop-shadow(0 0 42px rgba(0, 255, 150, 0.06))',
          }}
        >
          Gabriel
        </span>{' '}
        <span
          className={`hero-word hero-word-right ${exiting ? 'hero-word-exit-right' : ''}`}
          style={{
            background: 'linear-gradient(-30deg, #90d5ff 5%, #b9f8ff 42%, #6fffd0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter:
              'drop-shadow(0 0 18px rgba(0, 210, 255, 0.14)) drop-shadow(0 0 42px rgba(0, 255, 150, 0.06))',
          }}
        >
          Santos
        </span>
      </h1>

      {/* Supporting text + accent lines */}
      <div className="mt-7 flex items-center gap-3">
        <span
          className={`hero-accent hero-accent-left ${exiting ? 'hero-accent-exit-left' : ''}`}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 210, 255, .5))',
          }}
        />

        <p className="text-xs font-medium tracking-[0.22em] text-white/45 uppercase sm:text-sm">
          <span className={`hero-word hero-word-left ${exiting ? 'hero-word-exit-left' : ''}`}>
            software
          </span>{' '}
          <span className={`hero-word hero-word-right ${exiting ? 'hero-word-exit-right' : ''}`}>
            engineer
          </span>
        </p>

        <span
          className={`hero-accent hero-accent-right ${exiting ? 'hero-accent-exit-right' : ''}`}
          style={{
            background: 'linear-gradient(90deg, rgba(0, 255, 150, .5), transparent)',
          }}
        />
      </div>
    </div>
  );
}

function AnimatedHeroWrapper({ animationsEnabled }: { animationsEnabled: boolean }) {
  const [staticExiting, setStaticExiting] = useState(false);
  const [showAnimatedHero, setShowAnimatedHero] = useState(false);

  useEffect(() => {
    if (!animationsEnabled) return;

    const timeout = setTimeout(() => {
      setShowAnimatedHero(true);
    }, 250); // Delay so the exit animation doesn't play immediately on fast devices

    return () => clearTimeout(timeout);
  }, [animationsEnabled]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <StaticHero>
        <HeroText exiting={animationsEnabled && staticExiting} />
      </StaticHero>

      {animationsEnabled && showAnimatedHero && (
        <div className="absolute inset-0 z-10">
          <AnimatedHero
            onReady={() => {
              setStaticExiting(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const { animationsEnabled } = useUI();

  return <AnimatedHeroWrapper animationsEnabled={animationsEnabled} />;
}
