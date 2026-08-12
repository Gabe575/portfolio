'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUI } from './ui-provider';

const DRAG_SENSITIVITY = 0.25;
const TILT_SENSITIVITY = 0.12;
const MAX_TILT = 8;
const FRICTION = 0.97;
const MIN_VELOCITY = 0.05;
const CLICK_THRESHOLD = 5;
const MOMENTUM_MULTIPLIER = 0.65;

export default function InteractivePortrait() {
  const { animationsEnabled } = useUI();

  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const rotationRef = useRef(0);
  const tiltRef = useRef(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const startRotation = useRef(0);

  const lastX = useRef(0);
  const lastY = useRef(0);

  const velocity = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const dragged = useRef(false);

  const updateRotation = useCallback((value: number) => {
    rotationRef.current = value;
    setRotation(value);
  }, []);

  const updateTilt = useCallback((value: number) => {
    tiltRef.current = value;
    setTilt(value);
  }, []);

  const stopMomentum = useCallback(() => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    velocity.current = 0;
  }, []);

  const animateMomentum = () => {
    velocity.current *= FRICTION;

    if (Math.abs(velocity.current) < MIN_VELOCITY) {
      velocity.current = 0;
      animationFrame.current = null;
      setIsSpinning(false);

      const currentTilt = tiltRef.current;

      if (Math.abs(currentTilt) > 0.05) {
        updateTilt(currentTilt * 0.85);
      } else {
        updateTilt(0);
      }

      return;
    }

    updateRotation(rotationRef.current + velocity.current);
    updateTilt(tiltRef.current * 0.92);

    animationFrame.current = requestAnimationFrame(animateMomentum);
  };

  const startMomentum = () => {
    if (Math.abs(velocity.current) < MIN_VELOCITY) {
      return;
    }

    setIsSpinning(true);
    animationFrame.current = requestAnimationFrame(animateMomentum);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled) return;

    stopMomentum();
    setIsSpinning(false);

    event.currentTarget.setPointerCapture(event.pointerId);

    startX.current = event.clientX;
    startY.current = event.clientY;

    lastX.current = event.clientX;
    lastY.current = event.clientY;

    startRotation.current = rotationRef.current;

    velocity.current = 0;
    dragged.current = false;

    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled || !isDragging) return;

    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    const movementX = event.clientX - lastX.current;

    if (Math.abs(deltaX) > CLICK_THRESHOLD || Math.abs(deltaY) > CLICK_THRESHOLD) {
      dragged.current = true;
    }

    const nextRotation = startRotation.current + deltaX * DRAG_SENSITIVITY;

    const nextTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, -deltaY * TILT_SENSITIVITY));

    updateRotation(nextRotation);
    updateTilt(nextTilt);

    velocity.current = movementX * MOMENTUM_MULTIPLIER;

    lastX.current = event.clientX;
    lastY.current = event.clientY;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled || !isDragging) return;

    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }

    if (!dragged.current) {
      setIsSpinning(false);

      const nearestNeutral = Math.round(rotationRef.current / 180) * 180;

      updateRotation(nearestNeutral);
      updateTilt(0);
      return;
    }

    startMomentum();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!animationsEnabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      stopMomentum();
      setIsSpinning(false);
      updateRotation(rotationRef.current + 180);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stopMomentum();
      setIsSpinning(false);
      updateRotation(rotationRef.current + 30);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stopMomentum();
      setIsSpinning(false);
      updateRotation(rotationRef.current - 30);
    }
  };

  // Cancel any active momentum when animations are disabled.
  useEffect(() => {
    if (!animationsEnabled) {
      stopMomentum();
    }
  }, [animationsEnabled, stopMomentum]);

  useEffect(() => {
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Visually force the portrait to its static state when animations are disabled.
  const displayedRotation = animationsEnabled ? rotation : 0;
  const displayedTilt = animationsEnabled ? tilt : 0;

  const normalizedRotation = ((displayedRotation % 360) + 360) % 360;

  const radians = (normalizedRotation * Math.PI) / 180;

  const shadowX = Math.sin(radians) * 12;
  const shadowOpacity = 0.16 + Math.abs(Math.cos(radians)) * 0.14;

  return (
    <div
      className="relative inline-block h-32 w-32 sm:h-48 sm:w-48 lg:h-96 lg:w-96 mb-4"
      style={{
        perspective: '1000px',
        touchAction: animationsEnabled ? 'none' : 'auto',
        cursor: animationsEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => event.preventDefault()}
      role={animationsEnabled ? 'button' : undefined}
      tabIndex={animationsEnabled ? 0 : undefined}
      aria-label={
        animationsEnabled
          ? 'Interactive portrait. Drag horizontally to rotate.'
          : 'Portrait of Gabriel Santos'
      }
    >
      {/* Dynamic shadow */}
      <div
        className="pointer-events-none absolute inset-2 rounded-full bg-black blur-md"
        style={{
          opacity: animationsEnabled ? shadowOpacity : 0.2,
          transform: `translateX(${shadowX}px) translateY(8px) scale(0.92)`,
          transition: isDragging ? 'none' : 'transform 150ms ease-out, opacity 150ms ease-out',
        }}
      />

      <div
        className="relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${displayedTilt}deg) rotateY(${displayedRotation}deg)`,
          transition:
            animationsEnabled && !isDragging && !isSpinning
              ? 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
        }}
      >
        {/* Coin thickness */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`absolute inset-0 overflow-hidden rounded-full bg-linear-to-br from-pink-400 via-indigo-400 to-emerald-400 ${index === 2 || index === 3 ? 'animate-border' : ''}`}
            style={{
              transform: `translateZ(${-6 + index * 2}px)`,
            }}
          />
        ))}

        {/* Front */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full border-4 border-white/20"
          style={{
            transform: 'translateZ(6px)',
            backfaceVisibility: 'hidden',
          }}
        >
          <Image
            src="/headshot.jpg"
            alt="Gabriel Santos"
            fill
            draggable={false}
            priority
            sizes="(max-width: 640px) 128px, (max-width: 1024px) 192px, 384px"
            className="pointer-events-none select-none object-cover"
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full border-4 border-white/20"
          style={{
            transform: 'rotateY(180deg) translateZ(6px)',
            backfaceVisibility: 'hidden',
          }}
        >
          <Image
            src="/headshot.jpg"
            alt=""
            fill
            draggable={false}
            sizes="(max-width: 640px) 128px, (max-width: 1024px) 192px, 384px"
            className="pointer-events-none select-none object-cover"
          />
        </div>
      </div>
    </div>
  );
}
