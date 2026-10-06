'use client';

import { useActionState, useState } from 'react';
import { createAvailabilityRequest, loginAdmin, removeAvailabilityRequest } from '../actions';
import TimezoneSelect from './timezone-select';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, {});
  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Admin password</span>
        <input
          className="scheduler-input w-full"
          type="password"
          name="password"
          autoComplete="current-password"
          maxLength={1024}
          required
          disabled={pending}
        />
      </label>
      <button className="scheduler-button scheduler-primary" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      {state.error && (
        <p className="scheduler-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function CreateRequestForm({ defaultTimezone }: { defaultTimezone: string }) {
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [state, action, pending] = useActionState(createAvailabilityRequest, {});
  return (
    <form action={action} className="scheduler-card space-y-5">
      <h2 className="text-2xl">New availability request</h2>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Meeting name</span>
        <input
          className="scheduler-input w-full"
          name="title"
          placeholder="Meeting Name"
          maxLength={160}
          required
          disabled={pending}
        />
      </label>
      <TimezoneSelect value={timezone} onChange={setTimezone} disabled={pending} />
      <p className="text-sm scheduler-muted">
        Create a private link for one person to share their availability. This week and next week
        are fixed using this timezone when you create the request.
      </p>
      <button className="scheduler-button scheduler-primary" disabled={pending}>
        {pending ? 'Creating request…' : 'Create availability link'}
      </button>
      {state.error && (
        <p className="scheduler-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function CopyRecipientLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState('');
  return (
    <div className="space-y-2">
      <button
        type="button"
        className="scheduler-button"
        onClick={async () => {
          const url = `${window.location.origin}/meet/${slug}`;
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          } catch {
            setFallback(url);
          }
        }}
      >
        {copied ? 'Availability link copied' : 'Copy availability link'}
      </button>
      {copied && (
        <span role="status" className="sr-only">
          Availability link copied to clipboard
        </span>
      )}
      {fallback && (
        <label className="block text-sm">
          Copy this link
          <input
            className="scheduler-input w-full"
            readOnly
            value={fallback}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </div>
  );
}

export function DeleteRequestButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(removeAvailabilityRequest.bind(null, id), {});
  return (
    <div className="space-y-3">
      {!confirming ? (
        <button
          type="button"
          className="scheduler-button scheduler-danger"
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
      ) : (
        <form action={action} className="space-y-3 rounded-lg border border-red-700/40 p-4">
          <p className="text-sm">
            Permanently delete “{title}” and all its availability? The availability link will stop
            working.
          </p>
          <input type="hidden" name="confirmed" value="yes" />
          <div className="flex flex-wrap gap-2">
            <button className="scheduler-button scheduler-danger" disabled={pending}>
              {pending ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              className="scheduler-button"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {state.error && (
        <p className="scheduler-error" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
