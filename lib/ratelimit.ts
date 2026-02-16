import { Ratelimit } from '@upstash/ratelimit';
import redis from '@lib/redis';

export const ipRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, '1 h'),
  prefix: 'rate-limit:ip:',
});

export const globalRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(45, '24 h'),
  prefix: 'rate-limit:global:',
});
