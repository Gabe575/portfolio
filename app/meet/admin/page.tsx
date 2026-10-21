import Link from 'next/link';
import { requireAdmin } from '@lib/scheduler/auth';
import { listRequests } from '@lib/scheduler/store';
import { validTimezone } from '@lib/scheduler/time';
import { logoutAdmin } from '../actions';
import {
  CopyRecipientLink,
  CreateRequestForm,
  DeleteRequestButton,
} from '../components/admin-controls';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdmin();
  const requests = await listRequests();
  const configured = process.env.SCHEDULER_ORGANIZER_TIMEZONE ?? 'America/Toronto';
  const timezone = validTimezone(configured) ? configured : 'America/Toronto';
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="scheduler-label">Admin</p>
          <h1 className="scheduler-title mt-3">Meeting availability</h1>
          <p className="scheduler-muted mt-3 text-lg">
            Generate private links to collect meeting availability.
          </p>
        </div>
        <form action={logoutAdmin}>
          <button className="scheduler-button">Log out</button>
        </form>
      </div>
      <CreateRequestForm defaultTimezone={timezone} />
      <h2 className="flex items-baseline gap-3 pt-4 font-display text-2xl font-semibold tracking-tight">
        Your requests
        <span className="font-mono text-sm font-normal text-faint">{requests.length}</span>
      </h2>
      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-strong p-10 text-center">
          <p className="scheduler-muted">
            No availability requests yet. Create your first availability link above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <article key={request.id} className="scheduler-card flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight wrap-break-word">
                    {request.title}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-faint">
                    Created{' '}
                    {new Intl.DateTimeFormat('en-CA', {
                      timeZone: request.organizerTimezone,
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(request.createdAt))}{' '}
                    · {request.organizerTimezone}
                  </p>
                </div>
                <span
                  className={`scheduler-status ${request.status === 'submitted' ? 'scheduler-status-received' : ''}`}
                >
                  {request.status === 'submitted'
                    ? 'Availability received'
                    : 'Awaiting availability'}
                </span>
              </div>
              <div className="mt-auto flex flex-wrap items-start gap-2 border-t border-line pt-5">
                <Link
                  className="scheduler-button scheduler-primary"
                  href={`/meet/admin/${request.id}`}
                >
                  View
                </Link>
                <CopyRecipientLink slug={request.slug} />
                <DeleteRequestButton id={request.id} title={request.title} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
