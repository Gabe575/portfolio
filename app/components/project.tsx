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
  const [open, setOpen] = useState<boolean>(false);
  const [cardVisible, setCardVisible] = useState<boolean>(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const { setProjectOpen } = useUI();
  const handleOpen = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    setOpen(true);
    setProjectOpen(true);
    setCardVisible(false);
  };

  return (
    <div className="h-50 sm:h-75 md:h-60 lg:h-75 xl:h-100" ref={cardRef}>
      <div
        className={`relative w-full h-full backface-hidden border-2 rounded-2xl border-slate-400 dark:border-zinc-500 bg-cover bg-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${!cardVisible && 'hidden'}`}
        style={{ backgroundImage: `url(${image})` }}
        onClick={handleOpen}
      >
        <motion.div
          className="absolute flex bottom-0 w-full bg-white/60 dark:bg-black/60 backdrop-blur-xs justify-center items-center transition-colors duration-300"
          initial={false}
          animate={{
            height: cardVisible ? '33.3333%' : '0',
          }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-semibold">
            {title}
          </p>
        </motion.div>
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
            className="fixed z-50 transform-3d"
            initial={{
              top: cardRect.top,
              left: cardRect.left,
              width: cardRect.width,
              height: cardRect.height,
              rotateY: 0,
            }}
            animate={{
              top: '10vh',
              left: '10vw',
              width: '80vw',
              height: '80vh',
              rotateY: 180,
            }}
            exit={{
              top: cardRect.top,
              left: cardRect.left,
              width: cardRect.width,
              height: cardRect.height,
              rotateY: 0,
            }}
            transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="absolute w-full h-full backface-hidden border-2 rounded-2xl border-slate-400 dark:border-zinc-500 bg-cover bg-center overflow-hidden cursor-pointer"
              style={{ backgroundImage: `url(${image})` }}
              onClick={() => {
                setOpen(false);
                setProjectOpen(false);
              }}
            >
              {/* <div className="absolute flex bottom-0 w-full h-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs justify-center items-center">
                <p className="text-xl sm:text-2xl xl:text-3xl font-semibold">{title}</p>
              </div> */}
            </motion.div>

            <motion.div
              className="absolute w-full min-w-[80vw] h-full py-8 px-6 sm:px-10 lg:px-20 xl:py-16 flex flex-col items-center text-left backface-hidden rotate-y-180 border-2 rounded-2xl 
              bg-linear-to-b from-slate-300 to-white dark:from-zinc-700 dark:to-black border-slate-400 dark:border-zinc-500 cursor-pointer overflow-auto"
              onClick={() => {
                setOpen(false);
                setProjectOpen(false);
              }}
              transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-2xl pb-4 md:text-3xl lg:text-4xl xl:text-5xl lg:pb-8">{title}</h1>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
