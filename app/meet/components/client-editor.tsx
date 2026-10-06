'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { submitAvailability } from '../actions';
import {
  dateInScope,
  dateLabel,
  localParts,
  provided,
  scopeLabels,
  validTimezone,
  weekDates,
  type AvailabilityRequest,
  type Scope,
  type Week,
} from '@lib/scheduler/time';
import AvailabilityGrid from './availability-grid';
import TimezoneSelect from './timezone-select';

export default function ClientEditor({ request }: { request: AvailabilityRequest }) {
  const [timezone, setTimezone] = useState(request.response?.timezone ?? request.organizerTimezone);
  const [scope, setScope] = useState<Scope>(request.response?.scope ?? 'this_week');
  const [week, setWeek] = useState<Week>(
    request.response?.scope === 'next_week' ? 'next_week' : 'this_week',
  );
  const [slots, setSlots] = useState(request.response?.availableSlots ?? []);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [today, setToday] = useState('');
  const [state, action, pending] = useActionState(submitAvailability.bind(null, request.slug), {});
  const dates = useMemo(() => weekDates(request, week), [request, week]);
  const submittedSlots = slots.filter((slot) =>
    dateInScope(request, scope, localParts(slot, timezone).date),
  );

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const initial =
      request.response?.timezone ??
      (validTimezone(detected) ? detected : request.organizerTimezone);
    // Browser timezone is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimezone(initial);
    setToday(localParts(Date.now(), initial).date);
    setReady(true);
  }, [request.response?.timezone, request.organizerTimezone]);

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDirty(false);
    }
  }, [state]);

  function changeScope(value: Scope) {
    setScope(value);
    if (!provided(value, week)) setWeek(value === 'next_week' ? 'next_week' : 'this_week');
    setDirty(true);
  }

  return (
    <form action={action} className="space-y-7">
      <div className="space-y-3">
        <h1 className="section-title wrap-break-word">{request.title}</h1>
        <p className="scheduler-muted">
          Select all the times when you&apos;re available for a conversation. This shares your
          availability with the organizer.
        </p>
        <p className="text-sm scheduler-muted">
          {dateLabel(request.earliestDate)} - {dateLabel(request.nextWeekEndDate)} · Dates fixed
          when this request was created.
        </p>
      </div>
      <div className="scheduler-card space-y-6">
        <TimezoneSelect
          value={timezone}
          disabled={!ready || pending}
          onChange={(value) => {
            if (
              slots.length &&
              !window.confirm('Changing timezone clears your selected times. Continue?')
            )
              return;
            setTimezone(value);
            setSlots([]);
            setDirty(true);
            setToday(localParts(Date.now(), value).date);
          }}
        />
        <p className="scheduler-muted text-sm">
          Choose your timezone before selecting times. Changing it clears your selection.
        </p>
        <fieldset disabled={pending}>
          <legend className="mb-3 text-sm font-semibold">
            Which weeks would you like to provide?
          </legend>
          <div className="flex flex-wrap gap-2">
            {(['this_week', 'next_week', 'both'] as Scope[]).map((value) => (
              <label
                key={value}
                className={`scheduler-choice ${scope === value ? 'scheduler-choice-active' : ''}`}
              >
                <input
                  type="radio"
                  name="scope"
                  value={value}
                  checked={scope === value}
                  onChange={() => changeScope(value)}
                />{' '}
                {scopeLabels[value]}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="text-sm scheduler-muted">
          Blank times in your chosen weeks mean unavailable. Any other week is not provided.
        </p>
      </div>
      <div className="scheduler-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" aria-label="Displayed week">
            {(['this_week', 'next_week'] as Week[])
              .filter((value) => provided(scope, value))
              .map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`scheduler-button ${week === value ? 'scheduler-choice-active' : ''}`}
                  aria-pressed={week === value}
                  onClick={() => setWeek(value)}
                >
                  {scopeLabels[value]}
                </button>
              ))}
          </div>
          <button
            type="button"
            className="scheduler-button"
            disabled={pending || !ready}
            onClick={() => {
              setSlots(slots.filter((slot) => !dates.includes(localParts(slot, timezone).date)));
              setDirty(true);
            }}
          >
            Clear this week
          </button>
        </div>
        <p className="text-sm font-semibold">
          {dateLabel(dates[0])} - {dateLabel(dates[dates.length - 1])} · {timezone}
        </p>
        {!ready ? (
          <p role="status">Detecting your timezone…</p>
        ) : (
          <AvailabilityGrid
            key={`${week}:${timezone}`}
            dates={dates}
            timezone={timezone}
            slots={slots}
            today={today}
            disabled={pending}
            onChange={(value) => {
              setSlots(value);
              setDirty(true);
            }}
          />
        )}
        <p className="text-sm scheduler-muted">
          Past dates cannot be selected. Each available block lasts 30 minutes.
        </p>
      </div>
      <input type="hidden" name="slots" value={JSON.stringify(submittedSlots)} />
      <div className="space-y-3" aria-live="polite">
        <p className="scheduler-muted text-sm">
          {submittedSlots.length
            ? `${submittedSlots.length} half-hour blocks selected.`
            : "No availability selected. You can submit this to let the organizer know you're unavailable during your chosen weeks."}
        </p>
        <button
          className="scheduler-button scheduler-primary"
          type="submit"
          disabled={!ready || pending}
        >
          {pending
            ? 'Saving availability…'
            : request.response || state.success
              ? 'Save changes'
              : 'Submit availability'}
        </button>
        {state.error && (
          <p role="alert" className="scheduler-error">
            {state.error}
          </p>
        )}
        {state.success && !dirty && (
          <p role="status" className="scheduler-success">
            Your availability was saved. You can return using this same link whenever you need to
            make changes.
          </p>
        )}
        {dirty && (request.response || state.success) && (
          <p className="scheduler-muted text-sm">You have unsaved changes.</p>
        )}
      </div>
    </form>
  );
}
