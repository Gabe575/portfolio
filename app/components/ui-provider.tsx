'use client';

import { createContext, useState, ReactNode, useContext, useEffect, useCallback } from 'react';
import Navbar from '@components/navbar';
import CommandPalette from '@components/command-palette';
import { ThemeProvider } from 'next-themes';

interface UIContextType {
  projectOpen: boolean;
  setProjectOpen: (open: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  toggleAnimations: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export default function UIProvider({
  children,
  animationDisabled,
}: {
  children: ReactNode;
  animationDisabled?: boolean;
}) {
  const [projectOpen, setProjectOpen] = useState<boolean>(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(!animationDisabled);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);

  const toggleAnimations = useCallback(() => {
    document.cookie = `animation=${!animationsEnabled}; path=/; max-age=31536000`;
    setAnimationsEnabled(!animationsEnabled);
  }, [animationsEnabled]);

  // Honour the OS reduced-motion setting until the visitor makes an explicit choice.
  useEffect(() => {
    const hasChoice = document.cookie.split('; ').some((c) => c.startsWith('animation='));
    if (!hasChoice && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimationsEnabled(false);
    }
  }, []);

  // One listener drives every [data-spotlight] highlight on the page.
  useEffect(() => {
    if (!animationsEnabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.('[data-spotlight]') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [animationsEnabled]);

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <UIContext.Provider
        value={{
          projectOpen,
          setProjectOpen,
          animationsEnabled,
          setAnimationsEnabled,
          toggleAnimations,
          paletteOpen,
          setPaletteOpen,
        }}
      >
        <Navbar />
        <CommandPalette />
        {children}
      </UIContext.Provider>
    </ThemeProvider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
}
