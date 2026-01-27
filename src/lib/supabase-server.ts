import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseDatabase } from '@/types/database.types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<SupabaseDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}