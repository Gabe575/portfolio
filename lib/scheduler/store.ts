import 'server-only';
import { randomBytes } from 'node:crypto';
import redis from '@lib/redis';
import { freezeWeeks, type AvailabilityRequest, type AvailabilityResponse } from './time';

const PREFIX = 'scheduler:v1:';
const INDEX = `${PREFIX}requests`;
export const validId = (id: string) => /^[a-f0-9]{32}$/.test(id);
export const validSlug = (slug: string) => /^[A-Za-z0-9_-]{43}$/.test(slug);
const requestKey = (id: string) => `${PREFIX}request:${id}`;
const responseKey = (id: string) => `${PREFIX}response:${id}`;
const slugKey = (slug: string) => `${PREFIX}slug:${slug}`;

export async function getRequest(id: string): Promise<AvailabilityRequest | null> {
  if (!validId(id)) return null;
  const [request, response] = await redis.mget<
    [AvailabilityRequest | null, AvailabilityResponse | null]
  >(requestKey(id), responseKey(id));
  return request
    ? { ...request, status: response ? 'submitted' : 'awaiting', ...(response ? { response } : {}) }
    : null;
}

export async function getPublicRequest(slug: string): Promise<AvailabilityRequest | null> {
  if (!validSlug(slug)) return null;
  const id = await redis.get<string>(slugKey(slug));
  if (!id || !validId(id)) return null;
  const request = await getRequest(id);
  return request?.slug === slug ? request : null;
}

export async function listRequests(): Promise<AvailabilityRequest[]> {
  const ids = await redis.zrange<string[]>(INDEX, 0, -1, { rev: true });
  const records: AvailabilityRequest[] = [];
  // Batch large lists to keep individual Redis REST requests bounded.
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100).filter(validId);
    if (!batch.length) continue;
    const values = await redis.mget<(AvailabilityRequest | AvailabilityResponse | null)[]>(
      ...batch.flatMap((id) => [requestKey(id), responseKey(id)]),
    );
    for (let i = 0; i < values.length; i += 2) {
      const request = values[i] as AvailabilityRequest | null;
      const response = values[i + 1] as AvailabilityResponse | null;
      if (request)
        records.push({
          ...request,
          status: response ? 'submitted' : 'awaiting',
          ...(response ? { response } : {}),
        });
    }
  }
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRequest(
  title: string,
  organizerTimezone: string,
): Promise<AvailabilityRequest> {
  const now = new Date();
  const request: AvailabilityRequest = {
    id: randomBytes(16).toString('hex'),
    slug: randomBytes(32).toString('base64url'),
    title,
    organizerTimezone,
    createdAt: now.toISOString(),
    status: 'awaiting',
    ...freezeWeeks(now, organizerTimezone),
  };
  const created = await redis.eval<(string | number)[], number>(
    `
    if redis.call('EXISTS', KEYS[1]) == 1 or redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
    redis.call('SET', KEYS[1], ARGV[1])
    redis.call('SET', KEYS[2], ARGV[2])
    redis.call('ZADD', KEYS[3], ARGV[3], ARGV[2])
    return 1
  `,
    [requestKey(request.id), slugKey(request.slug), INDEX],
    [JSON.stringify(request), request.id, now.getTime()],
  );
  if (created !== 1) throw new Error('Could not create request.');
  return request;
}

export async function saveResponse(
  request: AvailabilityRequest,
  response: AvailabilityResponse,
): Promise<'new' | 'update' | null> {
  // Read + replace atomically: a concurrent delete cannot resurrect a request,
  // and simultaneous submissions still preserve the original submission time.
  const result = await redis.eval<string[], number>(
    `
    local raw = redis.call('GET', KEYS[1])
    if not raw or redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
    local request = cjson.decode(raw)
    if request.slug ~= ARGV[2] then return 0 end
    local previous = redis.call('GET', KEYS[3])
    local submittedAt = ARGV[5]
    local result = 1
    if previous then
      submittedAt = cjson.decode(previous).submittedAt
      result = 2
    end
    -- Keep slots as validated JSON: Lua cjson re-encodes an empty array as {}.
    local response = '{"timezone":' .. cjson.encode(ARGV[3]) .. ',"scope":' .. cjson.encode(ARGV[4]) .. ',"submittedAt":' .. cjson.encode(submittedAt) .. ',"updatedAt":' .. cjson.encode(ARGV[6]) .. ',"availableSlots":' .. ARGV[7] .. '}'
    redis.call('SET', KEYS[3], response)
    return result
  `,
    [requestKey(request.id), slugKey(request.slug), responseKey(request.id)],
    [
      request.id,
      request.slug,
      response.timezone,
      response.scope,
      response.submittedAt,
      response.updatedAt,
      JSON.stringify(response.availableSlots),
    ],
  );
  return result === 1 ? 'new' : result === 2 ? 'update' : null;
}

export async function deleteRequest(id: string): Promise<void> {
  if (!validId(id)) throw new Error('Invalid request.');
  const request = await getRequest(id);
  if (!request) return;
  await redis.eval(
    `
    redis.call('DEL', KEYS[1], KEYS[2], KEYS[3])
    redis.call('ZREM', KEYS[4], ARGV[1])
    return 1
  `,
    [requestKey(id), slugKey(request.slug), responseKey(id), INDEX],
    [id],
  );
}
