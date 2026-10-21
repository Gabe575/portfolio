import Link from 'next/link';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';

const DOTS = [
  { x: 12, y: 70, size: 4, color: 'rgba(0, 210, 255, 0.6)', delay: -3, duration: 14 },
  { x: 24, y: 34, size: 3, color: 'rgba(0, 100, 255, 0.5)', delay: -8, duration: 17 },
  { x: 33, y: 82, size: 5, color: 'rgba(0, 255, 150, 0.5)', delay: -1, duration: 15 },
  { x: 58, y: 24, size: 4, color: 'rgba(0, 210, 255, 0.6)', delay: -11, duration: 18 },
  { x: 67, y: 76, size: 3, color: 'rgba(0, 100, 255, 0.5)', delay: -6, duration: 16 },
  { x: 79, y: 40, size: 5, color: 'rgba(0, 255, 150, 0.5)', delay: -9, duration: 19 },
  { x: 88, y: 68, size: 4, color: 'rgba(0, 210, 255, 0.6)', delay: -4, duration: 15 },
];

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
];

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-28">
      <title>Page not found | Gabriel Santos</title>

      {/* Grid + glow backdrop, theme-aware */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(60% 50% at 50% 45%, var(--glow), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: 'center',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 15%, transparent 75%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className="static-hero-particle"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              boxShadow: `0 0 ${dot.size * 4}px ${dot.color}`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="flex max-w-2xl flex-col items-center text-center">
        <p className="eyebrow">Page not found</p>

        <h1
          className="relative mt-6 font-display leading-none font-bold tracking-[-0.06em] select-none"
          style={{ fontSize: 'clamp(7rem, 28vw, 16rem)' }}
        >
          {/* Outlined echo behind the gradient numerals */}
          <span
            aria-hidden
            className="absolute inset-0 translate-x-[0.04em] translate-y-[0.04em]"
            style={{ WebkitTextStroke: '1px var(--line-strong)', color: 'transparent' }}
          >
            404
          </span>
          <span className="text-spectrum relative">404</span>
        </h1>

        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Nothing here.
        </h2>
        <p className="mt-3 max-w-md text-muted">The link might be broken, or the page has moved.</p>

        <Link
          href="/"
          className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-7 py-3 font-medium text-bg transition-shadow hover:shadow-[0_0_0_4px_var(--glow)]"
        >
          <FiArrowLeft
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to home
        </Link>

        <nav aria-label="Popular sections" className="mt-12 w-full max-w-sm">
          <p className="font-display text-sm text-faint">Or jump to</p>
          <ul className="mt-3 border-t border-line text-left">
            {LINKS.map(({ href, label }) => (
              <li key={href} className="border-b border-line">
                <Link href={href} className="group flex items-center gap-4 py-3.5">
                  <span className="font-display text-lg font-medium">{label}</span>
                  <FiArrowUpRight
                    aria-hidden
                    className="ml-auto text-faint transition-transform duration-300 group-hover:rotate-45 group-hover:text-ink"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
