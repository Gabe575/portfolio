import type { Metadata } from 'next';
import Link from 'next/link';
import './scheduler.css';

export const metadata: Metadata = {
  title: 'Availability | Gabriel Santos',
  description: 'Share availability for a conversation.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
};

export default function SchedulerLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="scheduler mx-auto min-h-screen w-full min-w-0 max-w-7xl px-4 pb-20 pt-14 sm:px-8 md:pt-28">
      <Link href="/" className="scheduler-muted text-sm hover:underline">
        Gabriel Santos / Availability
      </Link>
      <div className="mt-8">{children}</div>
    </main>
  );
}
