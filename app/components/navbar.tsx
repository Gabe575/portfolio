'use client';

import { useEffect, useState, useRef } from 'react';
import ModeToggle from '@components/mode-toggle';
import { FiX, FiMenu } from 'react-icons/fi';

export default function Navbar() {
  const prevScrollPos = useRef(0);
  const ignoreScroll = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 200);

    const handleScroll = () => {
      if (ignoreScroll.current) return;
      const currentScrollPos = window.pageYOffset;

      if (currentScrollPos <= prevScrollPos.current || currentScrollPos < 100) {
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
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scrollend', () => {
        ignoreScroll.current = false;
      });
    };
  }, []);

  return (
    <nav
      className={`fixed left-1/2 transform -translate-x-1/2 bg-white/25 dark:bg-black/25 backdrop-blur-xs z-50 shadow-md transition-all duration-300
        ${isVisible ? 'translate-y-0 top-4' : '-translate-y-full top-0'} rounded-3xl border border-white/30 dark:border-black/30 w-full max-w-xs md:max-w-3xl`}
      ref={menuRef}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-2 md:py-4">
        <div className="text-xl font-heading">
          <p className="text-sm">This website is a work in progress :)</p>
        </div>

        <div className="hidden md:flex space-x-8 font-medium justify-center items-center">
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

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none">
            {isOpen ? (
              <FiX className="pointer-events-none" />
            ) : (
              <FiMenu className="pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden px-6 space-y-4 font-medium transition-[max-height,opacity,padding] duration-300
        ${isOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden py-0'}`}
      >
        <a href="#home" className="block hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </a>
        <a href="#about" className="block hover:text-blue-600 dark:hover:text-blue-400">
          About
        </a>
        <a href="#projects" className="block hover:text-blue-600 dark:hover:text-blue-400">
          Projects
        </a>
        <a href="#contact" className="block hover:text-blue-600 dark:hover:text-blue-400">
          Contact
        </a>
        <div className="h-10 w-full">
          <ModeToggle className="relative w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center transition-transform hover:bg-gray-100 dark:hover:bg-gray-900" />
        </div>
      </div>
    </nav>
  );
}
