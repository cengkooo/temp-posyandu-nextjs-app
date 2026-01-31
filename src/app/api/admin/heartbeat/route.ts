import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionActive,
  isAdminSessionFeatureEnabled,
  touchAdminSession,
} from '@/lib/adminSession'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminSessionFeatureEnabled()) {
    return NextResponse.json({ ok: true, bypass: true })
  }

  const cookieStore = await cookies()
  const adminSessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!adminSessionId) {
    return NextResponse.json({ error: 'Admin session missing' }, { status: 401 })
  }

  const active = await isAdminSessionActive(adminSessionId)
  if (!active) {
    return NextResponse.json({ error: 'Admin session expired' }, { status: 401 })
  }

  await touchAdminSession(adminSessionId, user.id)
  return NextResponse.json({ ok: true })
}
