import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import redis from '@lib/redis';

const SESSION_SECONDS = 8 * 60 * 60;
const COOKIE =
  process.env.NODE_ENV === 'production' ? '__Host-scheduler-session' : 'scheduler-session';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const sessionKey = (token: string) => `scheduler:v1:session:${digest(token)}`;

export function passwordMatches(input: string): boolean {
  const password = process.env.SCHEDULER_ADMIN_PASSWORD;
  return (
    Boolean(password) &&
    timingSafeEqual(Buffer.from(digest(input), 'hex'), Buffer.from(digest(password ?? ''), 'hex'))
  );
}

export async function hasAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!process.env.SCHEDULER_ADMIN_PASSWORD || !token || !/^[A-Za-z0-9_-]{43}$/.test(token))
    return false;
  return (await redis.get<string>(sessionKey(token))) === 'owner';
}

export async function requireAdmin(): Promise<void> {
  if (!(await hasAdminSession())) redirect('/meet/admin/login?expired=1');
}

export async function startSession(): Promise<void> {
  const cookieStore = await cookies();
  const previous = cookieStore.get(COOKIE)?.value;
  if (previous && /^[A-Za-z0-9_-]{43}$/.test(previous)) await redis.del(sessionKey(previous));
  const token = randomBytes(32).toString('base64url');
  await redis.set(sessionKey(token), 'owner', { ex: SESSION_SECONDS });
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) await redis.del(sessionKey(token));
  cookieStore.delete(COOKIE);
}

export async function requesterIp(): Promise<string> {
  const requestHeaders = await headers();
  // Vercel supplies this trusted header in production; forwarded-for is the local fallback.
  return (
    requestHeaders.get('x-vercel-forwarded-for') ??
    requestHeaders.get('x-forwarded-for') ??
    'unknown'
  )
    .split(',')[0]
    .trim()
    .slice(0, 100);
}
