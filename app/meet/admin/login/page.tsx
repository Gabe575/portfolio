import { redirect } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import { hasAdminSession } from '@lib/scheduler/auth';
import { LoginForm } from '../../components/admin-controls';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  if (await hasAdminSession()) redirect('/meet/admin');
  const { expired } = await searchParams;
  return (
    <div className="scheduler-card mx-auto max-w-md space-y-6 sm:p-10">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface-2">
        <FiLock aria-hidden className="text-accent" />
      </div>
      <div className="space-y-2">
        <p className="scheduler-label">Admin</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Scheduler admin</h1>
        <p className="scheduler-muted">
          Sign in to create availability links and view availability.
        </p>
      </div>
      {expired && (
        <p className="scheduler-muted text-sm" role="status">
          Please sign in to continue. Sessions expire after eight hours.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
