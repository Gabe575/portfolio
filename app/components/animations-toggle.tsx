'use client';
import { useEffect, useState } from 'react';
import { useUI } from './ui-provider';

const PILL =
  'group inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/35 py-1.5 pr-1.5 pl-4 font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase backdrop-blur-xl transition-colors hover:border-white/30 hover:text-white cursor-pointer';
const TRACK = 'relative inline-block h-5 w-9 rounded-full transition-colors duration-300';
const THUMB =
  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300';

export default function AnimationsToggle() {
  const { animationsEnabled, toggleAnimations } = useUI();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Before hydration, slow devices can still opt out via this inline script.
  if (!mounted)
    return (
      <>
        {animationsEnabled && (
          <div
            dangerouslySetInnerHTML={{
              __html: `
              <button
                id="disable-animations-btn"
                class="opacity-0 animate-fade-in ${PILL}"
              >
                Motion
                <span class="${TRACK} bg-cyan-500/80"><span class="${THUMB} left-0.5 translate-x-4"></span></span>
              </button>
              <script>
                const btn = document.getElementById('disable-animations-btn');
                if (btn) {
                  btn.addEventListener('click', () => {
                    document.cookie = 'animation=false; path=/; max-age=31536000';
                    window.location.reload();
                  });
                }
              </script>
            `,
            }}
          />
        )}
      </>
    );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={animationsEnabled}
      onClick={toggleAnimations}
      className={PILL}
      title="Turn off for low-end devices"
    >
      Motion
      <span className={`${TRACK} ${animationsEnabled ? 'bg-cyan-500/80' : 'bg-white/20'}`}>
        <span
          className={`${THUMB} left-0.5 ${animationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </span>
    </button>
  );
}
