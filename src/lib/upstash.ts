import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

type CacheResult<T> = {
  value: T
  cache: 'HIT' | 'MISS' | 'BYPASS'
}

let redisSingleton: Redis | null = null

function isRedisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null
  if (!redisSingleton) {
    redisSingleton = Redis.fromEnv()
  }
  return redisSingleton
}

async function getCacheVersion(namespace: string): Promise<number> {
  const redis = getRedis()
  if (!redis) return 1

  const versionKey = `cachever:${namespace}`
  const existing = await redis.get<number | string>(versionKey)

  if (existing === null || existing === undefined) {
    await redis.set(versionKey, 1)
    return 1
  }

  const parsed = typeof existing === 'number' ? existing : Number(existing)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export async function bumpCacheVersion(namespace: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.incr(`cachever:${namespace}`)
}

export async function cachedJson<T>(opts: {
  namespace: string
  key: string
  ttlSeconds: number
  producer: () => Promise<T>
}): Promise<CacheResult<T>> {
  const redis = getRedis()
  if (!redis) {
    return { value: await opts.producer(), cache: 'BYPASS' }
  }

  const version = await getCacheVersion(opts.namespace)
  const fullKey = `cache:${opts.namespace}:v${version}:${opts.key}`

  const cached = await redis.get<string>(fullKey)
  if (cached) {
    try {
      return { value: JSON.parse(cached) as T, cache: 'HIT' }
    } catch {
      // Corrupt cache entry; fall through to recompute.
      await redis.del(fullKey)
    }
  }

  const value = await opts.producer()
  await redis.set(fullKey, JSON.stringify(value), { ex: opts.ttlSeconds })
  return { value, cache: 'MISS' }
}

export function getRequestIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) return xForwardedFor.split(',')[0]?.trim() || 'unknown'

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp

  return 'unknown'
}

type RatelimitDuration =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`

const ratelimiters = new Map<string, Ratelimit>()

function getRatelimiter(opts: {
  prefix: string
  limit: number
  window: RatelimitDuration
}): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  const key = `${opts.prefix}|${opts.limit}|${opts.window}`
  const existing = ratelimiters.get(key)
  if (existing) return existing

  const created = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, opts.window),
    analytics: true,
    prefix: `rl:${opts.prefix}`,
  })

  ratelimiters.set(key, created)
  return created
}

export async function checkRateLimit(
  request: Request,
  opts: {
    prefix: string
    limit?: number
    window?: RatelimitDuration
    identifier?: string
  }
): Promise<
  | { ok: true; limit: number; remaining: number; reset: number }
  | { ok: false; limit: number; remaining: number; reset: number }
  | { ok: true; bypass: true }
> {
  if (process.env.RATE_LIMIT_ENABLED !== 'true') {
    return { ok: true, bypass: true }
  }

  const limit = opts.limit ?? 60
  const window = opts.window ?? '1 m'
  const identifier = opts.identifier ?? getRequestIp(request)

  const ratelimit = getRatelimiter({ prefix: opts.prefix, limit, window })
  if (!ratelimit) {
    return { ok: true, bypass: true }
  }

  const result = await ratelimit.limit(identifier)

  if (result.success) {
    return {
      ok: true,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  return {
    ok: false,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
