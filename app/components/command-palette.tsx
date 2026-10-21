'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FiArrowRight,
  FiFolder,
  FiGithub,
  FiLinkedin,
  FiMoon,
  FiSearch,
  FiSun,
  FiZap,
} from 'react-icons/fi';
import { useUI } from '@components/ui-provider';
import { SECTIONS } from '@components/navbar';
import { OPEN_PROJECT_EVENT } from '@components/project';
import { projects } from '@/data/projects';

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, animationsEnabled, toggleAnimations } = useUI();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const commands = useMemo<Command[]>(() => {
    const goTo = (id: string) => {
      if (pathname !== '/') {
        router.push(`/#${id}`);
        return;
      }
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: animationsEnabled ? 'smooth' : 'auto' });
    };
    const external = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

    return [
      ...SECTIONS.map(({ id, label }) => ({
        id: `nav-${id}`,
        group: 'Navigate',
        label,
        hint: `#${id}`,
        icon: <FiArrowRight />,
        run: () => goTo(id),
      })),
      ...projects.map((p) => ({
        id: `project-${p.slug}`,
        group: 'Projects',
        label: p.title,
        hint: p.context,
        icon: <FiFolder />,
        run: () => {
          if (pathname !== '/') {
            router.push('/#projects');
            return;
          }
          window.dispatchEvent(new CustomEvent(OPEN_PROJECT_EVENT, { detail: p.slug }));
        },
      })),
      {
        id: 'theme',
        group: 'Preferences',
        label: `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`,
        icon: resolvedTheme === 'dark' ? <FiSun /> : <FiMoon />,
        run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'motion',
        group: 'Preferences',
        label: animationsEnabled ? 'Disable animations' : 'Enable animations',
        hint: 'For low-end devices',
        icon: <FiZap />,
        run: toggleAnimations,
      },
      {
        id: 'github',
        group: 'Elsewhere',
        label: 'GitHub',
        hint: 'Gabe575',
        icon: <FiGithub />,
        run: () => external('https://github.com/Gabe575'),
      },
      {
        id: 'linkedin',
        group: 'Elsewhere',
        label: 'LinkedIn',
        hint: 'gabriel2004santos',
        icon: <FiLinkedin />,
        run: () => external('https://linkedin.com/in/gabriel2004santos'),
      },
    ];
  }, [pathname, router, animationsEnabled, resolvedTheme, setTheme, toggleAnimations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen]);

  useEffect(() => {
    if (paletteOpen) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocus.current?.focus?.({ preventScroll: true });
    }
  }, [paletteOpen]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const close = () => setPaletteOpen(false);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    close();
    // Let the dialog unmount before scrolling or opening a project.
    setTimeout(command.run, 50);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(filtered[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-start justify-center bg-black/50 px-3 pt-[12vh] backdrop-blur-sm"
          initial={animationsEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={animationsEnabled ? { opacity: 0 } : undefined}
          transition={{ duration: animationsEnabled ? 0.2 : 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-line-strong bg-surface/95 text-ink shadow-[0_40px_120px_-20px_rgb(0_0_0/0.6)] backdrop-blur-2xl"
            initial={animationsEnabled ? { opacity: 0, scale: 0.96, y: -8 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={animationsEnabled ? { opacity: 0, scale: 0.98, y: -4 } : undefined}
            transition={{ duration: animationsEnabled ? 0.22 : 0, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <FiSearch className="shrink-0 text-faint" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Type a command or search…"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-faint"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={
                  filtered[selected] ? `cmd-${filtered[selected].id}` : undefined
                }
                aria-autocomplete="list"
              />
              <span className="kbd text-faint">esc</span>
            </div>

            <ul
              ref={listRef}
              id="command-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-muted">
                  Nothing matches &ldquo;{query}&rdquo;
                </li>
              )}
              {filtered.map((command, i) => {
                const showGroup = command.group !== lastGroup;
                lastGroup = command.group;
                const isSelected = i === selected;
                return (
                  <li key={command.id} role="presentation">
                    {showGroup && (
                      <div className="px-3 pt-3 pb-1 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                        {command.group}
                      </div>
                    )}
                    <div
                      id={`cmd-${command.id}`}
                      role="option"
                      aria-selected={isSelected}
                      data-index={i}
                      onMouseMove={() => setSelected(i)}
                      onClick={() => execute(command)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isSelected ? 'bg-surface-2 text-ink' : 'text-muted'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line ${
                          isSelected ? 'text-accent' : ''
                        }`}
                        aria-hidden
                      >
                        {command.icon}
                      </span>
                      <span className="flex-1 truncate font-medium">{command.label}</span>
                      {command.hint && (
                        <span className="hidden truncate font-mono text-xs text-faint sm:block">
                          {command.hint}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 border-t border-line px-5 py-3 text-xs text-faint">
              <span className="flex items-center gap-1.5">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="kbd">↵</span> select
              </span>
              <span className="ml-auto font-mono">gabesantos.ca</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
