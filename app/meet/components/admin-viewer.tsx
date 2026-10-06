'use client';

import { useMemo, useState } from 'react';
import {
  addDays,
  dateInScope,
  dateLabel,
  HALF_HOUR,
  localParts,
  provided,
  scopeLabels,
  weekDates,
  type AvailabilityRequest,
  type Week,
} from '@lib/scheduler/time';
import AvailabilityGrid from './availability-grid';

export default function AdminViewer({ request }: { request: AvailabilityRequest }) {
  const [week, setWeek] = useState<Week>(
    request.response?.scope === 'next_week' ? 'next_week' : 'this_week',
  );
  const display = useMemo(() => {
    const response = request.response;
    const slots = (response?.availableSlots ?? []).filter(
      (slot) => response && dateInScope(request, week, localParts(slot, response.timezone).date),
    );
    const original = weekDates(request, week);
    let first = original[0];
    let last = original[original.length - 1];
    // The source week can spill across date boundaries after conversion.
    // Include those dates so midnight/edge-of-week availability is never hidden.
    for (const slot of slots) {
      const start = localParts(slot, request.organizerTimezone).date;
      const end = localParts(Date.parse(slot) + HALF_HOUR - 1, request.organizerTimezone).date;
      if (start < first) first = start;
      if (end > last) last = end;
    }
    const dates: string[] = [];
    for (let date = first; date <= last; date = addDays(date, 1)) dates.push(date);
    return { slots, dates };
  }, [request, week]);

  return (
    <div className="scheduler-card space-y-5">
      <div className="flex flex-wrap gap-2" aria-label="Displayed week">
        {(['this_week', 'next_week'] as Week[]).map((value) => (
          <button
            key={value}
            type="button"
            className={`scheduler-button ${week === value ? 'scheduler-choice-active' : ''}`}
            aria-pressed={week === value}
            onClick={() => setWeek(value)}
          >
            {scopeLabels[value]}
          </button>
        ))}
      </div>
      {!request.response ? (
        <div className="py-10 text-center">
          <h2 className="text-xl">Awaiting availability</h2>
          <p className="scheduler-muted mt-3">
            Copy the availability link and send it to the person you want to meet with. Their
            availability will appear here after submission.
          </p>
        </div>
      ) : !provided(request.response.scope, week) ? (
        <div className="py-10 text-center">
          <h2 className="text-xl">This week was not provided</h2>
          <p className="scheduler-muted mt-3">
            This does not necessarily mean that they&apos;re unavailable during this week.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl">
            {scopeLabels[week]} · {dateLabel(display.dates[0])} -{' '}
            {dateLabel(display.dates[display.dates.length - 1])}
          </h2>
          <p className="scheduler-muted text-sm">
            Shown in {request.organizerTimezone}. Weeks refer to the respondent&apos;s selected
            dates; conversion may extend into an adjacent day.
          </p>
          {display.slots.length === 0 && (
            <p className="scheduler-muted">
              The respondent provided this week with no available times.
            </p>
          )}
          <AvailabilityGrid
            key={`${week}:${request.organizerTimezone}`}
            dates={display.dates}
            timezone={request.organizerTimezone}
            slots={display.slots}
            readOnly
          />
        </>
      )}
    </div>
  );
}
