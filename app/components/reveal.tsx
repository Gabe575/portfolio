'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { useUI } from '@components/ui-provider';

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}>) {
  const { animationsEnabled } = useUI();

  if (!animationsEnabled) return <div className={className}>{children}</div>;

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </m.div>
  );
}
