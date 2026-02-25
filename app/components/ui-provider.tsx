'use client';

import { createContext, useState, ReactNode, useContext } from 'react';
import Navbar from '@components/navbar';
import { ThemeProvider } from 'next-themes';

interface UIContextType {
  projectOpen: boolean;
  setProjectOpen: (open: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
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

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <UIContext.Provider
        value={{ projectOpen, setProjectOpen, animationsEnabled, setAnimationsEnabled }}
      >
        <Navbar />
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
