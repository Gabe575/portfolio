'use client';

export default function SchedulerError({ reset }: { reset: () => void }) {
  return (
    <div className="scheduler-card space-y-4">
      <h1 className="text-2xl">Availability is temporarily unavailable</h1>
      <p>Please try again in a moment.</p>
      <button className="scheduler-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
