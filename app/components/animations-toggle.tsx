'use client';
import { useEffect, useState } from 'react';
import { useUI } from './ui-provider';

export default function AnimationsToggle() {
  const { animationsEnabled, setAnimationsEnabled } = useUI();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <>
        {animationsEnabled && (
          <div
            dangerouslySetInnerHTML={{
              __html: `
              <button
                id="disable-animations-btn"
                class="opacity-0 animate-fade-in text-sm lg:text-base py-2 px-10 pointer-cursor text-white"
              >
                disable animations
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

  const handleToggle = () => {
    document.cookie = `animation=${!animationsEnabled}; path=/`;
    setAnimationsEnabled(!animationsEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className={'text-sm lg:text-base py-2 px-10 pointer-cursor text-white'}
    >
      {animationsEnabled ? 'disable animations' : 'enable animations'}
    </button>
  );
}
