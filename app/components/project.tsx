'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { FiArrowUpRight, FiX } from 'react-icons/fi';
import { useUI } from '@components/ui-provider';
import type { ProjectData } from '@/data/projects';

type Rect = { top: number; left: number; width: number; height: number };

export const OPEN_PROJECT_EVENT = 'open-project';

const EASE = [0.65, 0, 0.35, 1] as const;

const noopSubscribe = () => () => {};

function getTargetRect(): Rect {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mx = w < 640 ? 12 : w < 1024 ? 32 : 64;
  const my = w < 640 ? 12 : 40;
  const width = Math.min(w - mx * 2, 1120);
  return { top: my, left: (w - width) / 2, width, height: h - my * 2 };
}

export default function Project({
  project,
  index,
  featured = false,
}: Readonly<{
  project: ProjectData;
  index: number;
  featured?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [cardRect, setCardRect] = useState<Rect>({ top: 0, left: 0, width: 0, height: 0 });
  const [targetRect, setTargetRect] = useState<Rect>({ top: 0, left: 0, width: 0, height: 0 });
  const { setProjectOpen, animationsEnabled } = useUI();
  const number = String(index + 1).padStart(2, '0');
  const titleId = `project-${project.slug}-title`;
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const handleOpen = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    setTargetRect(getTargetRect());
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    setOpen(true);
    setProjectOpen(true);
    setCardVisible(false);
  }, [setProjectOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setProjectOpen(false);
  }, [setProjectOpen]);

  // Allow other parts of the site (command palette) to open this project.
  useEffect(() => {
    const onOpenRequest = (e: Event) => {
      if ((e as CustomEvent<string>).detail === project.slug) handleOpen();
    };
    window.addEventListener(OPEN_PROJECT_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_PROJECT_EVENT, onOpenRequest);
  }, [handleOpen, project.slug]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    const onResize = () => setTargetRect(getTargetRect());
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, handleClose]);

  const transition = animationsEnabled
    ? { type: 'tween' as const, duration: 0.6, ease: EASE }
    : { duration: 0 };
  // Shared by the card and the modal's front face so both use the same, already-loaded file
  const cardSizes = featured
    ? '(max-width: 768px) 100vw, 1280px'
    : '(max-width: 768px) 100vw, 640px';
  const zoom = animationsEnabled
    ? 'transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105'
    : '';

  // The overlay lives in a portal so transformed ancestors can't trap its position: fixed.
  const portal = (node: React.ReactNode) => isClient && createPortal(node, document.body);

  return (
    <>
      {portal(
        <AnimatePresence>
          {open && (
            <m.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={animationsEnabled ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={animationsEnabled ? { opacity: 0 } : undefined}
              transition={{ duration: animationsEnabled ? 0.4 : 0 }}
              onClick={handleClose}
            />
          )}
        </AnimatePresence>,
      )}

      <div>
        <button
          ref={cardRef}
          type="button"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-label={`${project.title}: open project details`}
          data-spotlight
          className={`group relative block w-full overflow-hidden rounded-3xl border border-line bg-surface text-left
            ${featured ? 'aspect-square sm:aspect-16/10 lg:aspect-21/9' : 'aspect-square lg:aspect-4/3'}
            ${!cardVisible ? 'invisible' : ''}`}
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <Image
            src={project.image}
            alt=""
            fill
            sizes={cardSizes}
            className={`object-cover ${zoom}`}
          />
          {/* Blur and dim sit behind the text and ease off on hover so the image reads clearly.
              The blur is a pre-filtered copy of the same image rather than a backdrop-filter,
              which would re-sample everything behind it on every scroll frame. */}
          <div
            aria-hidden
            className={`absolute inset-0 overflow-hidden ${animationsEnabled ? 'transition-opacity duration-500 group-hover:opacity-0' : ''}`}
            style={{
              maskImage: 'linear-gradient(to top, black 35%, transparent 80%)',
              WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 80%)',
            }}
          >
            <Image
              src={project.image}
              alt=""
              fill
              sizes={cardSizes}
              className={`object-cover blur-[6px] ${zoom}`}
            />
          </div>
          <div
            className={`absolute inset-0 bg-linear-to-t from-black/95 via-black/65 via-45% to-black/0 ${animationsEnabled ? 'transition-opacity duration-500 group-hover:opacity-80' : ''}`}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
            <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-xs text-white/80 backdrop-blur-md">
              {number}
            </span>
            <span
              className={`grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md
                ${animationsEnabled ? 'transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black' : ''}`}
            >
              <FiArrowUpRight size={20} aria-hidden />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-2 p-5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.6)] sm:p-7 lg:p-9">
            <p className="font-mono text-xs tracking-[0.15em] text-white/80 uppercase">
              {project.context}
            </p>
            <h3
              className={`mt-2 font-display font-semibold tracking-tight ${featured ? 'text-3xl sm:text-4xl lg:text-6xl' : 'text-2xl sm:text-3xl lg:text-4xl'}`}
            >
              {project.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{project.tagline}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs text-white/85 backdrop-blur-md"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </button>
      </div>

      {portal(
        <AnimatePresence
          onExitComplete={() => {
            setCardVisible(true);
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
            cardRef.current?.focus({ preventScroll: true });
          }}
        >
          {open && (
            <m.div
              className="fixed z-50"
              style={{ perspective: 1800 }}
              initial={animationsEnabled ? cardRect : false}
              animate={targetRect}
              exit={animationsEnabled ? cardRect : undefined}
              transition={transition}
            >
              <m.div
                className="relative h-full w-full"
                initial={animationsEnabled ? { rotateY: 0 } : false}
                animate={{ rotateY: 180 }}
                exit={animationsEnabled ? { rotateY: 0 } : undefined}
                transition={transition}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front: the card image, so the flight reads as the same object */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-3xl border border-line"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes={cardSizes}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-black/0" />
                </div>

                {/* Back: project details */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className="absolute inset-0 overflow-y-auto overscroll-contain rounded-3xl border border-line-strong bg-surface text-ink"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/80 px-5 py-3 backdrop-blur-xl sm:px-8">
                    <span className="font-mono text-xs tracking-[0.15em] text-faint uppercase">
                      {number} / {project.context}
                    </span>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={handleClose}
                      aria-label="Close project details"
                      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface-2 transition-colors hover:border-line-strong hover:bg-bg"
                    >
                      <FiX size={18} aria-hidden />
                    </button>
                  </div>

                  <div className="px-5 pt-6 pb-10 sm:px-8 sm:pt-8 lg:px-12 lg:pb-14">
                    <div className="relative aspect-16/7 w-full overflow-hidden rounded-2xl border border-line">
                      <Image
                        src={project.image}
                        alt={`${project.title} preview`}
                        fill
                        sizes="(max-width: 1120px) 100vw, 1120px"
                        className="object-cover"
                      />
                    </div>

                    <h2
                      id={titleId}
                      className="mt-8 font-display text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
                    >
                      {project.title}
                    </h2>
                    <p className="mt-3 text-lg text-muted sm:text-xl">{project.tagline}</p>

                    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
                      <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
                        {project.description.map((paragraph) => (
                          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                        ))}
                        {project.highlight && (
                          <div className="card mt-8 flex items-baseline gap-4 p-6">
                            <span className="font-display text-5xl text-accent font-semibold tracking-tight">
                              {project.highlight.value}
                            </span>
                            <span className="text-sm text-muted">{project.highlight.label}</span>
                          </div>
                        )}
                      </div>

                      <aside className="space-y-8">
                        <div>
                          <h3 className="eyebrow">The stack</h3>
                          <ul className="mt-4 space-y-2">
                            {project.stack.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-3 border-b border-line pb-2 text-sm"
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {project.experiments && (
                          <div>
                            <h3 className="eyebrow">Experiments</h3>
                            <ul className="mt-4 flex flex-wrap gap-2">
                              {project.experiments.map((item) => (
                                <li key={item} className="chip">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.link && (
                          <a
                            href={project.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link flex items-center justify-between gap-3 rounded-2xl border border-line bg-ink px-5 py-4 text-bg transition-transform hover:-translate-y-0.5"
                          >
                            <span>
                              <span className="block font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
                                Visit
                              </span>
                              <span className="font-medium">{project.link.label}</span>
                            </span>
                            <FiArrowUpRight
                              size={20}
                              aria-hidden
                              className="transition-transform group-hover/link:rotate-45"
                            />
                          </a>
                        )}
                      </aside>
                    </div>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>,
      )}
    </>
  );
}
