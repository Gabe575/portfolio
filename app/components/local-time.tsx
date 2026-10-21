'use client';

import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

// Current time in Ontario; renders a stable placeholder until hydrated.
export default function LocalTime({ className }: Readonly<{ className?: string }>) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(formatter.format(new Date()));
    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time className={className} suppressHydrationWarning>
      {time ?? '--:--'}
    </time>
  );
}
