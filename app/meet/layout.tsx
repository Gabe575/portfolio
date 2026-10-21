import type { Metadata } from 'next';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import './scheduler.css';

export const metadata: Metadata = {
  title: 'Availability | Gabriel Santos',
  description: 'Share availability for a conversation.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
};

export default function SchedulerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="scheduler-backdrop" aria-hidden />
      <main className="scheduler mx-auto min-h-screen w-full max-w-6xl min-w-0 px-4 pt-24 pb-16 sm:px-8 md:pt-32">
        <nav aria-label="Breadcrumb" className="eyebrow">
          <Link href="/" className="transition-colors hover:text-ink">
            Gabriel Santos
          </Link>
          <span aria-hidden>/</span>
          <span className="text-muted">Availability</span>
        </nav>
        <div className="mt-8">{children}</div>
        <p className="mt-16 flex items-center justify-center gap-2 border-t border-line pt-6 font-mono text-[11px] tracking-[0.12em] text-faint uppercase">
          <FiLock aria-hidden size={12} /> Private link · not indexed or tracked
        </p>
      </main>
    </>
  );
}
