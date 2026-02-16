import { Ratelimit } from '@upstash/ratelimit';
import redis from '@lib/redis';

export const ipRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rate-limit:ip:',
});

export const globalRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '24 h'),
  prefix: 'rate-limit:global:',
});
