'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function SiteTelemetry() {
  const pathname = usePathname();
  // Public scheduler URLs are credentials; keep them out of analytics events.
  if (pathname.startsWith('/meet')) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
