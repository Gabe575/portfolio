'use client';

import { useEffect, useState, useRef } from 'react';
import ModeToggle from '@components/mode-toggle';
import { useUI } from '@components/ui-provider';
import { FiX, FiMenu } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const prevScrollPos = useRef(0);
  const ignoreScroll = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { projectOpen } = useUI();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      if (ignoreScroll.current) return;
      const currentScrollPos = window.pageYOffset;

      if (
        currentScrollPos <= prevScrollPos.current ||
        currentScrollPos < window.innerHeight * 0.5
      ) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }

      prevScrollPos.current = currentScrollPos;
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        setIsOpen(false);
        ignoreScroll.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scrollend', () => {
      ignoreScroll.current = false;
    });
    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scrollend', () => {
        ignoreScroll.current = false;
      });
    };
  }, []);

  useEffect(() => {
    if (projectOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [projectOpen]);

  return (
    <>
      <AnimatePresence>
        {projectOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      <div
        className="fixed top-0 left-0 w-full h-20 bg-transparent z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
      />
      <motion.nav
        className={`fixed transform left-full top-4 translate-x-[calc(-100%-1rem)] md:left-1/2 md:-translate-x-1/2 
        rounded-3xl border border-white/30 dark:border-black/30  max-w-lg bg-white/25 dark:bg-black/25 backdrop-blur-xs z-50 shadow-md text-xl`}
        initial={{ translateY: '-200px' }}
        animate={{
          translateY: isVisible || isHovered ? '0' : '-200px',
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        ref={menuRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
      >
        <div className="hidden md:flex mx-auto items-center justify-center px-6 py-2 md:py-4 overflow-hidden">
          <div className="space-x-8 font-medium justify-center items-center flex">
            <a href="#home" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400">
              About
            </a>
            <a href="#projects" className="hover:text-blue-600 dark:hover:text-blue-400">
              Projects
            </a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400">
              Contact
            </a>
            <div className="h-10 w-10">
              <ModeToggle className="relative w-10 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center transition-transform hover:bg-gray-100 dark:hover:bg-gray-900" />
            </div>
          </div>
        </div>

        <div className="md:hidden flex flex-col items-end overflow-hidden">
          <div className="flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none">
              {isOpen ? (
                <FiX className="pointer-events-none" />
              ) : (
                <FiMenu className="pointer-events-none" />
              )}
            </button>
          </div>
          <motion.div
            className="space-y-4 font-medium flex flex-col items-center"
            initial={false}
            animate={{
              maxHeight: isOpen ? '100vh' : '0',
              width: isOpen ? '256px' : '0',
              padding: isOpen ? '16px 24px' : '0',
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <a
              href="#home"
              className="block hover:text-blue-600 dark:hover:text-blue-400 w-full text-center"
            >
              Home
            </a>
            <a
              href="#about"
              className="block hover:text-blue-600 dark:hover:text-blue-400 w-full text-center"
            >
              About
            </a>
            <a
              href="#projects"
              className="block hover:text-blue-600 dark:hover:text-blue-400 w-full text-center"
            >
              Projects
            </a>
            <a
              href="#contact"
              className="block hover:text-blue-600 dark:hover:text-blue-400 w-full text-center"
            >
              Contact
            </a>
            <div className="h-10 w-full">
              <ModeToggle className="relative w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center transition-transform hover:bg-gray-100 dark:hover:bg-gray-900" />
            </div>
          </motion.div>
        </div>
      </motion.nav>
    </>
  );
}
