'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

const commonZones = [
  'America/Toronto',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

function describeZone(zone: string, at: Date | null) {
  const city =
    zone === 'UTC' ? 'Coordinated Universal Time' : zone.split('/').at(-1)!.replaceAll('_', ' ');
  if (!at) return { zone, city, offset: '', offsetMinutes: 0, description: zone };
  const part = (style: 'longOffset' | 'longGeneric') =>
    new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: style })
      .formatToParts(at)
      .find((part) => part.type === 'timeZoneName')?.value ?? '';
  const rawOffset = part('longOffset');
  const offset = rawOffset === 'GMT' ? 'UTC+00:00' : rawOffset.replace('GMT', 'UTC');
  const match = /^UTC([+-])(\d{2}):(\d{2})$/.exec(offset);
  const offsetMinutes = match
    ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === '-' ? -1 : 1)
    : 0;
  const description = zone === 'UTC' ? 'Universal reference time' : part('longGeneric');
  return { zone, city, offset, offsetMinutes, description };
}

export default function TimezoneSelect({
  value,
  onChange,
  disabled,
  name = 'timezone',
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}) {
  const [catalog, setCatalog] = useState<{ zones: string[]; at: Date | null }>({
    zones: commonZones,
    at: null,
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    // Load browser ICU data after hydration; offsets reflect current DST rules.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCatalog({
      zones:
        typeof Intl.supportedValuesOf === 'function'
          ? Intl.supportedValuesOf('timeZone')
          : commonZones,
      at: new Date(),
    });
  }, []);
  useEffect(() => {
    if (!open || disabled) return;
    search.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, disabled]);
  const zones = useMemo(
    () =>
      [...new Set([value, ...commonZones, ...catalog.zones])]
        .map((zone) => describeZone(zone, catalog.at))
        .sort(
          (a, b) =>
            a.offsetMinutes - b.offsetMinutes ||
            a.city.localeCompare(b.city) ||
            a.zone.localeCompare(b.zone),
        ),
    [value, catalog],
  );
  const selected = zones.find((zone) => zone.zone === value)!;
  const term = query.trim().toLowerCase().replaceAll('_', ' ');
  const matches = term
    ? zones.filter((zone) =>
        `${zone.city} ${zone.description} ${zone.zone.replaceAll('_', ' ')} ${zone.offset}`
          .toLowerCase()
          .includes(term),
      )
    : zones.filter((zone) => zone.zone === value || commonZones.includes(zone.zone));
  return (
    <div
      ref={root}
      className="w-full min-w-0 space-y-2 sm:max-w-md"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <span id={`${id}-label`} className="block text-sm font-semibold">
        Times shown in
      </span>
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        type="button"
        className="scheduler-input flex w-full items-center justify-between gap-3 text-left"
        aria-labelledby={`${id}-label ${id}-selection`}
        aria-expanded={open && !disabled}
        aria-controls={`${id}-choices`}
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setQuery('');
        }}
      >
        <span id={`${id}-selection`} className="min-w-0">
          <span className="block font-semibold">
            {selected.city}
            {selected.offset && ` · ${selected.offset}`}
          </span>
          <span className="scheduler-muted block text-xs">
            {selected.description} · {value}
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0">
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && !disabled && (
        <div id={`${id}-choices`} className="timezone-choices space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Find your timezone</span>
            <input
              ref={search}
              type="search"
              className="scheduler-input w-full"
              placeholder="Search city, timezone, or UTC offset"
              value={query}
              maxLength={100}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              aria-describedby={`${id}-hint`}
              autoComplete="off"
            />
          </label>
          <p id={`${id}-hint`} className="scheduler-muted text-xs" role="status">
            {term
              ? `${matches.length} matching timezones${matches.length > 20 ? '; showing the first 20. Refine your search.' : '.'}`
              : 'Common timezones shown. Search to find any other location.'}
          </p>
          <ul className="timezone-results" aria-label="Timezone choices">
            {matches.slice(0, 20).map((zone) => (
              <li key={zone.zone}>
                <button
                  type="button"
                  className={`timezone-option ${zone.zone === value ? 'scheduler-choice-active' : ''}`}
                  aria-pressed={zone.zone === value}
                  onClick={() => {
                    onChange?.(zone.zone);
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                >
                  <span className="block text-sm font-semibold">
                    {zone.city} · {zone.offset}
                  </span>
                  <span className="scheduler-muted block text-xs">
                    {zone.description} · {zone.zone}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!matches.length && (
            <p className="scheduler-muted text-sm">
              No matching timezone. Try a nearby major city.
            </p>
          )}
          <p className="scheduler-muted text-xs">
            UTC offsets are shown for today and may change with daylight saving time. Your
            availability uses the timezone rules for each selected date.
          </p>
        </div>
      )}
    </div>
  );
}
