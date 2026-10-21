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

  const weekTabs = (['this_week', 'next_week'] as Week[]).filter((value) => provided(scope, value));

  return (
    <form action={action} className="space-y-5">
      <header className="space-y-4 pb-4">
        <p className="scheduler-label">Availability request</p>
        <h1 className="scheduler-title wrap-break-word">{request.title}</h1>
        <p className="scheduler-muted max-w-2xl text-lg">
          Select all the times when you&apos;re available for a conversation. This shares your
          availability with the organizer.
        </p>
        <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-faint">
          <span className="rounded-full border border-line px-3 py-1 text-muted">
            {dateLabel(request.earliestDate)} – {dateLabel(request.nextWeekEndDate)}
          </span>
          Dates fixed when this request was created.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="scheduler-card space-y-4">
          <p className="scheduler-step">
            <span>1</span> Your timezone
          </p>
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
        </section>

        <section className="scheduler-card space-y-4">
          <p className="scheduler-step">
            <span>2</span> Weeks to share
          </p>
          <fieldset disabled={pending}>
            <legend className="mb-3 text-sm font-medium">
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
          <p className="scheduler-muted text-sm">
            Blank times in your chosen weeks mean unavailable. Any other week is not provided.
          </p>
        </section>
      </div>

      <section className="scheduler-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="scheduler-step">
              <span>3</span> Select times
            </p>
            <p className="font-display text-xl font-semibold tracking-tight">
              {dateLabel(dates[0])} – {dateLabel(dates[dates.length - 1])}
              <span className="ml-2 font-mono text-xs font-normal text-faint">{timezone}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {weekTabs.length > 1 && (
              <div className="scheduler-segment" aria-label="Displayed week">
                {weekTabs.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className="scheduler-tab"
                    aria-pressed={week === value}
                    onClick={() => setWeek(value)}
                  >
                    {scopeLabels[value]}
                  </button>
                ))}
              </div>
            )}
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
        </div>
        {!ready ? (
          <p role="status" className="scheduler-muted py-10 text-center">
            Detecting your timezone…
          </p>
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
        <p className="scheduler-muted text-sm">
          Past dates cannot be selected. Each available block lasts 30 minutes.
        </p>
      </section>

      <input type="hidden" name="slots" value={JSON.stringify(submittedSlots)} />

      <div
        className="scheduler-card sticky bottom-4 z-10 space-y-3 bg-surface/85 backdrop-blur-xl sm:p-5"
        aria-live="polite"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {submittedSlots.length ? (
              <>
                <span className="text-spectrum font-display text-2xl font-semibold">
                  {submittedSlots.length}
                </span>{' '}
                <span className="scheduler-muted">half-hour blocks selected.</span>
              </>
            ) : (
              <span className="scheduler-muted">
                No availability selected. You can submit this to let the organizer know you&apos;re
                unavailable during your chosen weeks.
              </span>
            )}
            {dirty && (request.response || state.success) && (
              <span className="mt-1 block font-mono text-xs text-amber-700 dark:text-amber-300">
                You have unsaved changes.
              </span>
            )}
          </p>
          <button
            className="scheduler-button scheduler-primary shrink-0"
            type="submit"
            disabled={!ready || pending}
          >
            {pending
              ? 'Saving availability…'
              : request.response || state.success
                ? 'Save changes'
                : 'Submit availability'}
          </button>
        </div>
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
      </div>
    </form>
  );
}
