'use client';

import { useEffect, useState, useRef } from 'react';
import ModeToggle from '@components/mode-toggle';
import { useUI } from '@components/ui-provider';
import { FiX, FiMenu } from 'react-icons/fi';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;

// Home is reached via the GS logo, so it's left out of the desktop links. The mobile
// dropdown keeps it since it's easier to reach there.
const NAV_LINKS = SECTIONS.slice(1);

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const anchor = (section: string) => (isHome ? `#${section}` : `/#${section}`);
  const prevScrollPos = useRef(0);
  const ignoreScroll = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [overHero, setOverHero] = useState(isHome);
  const [active, setActive] = useState<string>('home');
  const { projectOpen, animationsEnabled } = useUI();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    let frame: number | null = null;
    let ignoreTimeout: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      frame = null;
      const y = window.scrollY;
      const vh = window.innerHeight;

      setOverHero(isHome && y < vh - 64);

      if (isHome) {
        let current = 'home';
        for (const { id } of NAV_LINKS) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= vh * 0.4) current = id;
        }
        setActive(current);
      }

      if (!animationsEnabled) {
        setIsVisible(true);
      } else if (!ignoreScroll.current) {
        if (y <= prevScrollPos.current || y < vh * 0.5) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setIsOpen(false);
        }
      }
      prevScrollPos.current = y;
    };

    const handleScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    const handleScrollEnd = () => {
      ignoreScroll.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // composedPath survives React swapping the clicked icon out of the DOM mid-event
      if (menuRef.current && !e.composedPath().includes(menuRef.current)) {
        setIsOpen(false);
      }
      const link = target.closest('a');
      if (link?.getAttribute('href')?.startsWith('#')) {
        setIsOpen(false);
        ignoreScroll.current = true;
        // Fallback for browsers without the scrollend event.
        clearTimeout(ignoreTimeout);
        ignoreTimeout = setTimeout(handleScrollEnd, 1200);
      }
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    window.addEventListener('scrollend', handleScrollEnd);
    document.addEventListener('click', handleClick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(ignoreTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('scrollend', handleScrollEnd);
      document.removeEventListener('click', handleClick);
    };
  }, [animationsEnabled, isHome]);

  useEffect(() => {
    if (projectOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      setIsOpen(false);
    } else if (!animationsEnabled) {
      setIsVisible(true);
    }
  }, [projectOpen, animationsEnabled]);

  const runScroll = (id: string) => {
    const behavior = animationsEnabled ? 'smooth' : 'auto';
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior });
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!isHome) return;
    e.preventDefault();
    history.pushState(null, '', `#${id}`);
    ignoreScroll.current = true;
    setIsOpen(false);
    runScroll(id);
  };

  const shown = !projectOpen && (isVisible || isHovered || isOpen);
  const tone = overHero
    ? 'border-white/15 bg-black/30 text-white'
    : 'border-line bg-surface/70 text-ink';
  const subtle = overHero ? 'text-white/60 hover:text-white' : 'text-muted hover:text-ink';
  const iconButton = `grid h-9 w-9 place-items-center rounded-full transition-colors ${
    overHero ? 'hover:bg-white/10' : 'hover:bg-surface-2'
  }`;

  return (
    <>
      <div
        className="fixed top-0 left-0 z-10 h-20 w-full bg-transparent"
        {...(animationsEnabled && {
          onPointerEnter: (e: React.PointerEvent) =>
            e.pointerType === 'mouse' && setIsHovered(true),
          onPointerLeave: () => setIsHovered(false),
        })}
      />
      <motion.nav
        aria-label="Primary"
        ref={menuRef}
        className={`fixed inset-x-3 top-3 z-30 overflow-hidden rounded-3xl border shadow-[0_10px_40px_-10px_rgb(0_0_0/0.35)] backdrop-blur-xl
          transition-colors duration-500 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:rounded-full ${tone}`}
        initial={animationsEnabled ? { y: -120 } : false}
        animate={{ y: shown ? 0 : -120 }}
        transition={
          animationsEnabled
            ? { type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0 }
        }
        // Mouse only: touch taps emulate mouseenter and would pin the nav open
        onPointerEnter={(e) => e.pointerType === 'mouse' && setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-2">
          <a
            href={anchor('home')}
            onClick={(e) => scrollToSection(e, 'home')}
            className="mr-1 grid h-9 w-9 place-items-center rounded-full font-mono text-sm font-bold tracking-tight"
          >
            <span
              className="text-spectrum"
              style={overHero ? { filter: 'brightness(1.6)' } : undefined}
            >
              GS
            </span>
            <span className="sr-only">Gabriel Santos, home</span>
          </a>

          <ul className="hidden items-center md:flex">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = isHome && active === id;
              return (
                <li key={id} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className={`absolute inset-0 rounded-full ${overHero ? 'bg-white/12' : 'bg-surface-2'}`}
                      transition={
                        animationsEnabled
                          ? { type: 'spring', stiffness: 400, damping: 35 }
                          : { duration: 0 }
                      }
                    />
                  )}
                  <a
                    href={anchor(id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? (overHero ? 'text-white' : 'text-ink') : subtle
                    }`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <ModeToggle className={`relative ${iconButton}`} />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden ${iconButton}`}
            >
              {isOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
            </button>
          </div>
        </div>

        {/* Collapses with a CSS grid-rows transition. Framer Motion's height: 'auto' animation
            measures the page and resets window scroll, which cancels the section scroll. */}
        <div
          className={`grid md:hidden ${animationsEnabled ? 'transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''} ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
          }`}
        >
          <ul id="mobile-menu" className="min-h-0 overflow-hidden">
            {SECTIONS.map(({ id, label }) => (
              <li key={id} className={`border-t ${overHero ? 'border-white/10' : 'border-line'}`}>
                <a
                  href={anchor(id)}
                  onClick={(e) => scrollToSection(e, id)}
                  tabIndex={isOpen ? undefined : -1}
                  className="flex items-center justify-between px-5 py-4 font-display text-2xl font-medium"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {isHome && (
          <motion.span
            aria-hidden
            className="absolute inset-x-6 bottom-0 h-px origin-left"
            style={{ scaleX: progress, background: 'var(--spectrum)' }}
          />
        )}
      </motion.nav>
    </>
  );
}
