import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  isAdminSessionActive,
  isAdminSessionFeatureEnabled,
} from '@/lib/adminSession'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options: _options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if ((isAdminPage || isAdminApi) && !user) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin-session TTL enforcement (10 minutes since last heartbeat).
  // Created on first /admin page access and refreshed by /api/admin/heartbeat.
  if (isAdminPage && user && isAdminSessionFeatureEnabled()) {
    const adminSessionId = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

    if (!adminSessionId) {
      const sessionId = crypto.randomUUID()
      await createAdminSession(sessionId, user.id)
      response.cookies.set(ADMIN_SESSION_COOKIE, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      return response
    }

    const active = await isAdminSessionActive(adminSessionId)
    if (!active) {
      const redirectRes = NextResponse.redirect(
        new URL('/login?reason=admin-expired', request.url)
      )
      redirectRes.cookies.set(ADMIN_SESSION_COOKIE, '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
      })
      return redirectRes
    }
  }

  if (isAdminApi && user && isAdminSessionFeatureEnabled()) {
    const adminSessionId = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!adminSessionId) {
      return NextResponse.json({ error: 'Admin session missing' }, { status: 401 })
    }

    const active = await isAdminSessionActive(adminSessionId)
    if (!active) {
      const res = NextResponse.json({ error: 'Admin session expired' }, { status: 401 })
      res.cookies.set(ADMIN_SESSION_COOKIE, '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
      })
      return res
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}