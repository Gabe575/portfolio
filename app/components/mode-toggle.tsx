'use client';
import * as React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';

export function ModeToggle({
  className,
}: Readonly<{
  className?: string;
}>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Don't render until theme is resolved
  if (!mounted || !resolvedTheme) return null;

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button onClick={handleToggle} className={className}>
      <FiSun
        className={`h-5 w-5 transition-transform ${
          resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
        }`}
      />
      <FiMoon
        className={`absolute h-5 w-5 transition-transform ${
          resolvedTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
        }`}
      />
    </button>
  );
}
