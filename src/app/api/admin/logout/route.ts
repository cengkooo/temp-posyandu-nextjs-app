import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionFeatureEnabled,
  revokeAdminSession,
} from '@/lib/adminSession'

export async function POST() {
  const cookieStore = await cookies()
  const adminSessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (adminSessionId && isAdminSessionFeatureEnabled()) {
    await revokeAdminSession(adminSessionId)
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })

  return NextResponse.json({ ok: true })
}
