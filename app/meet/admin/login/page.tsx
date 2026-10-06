import { redirect } from 'next/navigation';
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
    <div className="scheduler-card mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl">Scheduler admin</h1>
      <p className="scheduler-muted">Sign in to create availability links and view availability.</p>
      {expired && (
        <p className="scheduler-muted text-sm" role="status">
          Please sign in to continue. Sessions expire after eight hours.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
