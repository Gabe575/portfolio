'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUI } from './ui-provider';

const DRAG_SENSITIVITY = 0.5;
const TILT_SENSITIVITY = 0.12;
const MAX_TILT = 8;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.05;
const CLICK_THRESHOLD = 5;
const MOMENTUM_MULTIPLIER = 0.5;

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
  const pointerFrame = useRef<number | null>(null);
  const dragged = useRef(false);

  const pointerX = useRef(0);
  const pointerY = useRef(0);

  const portraitRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const updateRotation = useCallback((value: number) => {
    rotationRef.current = value;
    setRotation(value);
  }, []);

  const updateTilt = useCallback((value: number) => {
    tiltRef.current = value;
    setTilt(value);
  }, []);

  const applyTransform = useCallback((rotation: number, tilt: number) => {
    rotationRef.current = rotation;
    tiltRef.current = tilt;

    if (portraitRef.current) {
      portraitRef.current.style.transform = `rotateX(${tilt}deg) rotateY(${rotation}deg)`;
    }

    const normalizedRotation = ((rotation % 360) + 360) % 360;

    const radians = (normalizedRotation * Math.PI) / 180;

    const shadowX = Math.sin(radians) * 12;
    const shadowOpacity = 0.01 + Math.abs(Math.cos(radians)) * 0.24;

    if (shadowRef.current) {
      shadowRef.current.style.transform = `translateX(${shadowX}px) translateY(8px) scale(0.92)`;

      shadowRef.current.style.opacity = String(shadowOpacity);
    }
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
        const nextTilt = currentTilt * 0.85;

        applyTransform(rotationRef.current, nextTilt);

        setTilt(nextTilt);
      } else {
        applyTransform(rotationRef.current, 0);

        setTilt(0);
      }

      setRotation(rotationRef.current);

      return;
    }

    const nextRotation = rotationRef.current + velocity.current;

    const nextTilt = tiltRef.current * 0.92;

    applyTransform(nextRotation, nextTilt);

    animationFrame.current = requestAnimationFrame(animateMomentum);
  };

  const startMomentum = () => {
    if (Math.abs(velocity.current) < MIN_VELOCITY) {
      return;
    }

    setIsSpinning(true);
    animationFrame.current = requestAnimationFrame(animateMomentum);
  };

  const processPointerMove = useCallback(() => {
    pointerFrame.current = null;

    if (!isDragging || !animationsEnabled) {
      return;
    }

    const currentX = pointerX.current;
    const currentY = pointerY.current;

    const deltaX = currentX - startX.current;

    const deltaY = currentY - startY.current;

    const movementX = currentX - lastX.current;

    if (Math.abs(deltaX) > CLICK_THRESHOLD || Math.abs(deltaY) > CLICK_THRESHOLD) {
      dragged.current = true;
    }

    const nextRotation = startRotation.current + deltaX * DRAG_SENSITIVITY;

    const nextTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, -deltaY * TILT_SENSITIVITY));

    applyTransform(nextRotation, nextTilt);

    velocity.current = movementX * MOMENTUM_MULTIPLIER;

    lastX.current = currentX;
    lastY.current = currentY;
  }, [animationsEnabled, applyTransform, isDragging]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled) return;

    stopMomentum();
    setIsSpinning(false);

    event.currentTarget.setPointerCapture(event.pointerId);

    startX.current = event.clientX;
    startY.current = event.clientY;

    lastX.current = event.clientX;
    lastY.current = event.clientY;

    pointerX.current = event.clientX;
    pointerY.current = event.clientY;

    startRotation.current = rotationRef.current;

    velocity.current = 0;
    dragged.current = false;

    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled || !isDragging) {
      return;
    }

    pointerX.current = event.clientX;
    pointerY.current = event.clientY;

    if (pointerFrame.current === null) {
      pointerFrame.current = requestAnimationFrame(processPointerMove);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled || !isDragging) {
      return;
    }

    if (pointerFrame.current !== null) {
      cancelAnimationFrame(pointerFrame.current);

      pointerFrame.current = null;
      processPointerMove();
    }

    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }

    if (!dragged.current) {
      setIsSpinning(false);

      const nearestNeutral = Math.round(rotationRef.current / 180) * 180;

      applyTransform(nearestNeutral, 0);
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

      if (pointerFrame.current !== null) {
        cancelAnimationFrame(pointerFrame.current);

        pointerFrame.current = null;
      }
    }
  }, [animationsEnabled, stopMomentum]);

  useEffect(() => {
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      if (pointerFrame.current !== null) {
        cancelAnimationFrame(pointerFrame.current);
      }
    };
  }, []);

  // Visually force the portrait to its static state when animations are disabled.
  const displayedRotation = animationsEnabled ? rotation : 0;
  const displayedTilt = animationsEnabled ? tilt : 0;

  const normalizedRotation = ((displayedRotation % 360) + 360) % 360;

  const radians = (normalizedRotation * Math.PI) / 180;

  const shadowX = Math.sin(radians) * 12;
  const shadowOpacity = 0.01 + Math.abs(Math.cos(radians)) * 0.24;

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
        ref={shadowRef}
        className="pointer-events-none absolute inset-2 rounded-full bg-black blur-md"
        style={{
          opacity: animationsEnabled ? shadowOpacity : 0.2,
          transform: `translateX(${shadowX}px) translateY(8px) scale(0.92)`,
          transition: isDragging ? 'none' : 'transform 150ms ease-out, opacity 150ms ease-out',
        }}
      />

      <div
        ref={portraitRef}
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
        {/* Solid center wall */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{
            transform: 'rotateY(90deg)',
          }}
        >
          <div className="absolute left-1/2 top-0 h-full w-2.75 -translate-x-1/2 bg-linear-to-br from-pink-400 via-indigo-400 to-emerald-400" />
        </div>
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
