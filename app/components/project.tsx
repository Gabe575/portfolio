'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@components/ui-provider';

export default function Project({
  title,
  image,
  children,
}: Readonly<{
  title: string;
  image: string;
  children?: ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const { setProjectOpen, animationsEnabled } = useUI();
  const handleOpen = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    setOpen(true);
    setProjectOpen(true);
    setCardVisible(false);
  };

  const handleClose = () => {
    setOpen(false);
    setProjectOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={animationsEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={animationsEnabled ? { opacity: 0 } : undefined}
            transition={{
              duration: animationsEnabled ? 0.3 : 0,
            }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
      <div className="h-50 sm:h-75 md:h-60 lg:h-75 xl:h-100" ref={cardRef}>
        <div
          className={`
            relative w-full h-full border-2 rounded-2xl
          border-slate-400 dark:border-zinc-500
            bg-cover bg-center overflow-hidden
            transition-transform duration-300
            ${animationsEnabled ? 'hover:scale-105' : ''}
            cursor-pointer
            ${!cardVisible ? 'hidden' : ''}
          `}
          style={{ backgroundImage: `url(${image})` }}
          onClick={handleOpen}
        >
          <motion.div
            className="
              absolute flex bottom-0 w-full items-center justify-center
              overflow-hidden bg-white/60 dark:bg-black/60
            "
            initial={false}
            animate={{
              height: cardVisible ? '33.3333%' : '0%',
            }}
            transition={animationsEnabled ? { type: 'spring', duration: 0.5 } : { duration: 0 }}
          >
            <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-semibold">
              {title}
            </p>
          </motion.div>
        </div>
      </div>
      <AnimatePresence
        onExitComplete={() => {
          setCardVisible(true);
          document.body.style.overflow = '';
          document.body.style.paddingRight = '0px';
        }}
      >
        {open && (
          <motion.div
            className="fixed z-50"
            style={{
              perspective: 1400,
            }}
            initial={
              animationsEnabled
                ? {
                    top: cardRect.top,
                    left: cardRect.left,
                    width: cardRect.width,
                    height: cardRect.height,
                  }
                : false
            }
            animate={{
              top: '10vh',
              left: '10vw',
              width: '80vw',
              height: '80vh',
            }}
            exit={
              animationsEnabled
                ? {
                    top: cardRect.top,
                    left: cardRect.left,
                    width: cardRect.width,
                    height: cardRect.height,
                  }
                : undefined
            }
            transition={
              animationsEnabled
                ? {
                    type: 'tween',
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  }
                : {
                    duration: 0,
                  }
            }
          >
            <motion.div
              className="relative h-full w-full"
              initial={
                animationsEnabled
                  ? {
                      rotateY: 0,
                    }
                  : false
              }
              animate={{
                rotateY: 180,
              }}
              exit={
                animationsEnabled
                  ? {
                      rotateY: 0,
                    }
                  : undefined
              }
              transition={
                animationsEnabled
                  ? { type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
                  : { duration: 0 }
              }
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="
                  absolute inset-0 overflow-hidden rounded-2xl
                  border-2 border-slate-400
                  bg-cover bg-center
                  dark:border-zinc-500
                "
                style={{
                  backgroundImage: `url(${image})`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />

              <div
                className="
                  absolute inset-0 overflow-auto rounded-2xl
                  border-2 border-slate-400
                  bg-linear-to-b from-slate-300 to-white
                  px-6 py-8
                  dark:border-zinc-500 dark:from-zinc-700 dark:to-black
                  sm:px-10
                  lg:px-20
                  xl:py-16
                "
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                onClick={handleClose}
              >
                <div className="flex min-h-full flex-col items-center text-left">
                  <h1 className="pb-4 text-2xl md:text-3xl lg:text-4xl xl:pb-8 xl:text-5xl">
                    {title}
                  </h1>
                  {children}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
