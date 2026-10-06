import { notFound } from 'next/navigation';
import { getPublicRequest } from '@lib/scheduler/store';
import ClientEditor from '../components/client-editor';

export const dynamic = 'force-dynamic';

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const request = await getPublicRequest(slug);
  if (!request) notFound();
  return <ClientEditor request={request} />;
}
