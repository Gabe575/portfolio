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

const THICKNESS = 6;
const RIM_SEGMENTS = 48;
const RIM_STOPS = [
  [244, 114, 182], // pink-400
  [129, 140, 248], // indigo-400
  [52, 211, 153], // emerald-400
];
// Matches the faces' to-bottom-right gradient, then shades the rim as if lit from above
const RIM = Array.from({ length: RIM_SEGMENTS }, (_, i) => {
  const theta = (i / RIM_SEGMENTS) * Math.PI * 2;
  const t = (2 + Math.sin(theta) - Math.cos(theta)) / 4;
  const seg = Math.min(Math.floor(t * 2), 1);
  const local = t * 2 - seg;
  const shade = 0.6 + 0.3 * ((Math.cos(theta) + 1) / 2);
  const [r, g, b] = RIM_STOPS[seg].map((c, k) =>
    Math.round((c + (RIM_STOPS[seg + 1][k] - c) * local) * shade),
  );
  return { angle: (theta * 180) / Math.PI, color: `rgb(${r} ${g} ${b})` };
});
const RIM_WIDTH = `calc(${((Math.PI * 100) / RIM_SEGMENTS).toFixed(3)}% + 1px)`;

const RIM_REEDING =
  'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.14) 0 1px, transparent 1px 3px)';

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

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Spectrum halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-[56%] rounded-full opacity-60 blur-3xl dark:opacity-50"
        style={{
          background:
            'conic-gradient(from 180deg, rgb(236 72 153 / 0.45), rgb(99 102 241 / 0.5), rgb(0 183 255 / 0.4), rgb(16 185 129 / 0.45), rgb(236 72 153 / 0.45))',
        }}
      />
      <div
        className="relative inline-block h-44 w-44 sm:h-56 sm:w-56 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
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
          {/* Rim */}
          {RIM.map(({ angle, color }) => (
            <div
              key={angle}
              className="absolute inset-0"
              style={{ transform: `rotateZ(${angle}deg)`, transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute top-0 left-1/2"
                style={{
                  width: RIM_WIDTH,
                  height: THICKNESS,
                  transform: 'translateX(-50%) rotateX(90deg)',
                  transformOrigin: 'top center',
                  background: `${RIM_REEDING}, ${color}`,
                }}
              />
            </div>
          ))}

          {/* Front. The gradient and glow live on the faces themselves rather than on separate
              layers inside the coin, which Safari would sometimes depth-sort in front of the photo */}
          <div
            className="animate-border absolute inset-0 overflow-hidden rounded-full border-4 border-white/20 bg-linear-to-br from-pink-400 via-indigo-400 to-emerald-400"
            style={{
              transform: `translateZ(${THICKNESS}px)`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <Image
              src="/headshot.jpg"
              alt="Gabriel Santos"
              fill
              draggable={false}
              priority
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, (max-width: 1280px) 320px, 384px"
              className="pointer-events-none select-none object-cover will-change-transform"
            />
          </div>

          {/* Back */}
          <div
            className="animate-border absolute inset-0 overflow-hidden rounded-full border-4 border-white/20 bg-linear-to-br from-pink-400 via-indigo-400 to-emerald-400"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <Image
              src="/headshot.jpg"
              alt=""
              fill
              draggable={false}
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, (max-width: 1280px) 320px, 384px"
              className="pointer-events-none select-none object-cover will-change-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
