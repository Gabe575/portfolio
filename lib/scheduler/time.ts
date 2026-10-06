export type Scope = 'this_week' | 'next_week' | 'both';
export type Week = 'this_week' | 'next_week';
export type AvailabilityResponse = {
  timezone: string;
  scope: Scope;
  availableSlots: string[];
  submittedAt: string;
  updatedAt: string;
};
export type AvailabilityRequest = {
  id: string;
  slug: string;
  title: string;
  organizerTimezone: string;
  createdAt: string;
  earliestDate: string;
  thisWeekStartDate: string;
  thisWeekEndDate: string;
  nextWeekStartDate: string;
  nextWeekEndDate: string;
  status: 'awaiting' | 'submitted';
  response?: AvailabilityResponse;
};

export const HALF_HOUR = 30 * 60 * 1000;
export const MAX_SLOTS = 14 * 28;
export const scopeLabels: Record<Scope, string> = {
  this_week: 'This week',
  next_week: 'Next week',
  both: 'Both weeks',
};

export function isScope(value: unknown): value is Scope {
  return value === 'this_week' || value === 'next_week' || value === 'both';
}

export function validTimezone(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length > 100 ||
    !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)+$|^UTC$/.test(value)
  )
    return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

const formatters = new Map<string, Intl.DateTimeFormat>();
export function localParts(timestamp: number | string, timezone: string) {
  let formatter = formatters.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    // Bound the cache because timezone choices arrive from public submissions.
    if (formatters.size >= 64) formatters.clear();
    formatters.set(timezone, formatter);
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(timestamp)).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
    second: Number(parts.second),
  };
}

// Calendar-date arithmetic is done in UTC, independently of the machine's timezone.
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

export function freezeWeeks(now: Date, timezone: string) {
  const earliestDate = localParts(now.getTime(), timezone).date;
  const weekday = new Date(`${earliestDate}T12:00:00Z`).getUTCDay();
  const monday = addDays(earliestDate, -((weekday + 6) % 7));
  return {
    earliestDate,
    thisWeekStartDate: monday,
    thisWeekEndDate: addDays(monday, 6),
    nextWeekStartDate: addDays(monday, 7),
    nextWeekEndDate: addDays(monday, 13),
  };
}

export function weekDates(request: AvailabilityRequest, week: Week): string[] {
  const start = week === 'this_week' ? request.thisWeekStartDate : request.nextWeekStartDate;
  return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(
    (date) => date >= request.earliestDate,
  );
}

export function provided(scope: Scope, week: Week): boolean {
  return scope === 'both' || scope === week;
}

export function dateInScope(request: AvailabilityRequest, scope: Scope, date: string): boolean {
  return (
    date >= request.earliestDate &&
    ((provided(scope, 'this_week') &&
      date >= request.thisWeekStartDate &&
      date <= request.thisWeekEndDate) ||
      (provided(scope, 'next_week') &&
        date >= request.nextWeekStartDate &&
        date <= request.nextWeekEndDate))
  );
}

// Resolve wall time with Intl's IANA rules; round-trip verification rejects DST gaps.
// Offset samples also handle zones with 30/45-minute offsets and ambiguous wall times.
export function wallTimeToUtc(date: string, minute: number, timezone: string): string[] {
  const wall = Date.parse(`${date}T00:00:00Z`) + minute * 60000;
  const offsets = new Set<number>();
  for (const delta of [-36, 0, 36]) {
    const sample = wall + delta * 3600000;
    const parts = localParts(sample, timezone);
    offsets.add(Date.parse(`${parts.date}T00:00:00Z`) + parts.minute * 60000 - sample);
  }
  return [...offsets]
    .map((offset) => wall - offset)
    .filter((instant) => {
      const parts = localParts(instant, timezone);
      return parts.date === date && parts.minute === minute && parts.second === 0;
    })
    .sort((a, b) => a - b)
    .map((instant) => new Date(instant).toISOString());
}

export function slotAllowed(
  request: AvailabilityRequest,
  scope: Scope,
  timezone: string,
  slot: string,
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(slot)) return false;
  const instant = Date.parse(slot);
  if (!Number.isFinite(instant) || new Date(instant).toISOString() !== slot) return false;
  const start = localParts(instant, timezone);
  const end = localParts(instant + HALF_HOUR, timezone);
  return (
    dateInScope(request, scope, start.date) &&
    start.second === 0 &&
    start.minute >= 480 &&
    start.minute <= 1290 &&
    start.minute % 30 === 0 &&
    end.date === start.date &&
    end.minute === start.minute + 30 &&
    end.second === 0
  );
}

export function validateSlots(
  request: AvailabilityRequest,
  timezone: unknown,
  scope: unknown,
  slots: unknown,
  now = Date.now(),
): string[] {
  if (
    !validTimezone(timezone) ||
    !isScope(scope) ||
    !Array.isArray(slots) ||
    slots.length > MAX_SLOTS
  )
    throw new Error('Invalid availability.');
  const existing = new Set(request.response?.availableSlots ?? []);
  const today = localParts(now, timezone).date;
  const result = new Set<string>();
  for (const slot of slots) {
    if (typeof slot !== 'string' || !slotAllowed(request, scope, timezone, slot))
      throw new Error('Invalid availability.');
    // Existing past availability can remain in an edit, but cannot be newly added.
    if (
      localParts(slot, timezone).date < today &&
      !(request.response?.timezone === timezone && existing.has(slot))
    )
      throw new Error('Past dates cannot be selected.');
    if (result.has(slot)) throw new Error('Duplicate availability.');
    result.add(slot);
  }
  return [...result].sort();
}

export function dateLabel(date: string, long = false): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    weekday: long ? 'long' : 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`));
}

export function timeLabel(minute: number): string {
  const hour = Math.floor(minute / 60) % 24;
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
