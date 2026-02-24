import { NextResponse } from 'next/server';
import { redis } from '@lib/redis';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await redis.set('keepalive', Date.now(), { ex: 7 * 24 * 60 * 60 });

    return NextResponse.json({ message: 'Pinged Upstash', result });
  } catch (error) {
    return NextResponse.json({ message: 'Ping failed', error }, { status: 500 });
  }
}
