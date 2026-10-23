'use client';

import { m, useScroll, useTransform } from 'framer-motion';
import { useUI } from '@components/ui-provider';

export default function HeroHud() {
  const { animationsEnabled } = useUI();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 320], [1, 0]);

  return (
    <m.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh"
    >
      <div className="absolute inset-x-0 bottom-24 flex justify-center sm:bottom-20">
        <div className="relative h-12 w-px overflow-hidden bg-white/15">
          <span
            className={`${animationsEnabled ? 'scroll-cue-dot' : ''} absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-transparent to-cyan-300`}
          />
        </div>
      </div>
    </m.div>
  );
}
