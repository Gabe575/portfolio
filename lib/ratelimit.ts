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

export const schedulerLoginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'scheduler:v1:limit:login',
});

export const schedulerSubmissionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(12, '1 h'),
  prefix: 'scheduler:v1:limit:submission',
});

export const schedulerLinkLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'scheduler:v1:limit:link',
});
