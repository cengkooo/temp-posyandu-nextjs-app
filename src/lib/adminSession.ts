import { getRedis } from '@/lib/upstash'

export const ADMIN_SESSION_COOKIE = 'admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 10 * 60

function keyFor(sessionId: string) {
  return `admin:session:${sessionId}`
}

export function isAdminSessionFeatureEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export async function isAdminSessionActive(sessionId: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true

  const value = await redis.get<string | null>(keyFor(sessionId))
  return value !== null && value !== undefined
}

export async function createAdminSession(sessionId: string, userId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.set(keyFor(sessionId), userId, { ex: ADMIN_SESSION_TTL_SECONDS })
}

export async function touchAdminSession(sessionId: string, userId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.set(keyFor(sessionId), userId, { ex: ADMIN_SESSION_TTL_SECONDS })
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.del(keyFor(sessionId))
}
