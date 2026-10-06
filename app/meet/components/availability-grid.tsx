'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { dateLabel, HALF_HOUR, localParts, timeLabel, wallTimeToUtc } from '@lib/scheduler/time';

type Props = {
  dates: string[];
  timezone: string;
  slots: string[];
  readOnly?: boolean;
  disabled?: boolean;
  today?: string;
  onChange?: (slots: string[]) => void;
};

type Cell = { slots: string[]; available: boolean; partial: boolean; ranges: string[] };
type Point = { x: number; y: number };

function crossesCell(
  from: Point,
  to: Point,
  bounds: { left: number; right: number; top: number; bottom: number },
) {
  if (bounds.left >= bounds.right || bounds.top >= bounds.bottom) return false;
  let enter = 0;
  let exit = 1;
  for (const [start, delta, min, max] of [
    [from.x, to.x - from.x, bounds.left, bounds.right],
    [from.y, to.y - from.y, bounds.top, bounds.bottom],
  ]) {
    if (delta === 0) {
      if (start < min || start >= max) return false;
    } else {
      const a = (min - start) / delta;
      const b = (max - start) / delta;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
      if (enter > exit) return false;
    }
  }
  return enter < exit;
}

export default function AvailabilityGrid({
  dates,
  timezone,
  slots,
  readOnly = false,
  disabled = false,
  today,
  onChange,
}: Props) {
  const [inspection, setInspection] = useState('');
  const viewport = useRef<HTMLDivElement>(null);
  const selection = useRef(new Set(slots));
  const paint = useRef<{
    selecting: boolean;
    visited: Set<string>;
    last: Point;
    targets: { key: string; slots: string[]; element: HTMLButtonElement }[];
  } | null>(null);
  const tap = useRef<{
    pointerId: number;
    key: string;
    slots: string[];
    start: Point;
    element: HTMLButtonElement;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const candidates = useMemo(() => {
    const cells = new Map<string, string[]>();
    for (const date of dates) {
      for (let minute = readOnly ? 0 : 480; minute < (readOnly ? 1440 : 1320); minute += 30) {
        cells.set(`${date}:${minute}`, wallTimeToUtc(date, minute, timezone));
      }
    }
    return cells;
  }, [dates, timezone, readOnly]);
  const cells = useMemo(() => {
    const result = new Map<string, Cell>();
    const selected = new Set(slots);
    const intervals = slots.map((slot) => ({
      start: Date.parse(slot),
      end: Date.parse(slot) + HALF_HOUR,
    }));
    for (const [key, cellSlots] of candidates) {
      let coverage = 0;
      const exact = new Set<string>();
      if (readOnly) {
        for (const start of cellSlots) {
          const boundary = Date.parse(start);
          for (const interval of intervals) {
            const overlap =
              Math.min(boundary + HALF_HOUR, interval.end) - Math.max(boundary, interval.start);
            if (overlap > 0) {
              coverage += overlap / HALF_HOUR;
              const startParts = localParts(interval.start, timezone);
              const endParts = localParts(interval.end, timezone);
              const date = key.slice(0, 10);
              // A converted block may cross midnight; each day's label shows its own part.
              if (startParts.date === endParts.date && endParts.minute - startParts.minute !== 30) {
                const format = new Intl.DateTimeFormat('en-CA', {
                  timeZone: timezone,
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                });
                exact.add(
                  `${format.format(new Date(interval.start))}-${format.format(new Date(interval.end))}`,
                );
              } else {
                exact.add(
                  `${startParts.date === date ? timeLabel(startParts.minute) : 'midnight'}-${endParts.date === date ? timeLabel(endParts.minute) : 'midnight'}`,
                );
              }
            }
          }
        }
      }
      result.set(key, {
        slots: cellSlots,
        available: readOnly ? coverage > 0 : cellSlots.some((slot) => selected.has(slot)),
        partial: coverage > 0 && coverage < 0.999,
        ranges: [...exact],
      });
    }
    return result;
  }, [candidates, slots, readOnly, timezone]);

  useEffect(() => {
    const stop = () => {
      paint.current = null;
      tap.current = null;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
    };
  }, []);

  function update(key: string, cellSlots: string[], selecting: boolean, notify = true) {
    if (paint.current?.visited.has(key)) return false;
    paint.current?.visited.add(key);
    let changed = false;
    for (const slot of cellSlots) {
      if (selection.current.has(slot) !== selecting) changed = true;
      if (selecting) selection.current.add(slot);
      else selection.current.delete(slot);
    }
    if (changed && notify) onChange?.([...selection.current].sort());
    return changed;
  }

  function paintStroke(event: ReactPointerEvent<HTMLDivElement>) {
    const stroke = paint.current;
    if (!stroke || event.pointerType !== 'mouse' || disabled || readOnly) return;
    if (event.type === 'pointermove' && !(event.buttons & 1)) {
      paint.current = null;
      return;
    }
    const windowBounds = event.currentTarget.getBoundingClientRect();
    const headerBottom =
      event.currentTarget.querySelector('.availability-day-heading')?.getBoundingClientRect()
        .bottom ?? windowBounds.top;
    const timeAxisRight =
      event.currentTarget.querySelector('.availability-times')?.getBoundingClientRect().right ??
      windowBounds.left;
    const targets = stroke.targets.map((target) => {
      const rect = target.element.getBoundingClientRect();
      return {
        ...target,
        bounds: {
          left: Math.max(rect.left, windowBounds.left, timeAxisRight),
          right: Math.min(rect.right, windowBounds.right),
          top: Math.max(rect.top, windowBounds.top, headerBottom),
          bottom: Math.min(rect.bottom, windowBounds.bottom),
        },
      };
    });
    let changed = false;
    // Fill the entire pointer path, including cells skipped between browser events.
    const samples = [...(event.nativeEvent.getCoalescedEvents?.() ?? []), event.nativeEvent];
    for (const sample of samples) {
      const point = { x: sample.clientX, y: sample.clientY };
      for (const target of targets) {
        if (!target.element.disabled && crossesCell(stroke.last, point, target.bounds))
          changed = update(target.key, target.slots, stroke.selecting, false) || changed;
      }
      stroke.last = point;
    }
    if (changed) onChange?.([...selection.current].sort());
  }

  function movePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (tap.current?.pointerId === event.pointerId) {
      const { start } = tap.current;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) tap.current = null;
    }
    paintStroke(event);
  }

  function releasePointer(event: ReactPointerEvent<HTMLDivElement>) {
    paintStroke(event);
    const gesture = tap.current;
    tap.current = null;
    if (!gesture || gesture.pointerId !== event.pointerId || disabled || readOnly) return;
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    // Touch clicks may be adjusted to a nearby/focused button by the browser.
    // Commit the actual pointer gesture instead, and leave scroll gestures alone.
    if (
      gesture.element.disabled ||
      !hit ||
      !gesture.element.contains(hit) ||
      Math.hypot(event.clientX - gesture.start.x, event.clientY - gesture.start.y) > 10 ||
      event.currentTarget.scrollLeft !== gesture.scrollLeft ||
      event.currentTarget.scrollTop !== gesture.scrollTop
    )
      return;
    selection.current = new Set(slots);
    update(gesture.key, gesture.slots, !gesture.slots.some((slot) => selection.current.has(slot)));
  }

  function renderCell(date: string, minute: number) {
    const key = `${date}:${minute}`;
    const cell = cells.get(key);
    if (!cell) return null;
    const blocked = disabled || !cell.slots.length || (!readOnly && Boolean(today && date < today));
    const label = `${dateLabel(date, true)}, ${timeLabel(minute)} to ${timeLabel(minute + 30)}. ${cell.available ? `Available${readOnly ? `: ${cell.ranges.join(', ')}` : ''}` : readOnly ? 'Unavailable' : blocked ? 'Past date or unavailable time' : 'Not selected'}`;
    const className = `availability-cell ${cell.available ? 'availability-selected' : ''} ${cell.partial ? 'availability-partial' : ''} ${blocked ? 'availability-disabled' : ''}`;
    if (readOnly) {
      if (!cell.available) return <div className={className} key={key} aria-label={label} />;
      return (
        <button
          type="button"
          className={className}
          key={key}
          aria-label={`Inspect ${label}`}
          title={label}
          onClick={() =>
            setInspection(`${dateLabel(date, true)}: ${cell.ranges.join(', ')} · ${timezone}`)
          }
        >
          <span className="availability-cell-text">{cell.ranges.join(', ')}</span>
          <span className="availability-view-check" aria-hidden="true">
            ✓
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        key={key}
        className={className}
        disabled={blocked}
        data-slot-key={key}
        aria-pressed={cell.available}
        aria-label={label}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          tap.current = null;
          paint.current = null;
          if (event.pointerType !== 'mouse') {
            tap.current = {
              pointerId: event.pointerId,
              key,
              slots: cell.slots,
              start: { x: event.clientX, y: event.clientY },
              element: event.currentTarget,
              scrollLeft: viewport.current?.scrollLeft ?? 0,
              scrollTop: viewport.current?.scrollTop ?? 0,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            return;
          }
          event.preventDefault();
          event.currentTarget.focus();
          selection.current = new Set(slots);
          paint.current = {
            selecting: !cell.available,
            visited: new Set(),
            last: { x: event.clientX, y: event.clientY },
            targets: Array.from(
              viewport.current?.querySelectorAll<HTMLButtonElement>('button[data-slot-key]') ?? [],
            ).flatMap((element) => {
              const key = element.dataset.slotKey;
              const target = key ? cells.get(key) : undefined;
              return key && target && !element.disabled
                ? [{ key, slots: target.slots, element }]
                : [];
            }),
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          update(key, cell.slots, !cell.available);
        }}
        onClick={(event) => {
          const native = event.nativeEvent;
          const fromPointer = 'pointerType' in native && Boolean(native.pointerType);
          // Pointer gestures are already handled above; clicks remain for keyboard/AT activation.
          if (event.detail === 0 && !fromPointer) {
            selection.current = new Set(slots);
            paint.current = null;
            update(key, cell.slots, !cell.available);
          }
        }}
      >
        {cell.available && <span aria-hidden="true">✓</span>}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-2">
          <span className="availability-key availability-selected" /> Available
        </span>
        <span className="scheduler-muted availability-desktop-hint">
          {readOnly
            ? 'Times converted to your timezone. Striped cells are partially available. Select a block to inspect its exact times.'
            : 'Click to select. Drag to paint or erase.'}
        </span>
        <span className="scheduler-muted availability-mobile-hint">
          {readOnly
            ? 'Swipe to explore days and times. Tap an available block for exact times.'
            : 'Swipe to explore days and times. Tap a block to select or clear it.'}
        </span>
      </div>
      <div
        ref={viewport}
        className="availability-viewport"
        role="region"
        aria-label={`Availability calendar in ${timezone}. Scroll to explore days and times.`}
        tabIndex={0}
        onPointerMove={movePointer}
        onPointerUp={releasePointer}
        onLostPointerCapture={() => {
          paint.current = null;
          tap.current = null;
        }}
      >
        <div
          className="availability-grid"
          style={{ '--day-count': dates.length } as React.CSSProperties}
        >
          <div className="availability-times" aria-hidden="true">
            <div className="availability-day-heading">Time</div>
            {Array.from({ length: readOnly ? 48 : 28 }, (_, index) => (
              <div className="availability-time" key={index}>
                {timeLabel((readOnly ? 0 : 480) + index * 30)}
              </div>
            ))}
            <span className="availability-end">{readOnly ? '12:00 AM' : '10:00 PM'}</span>
          </div>
          {dates.map((date) => (
            <div key={date} className="availability-day">
              <div className="availability-day-heading">{dateLabel(date)}</div>
              {Array.from({ length: readOnly ? 48 : 28 }, (_, index) =>
                renderCell(date, (readOnly ? 0 : 480) + index * 30),
              )}
            </div>
          ))}
        </div>
      </div>
      {readOnly && inspection && (
        <p className="availability-inspection" role="status">
          {inspection}
        </p>
      )}
    </div>
  );
}
