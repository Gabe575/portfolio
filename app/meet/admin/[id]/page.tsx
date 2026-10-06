import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@lib/scheduler/auth';
import { getRequest } from '@lib/scheduler/store';
import { dateLabel, scopeLabels } from '@lib/scheduler/time';
import { CopyRecipientLink, DeleteRequestButton } from '../../components/admin-controls';
import AdminViewer from '../../components/admin-viewer';
import { logoutAdmin } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();
  const format = (value: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: request.organizerTimezone,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3">
        <Link href="/meet/admin" className="scheduler-muted hover:underline">
          ← All requests
        </Link>
        <form action={logoutAdmin}>
          <button className="scheduler-button">Log out</button>
        </form>
      </div>
      <h1 className="section-title break-words">{request.title}</h1>
      <div className="scheduler-card space-y-5">
        <span
          className={`scheduler-status ${request.status === 'submitted' ? 'scheduler-status-received' : ''}`}
        >
          {request.status === 'submitted' ? 'Availability received' : 'Awaiting availability'}
        </span>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="scheduler-muted">Created</dt>
            <dd>{format(request.createdAt)}</dd>
          </div>
          <div>
            <dt className="scheduler-muted">Organizer timezone</dt>
            <dd>{request.organizerTimezone}</dd>
          </div>
          <div>
            <dt className="scheduler-muted">Frozen this week</dt>
            <dd>
              {dateLabel(request.thisWeekStartDate)} - {dateLabel(request.thisWeekEndDate)}
            </dd>
            <dd className="scheduler-muted">Selectable from {dateLabel(request.earliestDate)}</dd>
          </div>
          <div>
            <dt className="scheduler-muted">Frozen next week</dt>
            <dd>
              {dateLabel(request.nextWeekStartDate)} - {dateLabel(request.nextWeekEndDate)}
            </dd>
          </div>
          {request.response && (
            <>
              <div>
                <dt className="scheduler-muted">Selected timezone</dt>
                <dd>{request.response.timezone}</dd>
              </div>
              <div>
                <dt className="scheduler-muted">Selected scope</dt>
                <dd>{scopeLabels[request.response.scope]}</dd>
              </div>
              <div>
                <dt className="scheduler-muted">First submitted</dt>
                <dd>{format(request.response.submittedAt)}</dd>
              </div>
              <div>
                <dt className="scheduler-muted">Last updated</dt>
                <dd>{format(request.response.updatedAt)}</dd>
              </div>
            </>
          )}
        </dl>
        <div className="flex flex-wrap items-start gap-3">
          <CopyRecipientLink slug={request.slug} />
          <DeleteRequestButton id={request.id} title={request.title} />
        </div>
      </div>
      <AdminViewer request={request} />
    </div>
  );
}
