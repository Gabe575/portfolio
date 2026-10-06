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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Meeting availability</h1>
          <p className="scheduler-muted mt-3">
            Generate private links to collect meeting availability.
          </p>
        </div>
        <form action={logoutAdmin}>
          <button className="scheduler-button">Log out</button>
        </form>
      </div>
      <CreateRequestForm defaultTimezone={timezone} />
      <h2 className="text-2xl">
        Your requests <span className="scheduler-muted text-base">({requests.length})</span>
      </h2>
      {requests.length === 0 ? (
        <div className="scheduler-card">
          <p className="scheduler-muted">
            No availability requests yet. Create your first availability link above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="scheduler-card space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl wrap-break-word">{request.title}</h3>
                  <p className="scheduler-muted mt-2 text-sm">
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
              <div className="flex flex-wrap items-start gap-3">
                <Link className="scheduler-button" href={`/meet/admin/${request.id}`}>
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
